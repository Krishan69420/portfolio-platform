'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Github, Linkedin, Twitter, Mail, ExternalLink } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { AdminCrudTable, FormDialog } from '@/components/admin/AdminCrudTable'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import type { SocialLink } from '@/types'

const PLATFORMS = [
  'github', 'linkedin', 'twitter', 'email', 'instagram',
  'youtube', 'discord', 'telegram', 'phone', 'website', 'custom',
]

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  email: Mail,
}

const schema = z.object({
  platform: z.string().min(1, 'Required'),
  url: z.string().min(1, 'Required'),
  display_name: z.string().optional(),
  icon: z.string().optional(),
  is_visible: z.boolean().default(true),
  sort_order: z.number().default(0),
})
type FormData = z.infer<typeof schema>

export default function AdminSocialLinksPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-social-links'],
    queryFn: () => adminApi.listSocialLinks(),
  })
  const links = ((data as { data?: SocialLink[] })?.data ?? [])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_visible: true, sort_order: 0 },
  })

  const openAdd = () => {
    reset({ is_visible: true, sort_order: 0 })
    setEditingLink(null)
    setDialogOpen(true)
  }

  const openEdit = (link: SocialLink) => {
    setEditingLink(link)
    reset({
      platform: link.platform,
      url: link.url,
      display_name: link.display_name ?? '',
      icon: link.icon ?? '',
      is_visible: link.is_visible,
      sort_order: link.sort_order,
    })
    setDialogOpen(true)
  }

  const saveMutation = useMutation({
    mutationFn: (data: FormData) =>
      editingLink
        ? adminApi.updateSocialLink(editingLink.id, data)
        : adminApi.createSocialLink(data),
    onSuccess: () => {
      toast.success(editingLink ? 'Link updated' : 'Link added')
      qc.invalidateQueries({ queryKey: ['admin-social-links'] })
      qc.invalidateQueries({ queryKey: ['social-links'] })
      setDialogOpen(false)
    },
    onError: () => toast.error('Failed to save'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteSocialLink(id),
    onSuccess: () => {
      toast.success('Link deleted')
      qc.invalidateQueries({ queryKey: ['admin-social-links'] })
    },
    onError: () => toast.error('Failed to delete'),
  })

  const columns = [
    {
      key: 'platform',
      label: 'Platform',
      render: (link: SocialLink) => {
        const Icon = PLATFORM_ICONS[link.platform] ?? ExternalLink
        return (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
              <Icon className="w-3.5 h-3.5" />
            </div>
            <span className="font-medium capitalize">{link.platform}</span>
          </div>
        )
      },
    },
    {
      key: 'display_name',
      label: 'Display Name',
      render: (link: SocialLink) => link.display_name ?? '—',
    },
    {
      key: 'url',
      label: 'URL',
      render: (link: SocialLink) => (
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline text-xs truncate max-w-48 block"
        >
          {link.url}
        </a>
      ),
    },
    {
      key: 'is_visible',
      label: 'Visible',
      render: (link: SocialLink) => (
        <Badge
          variant="outline"
          className={link.is_visible ? 'text-green-500 border-green-500/20' : 'text-muted-foreground'}
        >
          {link.is_visible ? 'Shown' : 'Hidden'}
        </Badge>
      ),
    },
    {
      key: 'sort_order',
      label: 'Order',
      render: (link: SocialLink) => (
        <span className="text-muted-foreground text-xs">{link.sort_order}</span>
      ),
    },
  ]

  return (
    <>
      <AdminCrudTable
        title="Social Links"
        description="Manage social profiles and contact links shown on your portfolio."
        data={links}
        columns={columns}
        isLoading={isLoading}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={(id) => deleteMutation.mutateAsync(id)}
        searchable
        searchKeys={['platform', 'display_name']}
        addLabel="Add Link"
      />

      <FormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingLink ? 'Edit Social Link' : 'Add Social Link'}
        onSubmit={handleSubmit((d) => saveMutation.mutate(d))}
        isSubmitting={saveMutation.isPending}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Platform *</Label>
            <Select
              onValueChange={(v) => setValue('platform', v)}
              defaultValue={watch('platform')}
            >
              <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.platform && (
              <p className="text-xs text-destructive">{errors.platform.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Display Name</Label>
            <Input placeholder="GitHub" {...register('display_name')} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>URL *</Label>
          <Input placeholder="https://github.com/yourusername" {...register('url')} />
          {errors.url && <p className="text-xs text-destructive">{errors.url.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Icon (optional)</Label>
            <Input placeholder="github" {...register('icon')} />
            <p className="text-xs text-muted-foreground">Lucide icon name</p>
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

        <div className="flex items-center gap-2">
          <Switch
            id="visible"
            checked={watch('is_visible')}
            onCheckedChange={(v) => setValue('is_visible', v)}
          />
          <Label htmlFor="visible" className="cursor-pointer">
            Show on public portfolio
          </Label>
        </div>
      </FormDialog>
    </>
  )
}
