'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Flame, TrendingUp, Target, Plus, CheckCircle2, Circle } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { AdminCrudTable, FormDialog } from '@/components/admin/AdminCrudTable'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { LearningTopic } from '@/types'

const schema = z.object({
  name: z.string().min(1, 'Required'),
  category: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  icon_color: z.string().optional(),
  progress_percentage: z.number().min(0).max(100).default(0),
  status: z.enum(['not-started', 'in-progress', 'completed', 'paused']).default('not-started'),
  is_featured: z.boolean().default(false),
  sort_order: z.number().default(0),
})
type FormData = z.infer<typeof schema>

const STATUS_COLORS: Record<string, string> = {
  'not-started': 'text-muted-foreground bg-muted',
  'in-progress': 'text-yellow-500 bg-yellow-500/10',
  'completed': 'text-green-500 bg-green-500/10',
  'paused': 'text-orange-500 bg-orange-500/10',
}

export default function AdminLearningPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTopic, setEditingTopic] = useState<LearningTopic | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-learning'],
    queryFn: () => adminApi.listLearning(),
  })
  const topics = ((data as { data?: LearningTopic[] })?.data ?? [])

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'not-started', is_featured: false, progress_percentage: 0, sort_order: 0 },
  })

  const openAdd = () => {
    reset({ status: 'not-started', is_featured: false, progress_percentage: 0, sort_order: 0 })
    setEditingTopic(null)
    setDialogOpen(true)
  }

  const openEdit = (topic: LearningTopic) => {
    setEditingTopic(topic)
    reset({
      name: topic.name,
      category: topic.category ?? '',
      description: topic.description ?? '',
      icon: topic.icon ?? '',
      icon_color: topic.icon_color ?? '',
      progress_percentage: topic.progress_percentage,
      status: (topic.status ?? 'not-started') as FormData['status'],
      is_featured: topic.is_featured,
      sort_order: topic.sort_order,
    })
    setDialogOpen(true)
  }

  const saveMutation = useMutation({
    mutationFn: (data: FormData) =>
      editingTopic ? adminApi.updateLearning(editingTopic.id, data) : adminApi.createLearning(data),
    onSuccess: () => {
      toast.success(editingTopic ? 'Topic updated' : 'Topic added')
      qc.invalidateQueries({ queryKey: ['admin-learning'] })
      qc.invalidateQueries({ queryKey: ['learning-topics'] })
      setDialogOpen(false)
    },
    onError: () => toast.error('Failed to save'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteLearning(id),
    onSuccess: () => { toast.success('Topic deleted'); qc.invalidateQueries({ queryKey: ['admin-learning'] }) },
    onError: () => toast.error('Failed to delete'),
  })

  const columns = [
    {
      key: 'name',
      label: 'Topic',
      render: (t: LearningTopic) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: t.icon_color ?? '#6366f1' }}>
            {t.name.slice(0, 2)}
          </div>
          <div>
            <p className="font-medium text-sm">{t.name}</p>
            {t.category && <p className="text-xs text-muted-foreground">{t.category}</p>}
          </div>
          {t.is_featured && <Badge className="text-xs bg-primary/10 text-primary border-primary/20 ml-1">★</Badge>}
        </div>
      ),
    },
    {
      key: 'progress_percentage',
      label: 'Progress',
      render: (t: LearningTopic) => (
        <div className="flex items-center gap-2 min-w-28">
          <div className="flex-1 h-1.5 bg-muted rounded-full">
            <div className="h-full bg-primary rounded-full" style={{ width: `${t.progress_percentage}%` }} />
          </div>
          <span className="text-xs text-muted-foreground w-8">{t.progress_percentage}%</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (t: LearningTopic) => (
        <Badge variant="outline" className={`text-xs capitalize border-0 ${STATUS_COLORS[t.status ?? 'not-started']}`}>
          {t.status?.replace('-', ' ') ?? 'not started'}
        </Badge>
      ),
    },
    {
      key: 'current_streak_days',
      label: 'Streak',
      render: (t: LearningTopic) => t.current_streak_days > 0 ? (
        <span className="flex items-center gap-1 text-orange-500 text-xs">
          <Flame className="w-3 h-3" /> {t.current_streak_days}d
        </span>
      ) : <span className="text-xs text-muted-foreground">—</span>,
    },
  ]

  return (
    <>
      <AdminCrudTable
        title="Learning Roadmap"
        description="Track your learning progress across technologies and skills."
        data={topics}
        columns={columns}
        isLoading={isLoading}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={(id) => deleteMutation.mutateAsync(id)}
        searchable
        searchKeys={['name', 'category']}
        addLabel="Add Topic"
      />

      <FormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingTopic ? 'Edit Learning Topic' : 'Add Learning Topic'}
        onSubmit={handleSubmit((d) => saveMutation.mutate(d))}
        isSubmitting={saveMutation.isPending}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 col-span-2">
            <Label>Topic Name *</Label>
            <Input placeholder="e.g. Rust Programming" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Input placeholder="e.g. Systems, Blockchain" {...register('category')} />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select onValueChange={(v) => setValue('status', v as FormData['status'])} defaultValue={watch('status')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['not-started', 'in-progress', 'completed', 'paused'].map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s.replace('-', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Progress: {watch('progress_percentage')}%</Label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            className="w-full accent-primary"
            {...register('progress_percentage', { valueAsNumber: true })}
          />
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-solana-light rounded-full transition-all"
              style={{ width: `${watch('progress_percentage')}%` }}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea placeholder="What are you learning and why?" rows={3} {...register('description')} className="resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Icon Color</Label>
            <div className="flex gap-2">
              <Input type="color" className="w-12 h-10 p-1 cursor-pointer" {...register('icon_color')} />
              <Input placeholder="#9945FF" {...register('icon_color')} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Sort Order</Label>
            <Input type="number" min="0" {...register('sort_order', { valueAsNumber: true })} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch id="featured" checked={watch('is_featured')} onCheckedChange={(v) => setValue('is_featured', v)} />
          <Label htmlFor="featured" className="cursor-pointer">Show as featured on portfolio</Label>
        </div>
      </FormDialog>
    </>
  )
}
