'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { adminApi } from '@/lib/api'
import { AdminCrudTable, FormDialog } from '@/components/admin/AdminCrudTable'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import type { Skill } from '@/types'

const schema = z.object({
  name: z.string().min(1, 'Required'),
  category: z.string().min(1, 'Required'),
  experience_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  years_of_experience: z.number().min(0).max(50).optional(),
  icon_color: z.string().optional(),
  proficiency_score: z.number().min(0).max(100).optional(),
  is_featured: z.boolean().default(false),
  is_currently_learning: z.boolean().default(false),
  sort_order: z.number().default(0),
})
type FormData = z.infer<typeof schema>

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-blue-500/10 text-blue-500',
  intermediate: 'bg-yellow-500/10 text-yellow-500',
  advanced: 'bg-orange-500/10 text-orange-500',
  expert: 'bg-primary/10 text-primary',
}

export default function AdminSkillsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-skills'],
    queryFn: () => adminApi.listSkills(),
  })
  const skills = ((data as { data?: Skill[] })?.data ?? [])

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_featured: false, is_currently_learning: false, sort_order: 0 },
  })

  const openAdd = () => { reset({ is_featured: false, is_currently_learning: false, sort_order: 0 }); setEditingSkill(null); setDialogOpen(true) }
  const openEdit = (skill: Skill) => {
    setEditingSkill(skill)
    reset({
      name: skill.name,
      category: skill.category,
      experience_level: skill.experience_level as FormData['experience_level'],
      years_of_experience: skill.years_of_experience ?? undefined,
      icon_color: skill.icon_color ?? undefined,
      proficiency_score: skill.proficiency_score ?? undefined,
      is_featured: skill.is_featured,
      is_currently_learning: skill.is_currently_learning,
      sort_order: skill.sort_order,
    })
    setDialogOpen(true)
  }

  const saveMutation = useMutation({
    mutationFn: (data: FormData) =>
      editingSkill ? adminApi.updateSkill(editingSkill.id, data) : adminApi.createSkill(data),
    onSuccess: () => {
      toast.success(editingSkill ? 'Skill updated' : 'Skill added')
      qc.invalidateQueries({ queryKey: ['admin-skills'] })
      qc.invalidateQueries({ queryKey: ['skills'] })
      setDialogOpen(false)
    },
    onError: () => toast.error('Failed to save skill'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteSkill(id),
    onSuccess: () => {
      toast.success('Skill deleted')
      qc.invalidateQueries({ queryKey: ['admin-skills'] })
    },
    onError: () => toast.error('Failed to delete'),
  })

  const columns = [
    {
      key: 'name',
      label: 'Skill',
      render: (skill: Skill) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: skill.icon_color ?? '#6366f1' }}>
            {skill.name.slice(0, 1)}
          </div>
          <span className="font-medium">{skill.name}</span>
          {skill.is_featured && <Badge className="text-xs bg-primary/10 text-primary border-primary/20">★</Badge>}
          {skill.is_currently_learning && <Badge variant="outline" className="text-xs text-blue-500 border-blue-500/20">learning</Badge>}
        </div>
      ),
    },
    { key: 'category', label: 'Category' },
    {
      key: 'experience_level',
      label: 'Level',
      render: (skill: Skill) => skill.experience_level ? (
        <Badge variant="outline" className={`text-xs capitalize border-0 ${LEVEL_COLORS[skill.experience_level]}`}>
          {skill.experience_level}
        </Badge>
      ) : '—',
    },
    {
      key: 'proficiency_score',
      label: 'Proficiency',
      render: (skill: Skill) => skill.proficiency_score != null ? (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-muted rounded-full w-20">
            <div className="h-full bg-primary rounded-full" style={{ width: `${skill.proficiency_score}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">{skill.proficiency_score}%</span>
        </div>
      ) : '—',
    },
  ]

  return (
    <>
      <AdminCrudTable
        title="Skills"
        description="Manage your technical skills and expertise levels."
        data={skills}
        columns={columns}
        isLoading={isLoading}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={(id) => deleteMutation.mutateAsync(id)}
        searchable
        searchKeys={['name', 'category']}
        addLabel="Add Skill"
      />

      <FormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingSkill ? 'Edit Skill' : 'Add Skill'}
        onSubmit={handleSubmit((d) => saveMutation.mutate(d))}
        isSubmitting={saveMutation.isPending}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Skill Name *</Label>
            <Input placeholder="e.g. Rust" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Category *</Label>
            <Input placeholder="e.g. Systems, Frontend" {...register('category')} />
            {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Experience Level</Label>
            <Select onValueChange={(v) => setValue('experience_level', v as FormData['experience_level'])} defaultValue={watch('experience_level')}>
              <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
              <SelectContent>
                {['beginner', 'intermediate', 'advanced', 'expert'].map((l) => (
                  <SelectItem key={l} value={l} className="capitalize">{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Years of Experience</Label>
            <Input type="number" step="0.5" min="0" placeholder="1.5" {...register('years_of_experience', { valueAsNumber: true })} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Proficiency Score (0–100)</Label>
            <Input type="number" min="0" max="100" placeholder="75" {...register('proficiency_score', { valueAsNumber: true })} />
          </div>
          <div className="space-y-1.5">
            <Label>Icon Color</Label>
            <div className="flex gap-2">
              <Input type="color" className="w-12 h-10 p-1 cursor-pointer" {...register('icon_color')} />
              <Input placeholder="#CE412B" {...register('icon_color')} />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Sort Order</Label>
          <Input type="number" min="0" placeholder="0" {...register('sort_order', { valueAsNumber: true })} />
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch
              id="featured"
              checked={watch('is_featured')}
              onCheckedChange={(v) => setValue('is_featured', v)}
            />
            <Label htmlFor="featured" className="cursor-pointer">Featured skill</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="learning"
              checked={watch('is_currently_learning')}
              onCheckedChange={(v) => setValue('is_currently_learning', v)}
            />
            <Label htmlFor="learning" className="cursor-pointer">Currently learning</Label>
          </div>
        </div>
      </FormDialog>
    </>
  )
}
