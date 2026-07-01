'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import { BookOpen, Eye } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { AdminCrudTable, FormDialog } from '@/components/admin/AdminCrudTable'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import type { BlogPost } from '@/types'

const schema = z.object({
  title: z.string().min(1, 'Required'),
  excerpt: z.string().max(300).optional(),
  content: z.string().optional(),
  cover_image_url: z.string().url().optional().or(z.literal('')),
  tags: z.string().optional(), // comma-separated
  is_published: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  read_time_minutes: z.number().min(1).max(120).optional(),
})
type FormData = z.infer<typeof schema>

export default function AdminBlogPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-blog'],
    queryFn: () => adminApi.listBlogPosts(),
  })
  const posts = ((data as { data?: BlogPost[] })?.data ?? [])

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_published: false, is_featured: false },
  })

  const openAdd = () => {
    reset({ is_published: false, is_featured: false })
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (post: BlogPost) => {
    setEditing(post)
    reset({
      title: post.title,
      excerpt: post.excerpt ?? '',
      content: post.content ?? '',
      cover_image_url: post.cover_image_url ?? '',
      tags: post.tags?.join(', ') ?? '',
      is_published: post.is_published,
      is_featured: post.is_featured,
      read_time_minutes: post.read_time_minutes ?? undefined,
    })
    setDialogOpen(true)
  }

  const saveMutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        cover_image_url: data.cover_image_url || null,
      }
      return editing
        ? adminApi.updateBlogPost(editing.id, payload)
        : adminApi.createBlogPost(payload)
    },
    onSuccess: () => {
      toast.success(editing ? 'Post updated' : 'Post created')
      qc.invalidateQueries({ queryKey: ['admin-blog'] })
      qc.invalidateQueries({ queryKey: ['blog'] })
      setDialogOpen(false)
    },
    onError: () => toast.error('Failed to save'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteBlogPost(id),
    onSuccess: () => {
      toast.success('Post deleted')
      qc.invalidateQueries({ queryKey: ['admin-blog'] })
    },
    onError: () => toast.error('Failed to delete'),
  })

  const columns = [
    {
      key: 'title',
      label: 'Post',
      render: (post: BlogPost) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate max-w-64">{post.title}</p>
            {post.tags && post.tags.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {post.tags.slice(0, 3).join(', ')}
              </p>
            )}
          </div>
          {post.is_featured && (
            <Badge className="text-xs bg-primary/10 text-primary border-primary/20 flex-shrink-0">
              ★
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'is_published',
      label: 'Status',
      render: (post: BlogPost) => (
        <Badge
          variant="outline"
          className={
            post.is_published
              ? 'text-green-500 border-green-500/20 bg-green-500/5'
              : 'text-muted-foreground border-border'
          }
        >
          {post.is_published ? 'Published' : 'Draft'}
        </Badge>
      ),
    },
    {
      key: 'read_time_minutes',
      label: 'Read Time',
      render: (post: BlogPost) =>
        post.read_time_minutes ? (
          <span className="text-xs text-muted-foreground">{post.read_time_minutes} min</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'view_count',
      label: 'Views',
      render: (post: BlogPost) => (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Eye className="w-3 h-3" />
          {post.view_count.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'published_at',
      label: 'Published',
      render: (post: BlogPost) =>
        post.published_at ? (
          <span className="text-xs text-muted-foreground">
            {format(parseISO(post.published_at), 'MMM d, yyyy')}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ]

  return (
    <>
      <AdminCrudTable
        title="Blog Posts"
        description="Write and manage articles for your portfolio blog."
        data={posts}
        columns={columns}
        isLoading={isLoading}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={(id) => deleteMutation.mutateAsync(id)}
        searchable
        searchKeys={['title']}
        addLabel="New Post"
      />

      <FormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? 'Edit Post' : 'New Post'}
        onSubmit={handleSubmit((d) => saveMutation.mutate(d))}
        isSubmitting={saveMutation.isPending}
      >
        <div className="space-y-1.5">
          <Label>Title *</Label>
          <Input placeholder="Building a REST API in Rust with Axum" {...register('title')} />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Excerpt</Label>
          <Textarea
            placeholder="A short summary shown in listings (max 300 chars)"
            rows={2}
            className="resize-none"
            {...register('excerpt')}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Content (Markdown)</Label>
          <Textarea
            placeholder="# Introduction&#10;&#10;Write your post content here in Markdown..."
            rows={8}
            className="resize-none font-mono text-xs"
            {...register('content')}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Cover Image URL</Label>
            <Input placeholder="https://images.unsplash.com/..." {...register('cover_image_url')} />
          </div>
          <div className="space-y-1.5">
            <Label>Read Time (minutes)</Label>
            <Input
              type="number"
              min="1"
              max="120"
              placeholder="5"
              {...register('read_time_minutes', { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Tags (comma-separated)</Label>
          <Input placeholder="Rust, Axum, Backend, API" {...register('tags')} />
        </div>

        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <Switch
              id="published"
              checked={watch('is_published')}
              onCheckedChange={(v) => setValue('is_published', v)}
            />
            <Label htmlFor="published" className="cursor-pointer">Published</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="featured"
              checked={watch('is_featured')}
              onCheckedChange={(v) => setValue('is_featured', v)}
            />
            <Label htmlFor="featured" className="cursor-pointer">Featured</Label>
          </div>
        </div>
      </FormDialog>
    </>
  )
}
