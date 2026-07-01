'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Github, ExternalLink, Star } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { AdminCrudTable, FormDialog } from '@/components/admin/AdminCrudTable'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import type { Project } from '@/types'

const schema = z.object({
  title: z.string().min(1, 'Required'),
  short_description: z.string().max(500).optional(),
  description: z.string().optional(),
  tech_stack: z.string().optional(), // comma-separated
  github_url: z.string().url().optional().or(z.literal('')),
  live_demo_url: z.string().url().optional().or(z.literal('')),
  status: z.enum(['planning', 'in-progress', 'completed', 'archived']).default('planning'),
  category: z.string().optional(),
  is_featured: z.boolean().default(false),
  is_open_source: z.boolean().default(true),
  sort_order: z.number().default(0),
})
type FormData = z.infer<typeof schema>

const STATUS_COLORS: Record<string, string> = {
  'planning': 'text-blue-500 bg-blue-500/10',
  'in-progress': 'text-yellow-500 bg-yellow-500/10',
  'completed': 'text-green-500 bg-green-500/10',
  'archived': 'text-muted-foreground bg-muted',
}

export default function AdminProjectsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: () => adminApi.listProjects(),
  })
  const projects = ((data as { data?: Project[] })?.data ?? [])

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'planning', is_featured: false, is_open_source: true, sort_order: 0 },
  })

  const openAdd = () => {
    reset({ status: 'planning', is_featured: false, is_open_source: true, sort_order: 0 })
    setEditingProject(null)
    setDialogOpen(true)
  }

  const openEdit = (project: Project) => {
    setEditingProject(project)
    reset({
      title: project.title,
      short_description: project.short_description ?? '',
      description: project.description ?? '',
      tech_stack: project.tech_stack?.join(', ') ?? '',
      github_url: project.github_url ?? '',
      live_demo_url: project.live_demo_url ?? '',
      status: (project.status ?? 'planning') as FormData['status'],
      category: project.category ?? '',
      is_featured: project.is_featured,
      is_open_source: project.is_open_source,
      sort_order: project.sort_order,
    })
    setDialogOpen(true)
  }

  const saveMutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        ...data,
        tech_stack: data.tech_stack ? data.tech_stack.split(',').map((t) => t.trim()).filter(Boolean) : [],
        github_url: data.github_url || null,
        live_demo_url: data.live_demo_url || null,
      }
      return editingProject ? adminApi.updateProject(editingProject.id, payload) : adminApi.createProject(payload)
    },
    onSuccess: () => {
      toast.success(editingProject ? 'Project updated' : 'Project created')
      qc.invalidateQueries({ queryKey: ['admin-projects'] })
      qc.invalidateQueries({ queryKey: ['projects'] })
      setDialogOpen(false)
    },
    onError: () => toast.error('Failed to save project'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteProject(id),
    onSuccess: () => { toast.success('Project deleted'); qc.invalidateQueries({ queryKey: ['admin-projects'] }) },
    onError: () => toast.error('Failed to delete'),
  })

  const columns = [
    {
      key: 'title',
      label: 'Project',
      render: (p: Project) => (
        <div className="flex items-center gap-2">
          {p.is_featured && <Star className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />}
          <span className="font-medium">{p.title}</span>
        </div>
      ),
    },
    { key: 'category', label: 'Category', render: (p: Project) => p.category ?? '—' },
    {
      key: 'status',
      label: 'Status',
      render: (p: Project) => (
        <Badge variant="outline" className={`text-xs capitalize border-0 ${STATUS_COLORS[p.status ?? 'planning']}`}>
          {p.status ?? 'planning'}
        </Badge>
      ),
    },
    {
      key: 'tech_stack',
      label: 'Tech',
      render: (p: Project) => (
        <div className="flex flex-wrap gap-1">
          {(p.tech_stack ?? []).slice(0, 3).map((t) => (
            <span key={t} className="text-xs px-1.5 py-0.5 bg-muted rounded font-mono">{t}</span>
          ))}
          {(p.tech_stack?.length ?? 0) > 3 && <span className="text-xs text-muted-foreground">+{(p.tech_stack?.length ?? 0) - 3}</span>}
        </div>
      ),
    },
    {
      key: 'links',
      label: 'Links',
      render: (p: Project) => (
        <div className="flex gap-2">
          {p.github_url && <a href={p.github_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Github className="w-3.5 h-3.5" /></a>}
          {p.live_demo_url && <a href={p.live_demo_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><ExternalLink className="w-3.5 h-3.5" /></a>}
        </div>
      ),
    },
    { key: 'view_count', label: 'Views', render: (p: Project) => p.view_count.toLocaleString() },
  ]

  return (
    <>
      <AdminCrudTable
        title="Projects"
        description="Manage your portfolio projects."
        data={projects}
        columns={columns}
        isLoading={isLoading}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={(id) => deleteMutation.mutateAsync(id)}
        searchable
        searchKeys={['title', 'category']}
        addLabel="Add Project"
      />

      <FormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingProject ? 'Edit Project' : 'Add Project'}
        onSubmit={handleSubmit((d) => saveMutation.mutate(d))}
        isSubmitting={saveMutation.isPending}
      >
        <div className="space-y-1.5">
          <Label>Title *</Label>
          <Input placeholder="Project name" {...register('title')} />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Short Description</Label>
          <Input placeholder="One-line summary (shown in cards)" {...register('short_description')} />
        </div>

        <div className="space-y-1.5">
          <Label>Full Description</Label>
          <Textarea placeholder="Detailed project description (markdown supported)" rows={4} {...register('description')} className="resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select onValueChange={(v) => setValue('status', v as FormData['status'])} defaultValue={watch('status')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['planning', 'in-progress', 'completed', 'archived'].map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Input placeholder="Blockchain, Full Stack..." {...register('category')} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Tech Stack (comma-separated)</Label>
          <Input placeholder="Rust, Solana, React, PostgreSQL" {...register('tech_stack')} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>GitHub URL</Label>
            <Input placeholder="https://github.com/..." {...register('github_url')} />
          </div>
          <div className="space-y-1.5">
            <Label>Live Demo URL</Label>
            <Input placeholder="https://..." {...register('live_demo_url')} />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch id="featured" checked={watch('is_featured')} onCheckedChange={(v) => setValue('is_featured', v)} />
            <Label htmlFor="featured" className="cursor-pointer">Featured</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="opensource" checked={watch('is_open_source')} onCheckedChange={(v) => setValue('is_open_source', v)} />
            <Label htmlFor="opensource" className="cursor-pointer">Open Source</Label>
          </div>
        </div>
      </FormDialog>
    </>
  )
}
