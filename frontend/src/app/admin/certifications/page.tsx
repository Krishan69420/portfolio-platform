'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import { BadgeCheck, ExternalLink } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { AdminCrudTable, FormDialog } from '@/components/admin/AdminCrudTable'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import type { Certification } from '@/types'

const schema = z.object({
  name: z.string().min(1, 'Required'),
  issuing_organization: z.string().min(1, 'Required'),
  issue_date: z.string().min(1, 'Required'),
  expiry_date: z.string().optional(),
  credential_id: z.string().optional(),
  credential_url: z.string().url().optional().or(z.literal('')),
  image_url: z.string().url().optional().or(z.literal('')),
  skills: z.string().optional(), // comma-separated
  is_featured: z.boolean().default(false),
  sort_order: z.number().default(0),
})
type FormData = z.infer<typeof schema>

export default function AdminCertificationsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Certification | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-certifications'],
    queryFn: () => adminApi.listCertifications(),
  })
  const certs = ((data as { data?: Certification[] })?.data ?? [])

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_featured: false, sort_order: 0 },
  })

  const openAdd = () => {
    reset({ is_featured: false, sort_order: 0 })
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (cert: Certification) => {
    setEditing(cert)
    reset({
      name: cert.name,
      issuing_organization: cert.issuing_organization,
      issue_date: cert.issue_date.slice(0, 10),
      expiry_date: cert.expiry_date?.slice(0, 10) ?? '',
      credential_id: cert.credential_id ?? '',
      credential_url: cert.credential_url ?? '',
      image_url: cert.image_url ?? '',
      skills: cert.skills?.join(', ') ?? '',
      is_featured: cert.is_featured,
      sort_order: cert.sort_order,
    })
    setDialogOpen(true)
  }

  const saveMutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        ...data,
        skills: data.skills ? data.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        expiry_date: data.expiry_date || null,
        credential_url: data.credential_url || null,
        image_url: data.image_url || null,
      }
      return editing
        ? adminApi.updateCertification(editing.id, payload)
        : adminApi.createCertification(payload)
    },
    onSuccess: () => {
      toast.success(editing ? 'Certification updated' : 'Certification added')
      qc.invalidateQueries({ queryKey: ['admin-certifications'] })
      qc.invalidateQueries({ queryKey: ['certifications'] })
      setDialogOpen(false)
    },
    onError: () => toast.error('Failed to save'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteCertification(id),
    onSuccess: () => {
      toast.success('Certification deleted')
      qc.invalidateQueries({ queryKey: ['admin-certifications'] })
    },
    onError: () => toast.error('Failed to delete'),
  })

  const columns = [
    {
      key: 'name',
      label: 'Certification',
      render: (cert: Certification) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <BadgeCheck className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">{cert.name}</p>
            <p className="text-xs text-muted-foreground">{cert.issuing_organization}</p>
          </div>
          {cert.is_featured && (
            <Badge className="text-xs bg-primary/10 text-primary border-primary/20 ml-1">★</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'issue_date',
      label: 'Issued',
      render: (cert: Certification) => (
        <span className="text-xs text-muted-foreground">
          {format(parseISO(cert.issue_date), 'MMM yyyy')}
        </span>
      ),
    },
    {
      key: 'expiry_date',
      label: 'Expires',
      render: (cert: Certification) =>
        cert.expiry_date ? (
          <span className="text-xs text-muted-foreground">
            {format(parseISO(cert.expiry_date), 'MMM yyyy')}
          </span>
        ) : (
          <span className="text-xs text-green-500">No expiry</span>
        ),
    },
    {
      key: 'skills',
      label: 'Skills',
      render: (cert: Certification) => (
        <div className="flex flex-wrap gap-1">
          {(cert.skills ?? []).slice(0, 3).map((s) => (
            <span key={s} className="text-xs px-1.5 py-0.5 bg-muted rounded font-mono">
              {s}
            </span>
          ))}
          {(cert.skills?.length ?? 0) > 3 && (
            <span className="text-xs text-muted-foreground">
              +{(cert.skills?.length ?? 0) - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'credential_url',
      label: 'Link',
      render: (cert: Certification) =>
        cert.credential_url ? (
          <a
            href={cert.credential_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ]

  return (
    <>
      <AdminCrudTable
        title="Certifications"
        description="Manage your professional certifications and credentials."
        data={certs}
        columns={columns}
        isLoading={isLoading}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={(id) => deleteMutation.mutateAsync(id)}
        searchable
        searchKeys={['name', 'issuing_organization']}
        addLabel="Add Certification"
      />

      <FormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? 'Edit Certification' : 'Add Certification'}
        onSubmit={handleSubmit((d) => saveMutation.mutate(d))}
        isSubmitting={saveMutation.isPending}
      >
        <div className="space-y-1.5">
          <Label>Certification Name *</Label>
          <Input placeholder="AWS Solutions Architect" {...register('name')} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Issuing Organization *</Label>
          <Input placeholder="Amazon Web Services" {...register('issuing_organization')} />
          {errors.issuing_organization && (
            <p className="text-xs text-destructive">{errors.issuing_organization.message}</p>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Issue Date *</Label>
            <Input type="date" {...register('issue_date')} />
            {errors.issue_date && (
              <p className="text-xs text-destructive">{errors.issue_date.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Expiry Date</Label>
            <Input type="date" {...register('expiry_date')} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Credential ID</Label>
            <Input placeholder="ABC123XYZ" {...register('credential_id')} />
          </div>
          <div className="space-y-1.5">
            <Label>Credential URL</Label>
            <Input placeholder="https://verify.example.com/cert/..." {...register('credential_url')} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Skills (comma-separated)</Label>
          <Input placeholder="AWS, Cloud Architecture, S3, Lambda" {...register('skills')} />
        </div>

        <div className="space-y-1.5">
          <Label>Badge Image URL</Label>
          <Input placeholder="https://images.credly.com/..." {...register('image_url')} />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="featured"
            checked={watch('is_featured')}
            onCheckedChange={(v) => setValue('is_featured', v)}
          />
          <Label htmlFor="featured" className="cursor-pointer">
            Feature on portfolio
          </Label>
        </div>
      </FormDialog>
    </>
  )
}
