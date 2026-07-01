'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import { Trophy, ExternalLink } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { AdminCrudTable, FormDialog } from '@/components/admin/AdminCrudTable'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import type { Achievement } from '@/types'

const CATEGORIES = [
  'Hackathon', 'Competition', 'Academic', 'Open Source',
  'Community', 'Award', 'Publication', 'Other',
]

const schema = z.object({
  title: z.string().min(1, 'Required'),
  description: z.string().optional(),
  category: z.string().optional(),
  date: z.string().optional(),
  organization: z.string().optional(),
  proof_url: z.string().url().optional().or(z.literal('')),
  icon: z.string().optional(),
  is_featured: z.boolean().default(false),
  sort_order: z.number().default(0),
})
type FormData = z.infer<typeof schema>

export default function AdminAchievementsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Achievement | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-achievements'],
    queryFn: () => adminApi.listAchievements(),
  })
  const achievements = ((data as { data?: Achievement[] })?.data ?? [])

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_featured: false, sort_order: 0 },
  })

  const openAdd = () => {
    reset({ is_featured: false, sort_order: 0 })
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (a: Achievement) => {
    setEditing(a)
    reset({
      title: a.title,
      description: a.description ?? '',
      category: a.category ?? '',
      date: a.date?.slice(0, 10) ?? '',
      organization: a.organization ?? '',
      proof_url: a.proof_url ?? '',
      icon: a.icon ?? '',
      is_featured: a.is_featured,
      sort_order: a.sort_order,
    })
    setDialogOpen(true)
  }

  const saveMutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        ...data,
        date: data.date || null,
        proof_url: data.proof_url || null,
      }
      return editing
        ? adminApi.updateAchievement(editing.id, payload)
        : adminApi.createAchievement(payload)
    },
    onSuccess: () => {
      toast.success(editing ? 'Achievement updated' : 'Achievement added')
      qc.invalidateQueries({ queryKey: ['admin-achievements'] })
      qc.invalidateQueries({ queryKey: ['achievements'] })
      setDialogOpen(false)
    },
    onError: () => toast.error('Failed to save'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteAchievement(id),
    onSuccess: () => {
      toast.success('Achievement deleted')
      qc.invalidateQueries({ queryKey: ['admin-achievements'] })
    },
    onError: () => toast.error('Failed to delete'),
  })

  const columns = [
    {
      key: 'title',
      label: 'Achievement',
      render: (a: Achievement) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-4 h-4 text-yellow-500" />
          </div>
          <div>
            <p className="font-medium text-sm">{a.title}</p>
            {a.organization && (
              <p className="text-xs text-muted-foreground">{a.organization}</p>
            )}
          </div>
          {a.is_featured && (
            <Badge className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/20 ml-1">
              ★
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (a: Achievement) =>
        a.category ? (
          <Badge variant="outline" className="text-xs">{a.category}</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'date',
      label: 'Date',
      render: (a: Achievement) =>
        a.date ? (
          <span className="text-xs text-muted-foreground">
            {format(parseISO(a.date), 'MMM yyyy')}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'proof_url',
      label: 'Proof',
      render: (a: Achievement) =>
        a.proof_url ? (
          <a
            href={a.proof_url}
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
        title="Achievements"
        description="Showcase your wins, awards, and notable accomplishments."
        data={achievements}
        columns={columns}
        isLoading={isLoading}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={(id) => deleteMutation.mutateAsync(id)}
        searchable
        searchKeys={['title', 'organization', 'category']}
        addLabel="Add Achievement"
      />

      <FormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? 'Edit Achievement' : 'Add Achievement'}
        onSubmit={handleSubmit((d) => saveMutation.mutate(d))}
        isSubmitting={saveMutation.isPending}
      >
        <div className="space-y-1.5">
          <Label>Title *</Label>
          <Input placeholder="1st Place — SRM Hackathon 2024" {...register('title')} />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Input
              placeholder="Hackathon, Competition…"
              list="achievement-categories"
              {...register('category')}
            />
            <datalist id="achievement-categories">
              {CATEGORIES.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div className="space-y-1.5">
            <Label>Organization</Label>
            <Input placeholder="SRM University" {...register('organization')} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" {...register('date')} />
          </div>
          <div className="space-y-1.5">
            <Label>Sort Order</Label>
            <Input
              type="number"
              min="0"
              {...register('sort_order', { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea
            placeholder="Brief description of the achievement…"
            rows={3}
            className="resize-none"
            {...register('description')}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Proof / Certificate URL</Label>
          <Input
            placeholder="https://devfolio.co/certificates/..."
            {...register('proof_url')}
          />
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
