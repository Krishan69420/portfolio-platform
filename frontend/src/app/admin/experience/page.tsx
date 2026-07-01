'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import { adminApi } from '@/lib/api'
import { AdminCrudTable, FormDialog } from '@/components/admin/AdminCrudTable'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import type { Experience } from '@/types'

const EMPLOYMENT_TYPES = ['full-time', 'part-time', 'internship', 'contract', 'freelance']

const schema = z.object({
  company_name: z.string().min(1, 'Required'),
  role: z.string().min(1, 'Required'),
  employment_type: z.string().optional(),
  location: z.string().optional(),
  is_remote: z.boolean().default(false),
  is_current: z.boolean().default(false),
  start_date: z.string().min(1, 'Required'),
  end_date: z.string().optional(),
  description: z.string().optional(),
  tech_stack: z.string().optional(), // comma-separated
  company_url: z.string().url().optional().or(z.literal('')),
  sort_order: z.number().default(0),
})
type FormData = z.infer<typeof schema>

export default function AdminExperiencePage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingExp, setEditingExp] = useState<Experience | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-experience'],
    queryFn: () => adminApi.listExperience(),
  })
  const experience = ((data as { data?: Experience[] })?.data ?? [])

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_remote: false, is_current: false, sort_order: 0 },
  })

  const openAdd = () => {
    reset({ is_remote: false, is_current: false, sort_order: 0 })
    setEditingExp(null)
    setDialogOpen(true)
  }

  const openEdit = (exp: Experience) => {
    setEditingExp(exp)
    reset({
      company_name: exp.company_name,
      role: exp.role,
      employment_type: exp.employment_type ?? '',
      location: exp.location ?? '',
      is_remote: exp.is_remote,
      is_current: exp.is_current,
      start_date: exp.start_date.slice(0, 10),
      end_date: exp.end_date?.slice(0, 10) ?? '',
      description: exp.description ?? '',
      tech_stack: exp.tech_stack?.join(', ') ?? '',
      company_url: exp.company_url ?? '',
      sort_order: exp.sort_order,
    })
    setDialogOpen(true)
  }

  const saveMutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        ...data,
        tech_stack: data.tech_stack
          ? data.tech_stack.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        end_date: data.end_date || null,
        company_url: data.company_url || null,
      }
      return editingExp
        ? adminApi.updateExperience(editingExp.id, payload)
        : adminApi.createExperience(payload)
    },
    onSuccess: () => {
      toast.success(editingExp ? 'Experience updated' : 'Experience added')
      qc.invalidateQueries({ queryKey: ['admin-experience'] })
      qc.invalidateQueries({ queryKey: ['experience'] })
      setDialogOpen(false)
    },
    onError: () => toast.error('Failed to save'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteExperience(id),
    onSuccess: () => {
      toast.success('Experience deleted')
      qc.invalidateQueries({ queryKey: ['admin-experience'] })
    },
    onError: () => toast.error('Failed to delete'),
  })

  const columns = [
    {
      key: 'role',
      label: 'Role',
      render: (exp: Experience) => (
        <div>
          <p className="font-medium text-sm">{exp.role}</p>
          <p className="text-xs text-primary">{exp.company_name}</p>
        </div>
      ),
    },
    {
      key: 'employment_type',
      label: 'Type',
      render: (exp: Experience) => exp.employment_type ? (
        <Badge variant="outline" className="text-xs capitalize">{exp.employment_type}</Badge>
      ) : '—',
    },
    {
      key: 'dates',
      label: 'Period',
      render: (exp: Experience) => (
        <span className="text-xs text-muted-foreground">
          {format(parseISO(exp.start_date), 'MMM yyyy')} —{' '}
          {exp.is_current ? 'Present' : exp.end_date ? format(parseISO(exp.end_date), 'MMM yyyy') : '?'}
        </span>
      ),
    },
    {
      key: 'is_current',
      label: 'Status',
      render: (exp: Experience) => exp.is_current ? (
        <Badge className="text-xs bg-green-500/10 text-green-500 border-green-500/20">Current</Badge>
      ) : (
        <span className="text-xs text-muted-foreground">Past</span>
      ),
    },
  ]

  return (
    <>
      <AdminCrudTable
        title="Experience"
        description="Manage your work history shown in the timeline."
        data={experience}
        columns={columns}
        isLoading={isLoading}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={(id) => deleteMutation.mutateAsync(id)}
        searchable
        searchKeys={['company_name', 'role']}
        addLabel="Add Experience"
      />

      <FormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingExp ? 'Edit Experience' : 'Add Experience'}
        onSubmit={handleSubmit((d) => saveMutation.mutate(d))}
        isSubmitting={saveMutation.isPending}
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Company Name *</Label>
            <Input placeholder="Acme Corp" {...register('company_name')} />
            {errors.company_name && <p className="text-xs text-destructive">{errors.company_name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Role *</Label>
            <Input placeholder="Software Engineer" {...register('role')} />
            {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Employment Type</Label>
            <Select onValueChange={(v) => setValue('employment_type', v)} defaultValue={watch('employment_type')}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Location</Label>
            <Input placeholder="Chennai, India" {...register('location')} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Start Date *</Label>
            <Input type="date" {...register('start_date')} />
            {errors.start_date && <p className="text-xs text-destructive">{errors.start_date.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>End Date</Label>
            <Input type="date" {...register('end_date')} disabled={watch('is_current')} />
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <Switch id="current" checked={watch('is_current')} onCheckedChange={(v) => setValue('is_current', v)} />
            <Label htmlFor="current" className="cursor-pointer">Current position</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="remote" checked={watch('is_remote')} onCheckedChange={(v) => setValue('is_remote', v)} />
            <Label htmlFor="remote" className="cursor-pointer">Remote</Label>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea placeholder="Describe your responsibilities and achievements..." rows={3} className="resize-none" {...register('description')} />
        </div>

        <div className="space-y-1.5">
          <Label>Tech Stack (comma-separated)</Label>
          <Input placeholder="Rust, PostgreSQL, Docker" {...register('tech_stack')} />
        </div>

        <div className="space-y-1.5">
          <Label>Company URL</Label>
          <Input placeholder="https://company.com" {...register('company_url')} />
        </div>
      </FormDialog>
    </>
  )
}
