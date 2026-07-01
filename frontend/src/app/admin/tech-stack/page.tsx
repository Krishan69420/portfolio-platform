'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Layers } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { AdminCrudTable, FormDialog } from '@/components/admin/AdminCrudTable'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import type { TechStack } from '@/types'

const CATEGORIES = [
  'Language', 'Framework', 'Database', 'DevOps', 'Blockchain',
  'Cloud', 'Styling', 'Testing', 'Tool', 'Other',
]

const schema = z.object({
  name: z.string().min(1, 'Required'),
  category: z.string().min(1, 'Required'),
  icon: z.string().optional(),
  icon_color: z.string().optional(),
  proficiency_score: z.number().min(0).max(100).optional(),
  is_primary: z.boolean().default(false),
  is_visible: z.boolean().default(true),
  sort_order: z.number().default(0),
})
type FormData = z.infer<typeof schema>

export default function AdminTechStackPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<TechStack | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tech-stack'],
    queryFn: () => adminApi.listTechStack(),
  })
  const stack = ((data as { data?: TechStack[] })?.data ?? [])

  // Group by primary/secondary
  const primary = stack.filter((t) => t.is_primary)
  const secondary = stack.filter((t) => !t.is_primary)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_primary: false, is_visible: true, sort_order: 0 },
  })

  const openAdd = () => {
    reset({ is_primary: false, is_visible: true, sort_order: 0 })
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (tech: TechStack) => {
    setEditing(tech)
    reset({
      name: tech.name,
      category: tech.category,
      icon: tech.icon ?? '',
      icon_color: tech.icon_color ?? '',
      proficiency_score: tech.proficiency_score ?? undefined,
      is_primary: tech.is_primary,
      is_visible: tech.is_visible,
      sort_order: tech.sort_order,
    })
    setDialogOpen(true)
  }

  const saveMutation = useMutation({
    mutationFn: (data: FormData) =>
      editing
        ? adminApi.updateTechStack(editing.id, data)
        : adminApi.createTechStack(data),
    onSuccess: () => {
      toast.success(editing ? 'Tech updated' : 'Tech added')
      qc.invalidateQueries({ queryKey: ['admin-tech-stack'] })
      qc.invalidateQueries({ queryKey: ['tech-stack'] })
      setDialogOpen(false)
    },
    onError: () => toast.error('Failed to save'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteTechStack(id),
    onSuccess: () => {
      toast.success('Deleted')
      qc.invalidateQueries({ queryKey: ['admin-tech-stack'] })
    },
    onError: () => toast.error('Failed to delete'),
  })

  const columns = [
    {
      key: 'name',
      label: 'Technology',
      render: (t: TechStack) => (
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${t.icon_color ?? '#6366f1'}20` }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: t.icon_color ?? '#6366f1' }}
            />
          </div>
          <div>
            <p className="font-medium text-sm">{t.name}</p>
            <p className="text-xs text-muted-foreground">{t.category}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'is_primary',
      label: 'Type',
      render: (t: TechStack) => (
        <Badge
          variant="outline"
          className={
            t.is_primary
              ? 'text-primary border-primary/20 bg-primary/5'
              : 'text-muted-foreground'
          }
        >
          {t.is_primary ? 'Primary' : 'Secondary'}
        </Badge>
      ),
    },
    {
      key: 'proficiency_score',
      label: 'Proficiency',
      render: (t: TechStack) =>
        t.proficiency_score != null ? (
          <div className="flex items-center gap-2 min-w-24">
            <div className="flex-1 h-1.5 bg-muted rounded-full">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${t.proficiency_score}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-8">{t.proficiency_score}%</span>
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'is_visible',
      label: 'Visible',
      render: (t: TechStack) => (
        <Badge
          variant="outline"
          className={
            t.is_visible
              ? 'text-green-500 border-green-500/20'
              : 'text-muted-foreground'
          }
        >
          {t.is_visible ? 'Shown' : 'Hidden'}
        </Badge>
      ),
    },
  ]

  return (
    <>
      <AdminCrudTable
        title="Tech Stack"
        description="Manage the technologies displayed on your portfolio. Primary items are highlighted."
        data={stack}
        columns={columns}
        isLoading={isLoading}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={(id) => deleteMutation.mutateAsync(id)}
        searchable
        searchKeys={['name', 'category']}
        addLabel="Add Technology"
      />

      <FormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? 'Edit Technology' : 'Add Technology'}
        onSubmit={handleSubmit((d) => saveMutation.mutate(d))}
        isSubmitting={saveMutation.isPending}
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input placeholder="Rust" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Category *</Label>
            <Input
              placeholder="Language, Framework…"
              list="tech-categories"
              {...register('category')}
            />
            <datalist id="tech-categories">
              {CATEGORIES.map((c) => <option key={c} value={c} />)}
            </datalist>
            {errors.category && (
              <p className="text-xs text-destructive">{errors.category.message}</p>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Icon Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                className="w-12 h-10 p-1 cursor-pointer"
                {...register('icon_color')}
              />
              <Input placeholder="#CE412B" {...register('icon_color')} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Proficiency (0–100)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              placeholder="85"
              {...register('proficiency_score', { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Sort Order</Label>
          <Input
            type="number"
            min="0"
            placeholder="0"
            {...register('sort_order', { valueAsNumber: true })}
          />
        </div>

        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <Switch
              id="primary"
              checked={watch('is_primary')}
              onCheckedChange={(v) => setValue('is_primary', v)}
            />
            <Label htmlFor="primary" className="cursor-pointer">Primary stack</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="visible"
              checked={watch('is_visible')}
              onCheckedChange={(v) => setValue('is_visible', v)}
            />
            <Label htmlFor="visible" className="cursor-pointer">Visible</Label>
          </div>
        </div>
      </FormDialog>
    </>
  )
}
