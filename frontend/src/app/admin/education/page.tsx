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
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import type { Education } from '@/types'

const schema = z.object({
  institution_name: z.string().min(1, 'Required'),
  degree: z.string().optional(),
  field_of_study: z.string().optional(),
  specialization: z.string().optional(),
  location: z.string().optional(),
  start_date: z.string().min(1, 'Required'),
  end_date: z.string().optional(),
  is_current: z.boolean().default(false),
  cgpa: z.number().min(0).max(10).optional(),
  max_cgpa: z.number().min(0).max(10).optional(),
  percentage: z.number().min(0).max(100).optional(),
  description: z.string().optional(),
  institution_url: z.string().url().optional().or(z.literal('')),
  sort_order: z.number().default(0),
})
type FormData = z.infer<typeof schema>

export default function AdminEducationPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEdu, setEditingEdu] = useState<Education | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-education'],
    queryFn: () => adminApi.listEducation(),
  })
  const education = ((data as { data?: Education[] })?.data ?? [])

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_current: false, sort_order: 0 },
  })

  const openAdd = () => {
    reset({ is_current: false, sort_order: 0 })
    setEditingEdu(null)
    setDialogOpen(true)
  }

  const openEdit = (edu: Education) => {
    setEditingEdu(edu)
    reset({
      institution_name: edu.institution_name,
      degree: edu.degree ?? '',
      field_of_study: edu.field_of_study ?? '',
      specialization: edu.specialization ?? '',
      location: edu.location ?? '',
      start_date: edu.start_date.slice(0, 10),
      end_date: edu.end_date?.slice(0, 10) ?? '',
      is_current: edu.is_current,
      cgpa: edu.cgpa ?? undefined,
      max_cgpa: edu.max_cgpa ?? undefined,
      percentage: edu.percentage ?? undefined,
      description: edu.description ?? '',
      institution_url: edu.institution_url ?? '',
      sort_order: 0,
    })
    setDialogOpen(true)
  }

  const saveMutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        ...data,
        end_date: data.end_date || null,
        institution_url: data.institution_url || null,
      }
      return editingEdu
        ? adminApi.updateEducation(editingEdu.id, payload)
        : adminApi.createEducation(payload)
    },
    onSuccess: () => {
      toast.success(editingEdu ? 'Education updated' : 'Education added')
      qc.invalidateQueries({ queryKey: ['admin-education'] })
      qc.invalidateQueries({ queryKey: ['education'] })
      setDialogOpen(false)
    },
    onError: () => toast.error('Failed to save'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteEducation(id),
    onSuccess: () => {
      toast.success('Deleted')
      qc.invalidateQueries({ queryKey: ['admin-education'] })
    },
    onError: () => toast.error('Failed to delete'),
  })

  const columns = [
    {
      key: 'institution_name',
      label: 'Institution',
      render: (edu: Education) => (
        <div>
          <p className="font-medium text-sm">{edu.institution_name}</p>
          {edu.degree && (
            <p className="text-xs text-muted-foreground">
              {edu.degree}{edu.field_of_study ? ` · ${edu.field_of_study}` : ''}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'dates',
      label: 'Period',
      render: (edu: Education) => (
        <span className="text-xs text-muted-foreground">
          {format(parseISO(edu.start_date), 'yyyy')} —{' '}
          {edu.is_current ? 'Present' : edu.end_date ? format(parseISO(edu.end_date), 'yyyy') : '?'}
        </span>
      ),
    },
    {
      key: 'cgpa',
      label: 'CGPA',
      render: (edu: Education) =>
        edu.cgpa != null ? (
          <span className="text-sm font-medium text-primary">
            {edu.cgpa}/{edu.max_cgpa ?? 10}
          </span>
        ) : '—',
    },
    {
      key: 'is_current',
      label: 'Status',
      render: (edu: Education) => edu.is_current ? (
        <Badge className="text-xs bg-green-500/10 text-green-500 border-green-500/20">Current</Badge>
      ) : (
        <span className="text-xs text-muted-foreground">Completed</span>
      ),
    },
  ]

  return (
    <>
      <AdminCrudTable
        title="Education"
        description="Manage your academic background and qualifications."
        data={education}
        columns={columns}
        isLoading={isLoading}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={(id) => deleteMutation.mutateAsync(id)}
        searchable
        searchKeys={['institution_name', 'degree']}
        addLabel="Add Education"
      />

      <FormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingEdu ? 'Edit Education' : 'Add Education'}
        onSubmit={handleSubmit((d) => saveMutation.mutate(d))}
        isSubmitting={saveMutation.isPending}
      >
        <div className="space-y-1.5">
          <Label>Institution Name *</Label>
          <Input placeholder="SRM Institute of Science and Technology" {...register('institution_name')} />
          {errors.institution_name && <p className="text-xs text-destructive">{errors.institution_name.message}</p>}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Degree</Label>
            <Input placeholder="Bachelor of Technology" {...register('degree')} />
          </div>
          <div className="space-y-1.5">
            <Label>Field of Study</Label>
            <Input placeholder="Computer Science and Engineering" {...register('field_of_study')} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Specialization</Label>
          <Input placeholder="Artificial Intelligence and Machine Learning" {...register('specialization')} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Start Date *</Label>
            <Input type="date" {...register('start_date')} />
          </div>
          <div className="space-y-1.5">
            <Label>End Date</Label>
            <Input type="date" {...register('end_date')} disabled={watch('is_current')} />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>CGPA</Label>
            <Input type="number" step="0.01" min="0" max="10" placeholder="8.5" {...register('cgpa', { valueAsNumber: true })} />
          </div>
          <div className="space-y-1.5">
            <Label>Max CGPA</Label>
            <Input type="number" step="0.01" min="0" max="10" placeholder="10" {...register('max_cgpa', { valueAsNumber: true })} />
          </div>
          <div className="space-y-1.5">
            <Label>Percentage</Label>
            <Input type="number" step="0.01" min="0" max="100" placeholder="85.5" {...register('percentage', { valueAsNumber: true })} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Location</Label>
          <Input placeholder="Chennai, Tamil Nadu, India" {...register('location')} />
        </div>

        <div className="space-y-1.5">
          <Label>Institution URL</Label>
          <Input placeholder="https://srmist.edu.in" {...register('institution_url')} />
        </div>

        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea placeholder="Additional notes about your studies..." rows={2} className="resize-none" {...register('description')} />
        </div>

        <div className="flex items-center gap-2">
          <Switch id="current" checked={watch('is_current')} onCheckedChange={(v) => setValue('is_current', v)} />
          <Label htmlFor="current" className="cursor-pointer">Currently studying here</Label>
        </div>
      </FormDialog>
    </>
  )
}
