'use client'

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { User, Save, Loader2 } from 'lucide-react'
import { adminApi, portfolioApi } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { PersonalInfo } from '@/types'

const schema = z.object({
  full_name: z.string().min(1, 'Required'),
  title: z.string().min(1, 'Required'),
  tagline: z.string().max(200).optional(),
  bio: z.string().optional(),
  short_bio: z.string().max(500).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  location: z.string().optional(),
  availability_status: z.string().optional(),
  website_url: z.string().url().optional().or(z.literal('')),
})
type FormData = z.infer<typeof schema>

export default function AdminPersonalPage() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['personal-info'],
    queryFn: () => portfolioApi.getPersonalInfo(),
  })
  const info = (data as { data?: PersonalInfo })?.data

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (info) {
      reset({
        full_name: info.full_name,
        title: info.title,
        tagline: info.tagline ?? '',
        bio: info.bio ?? '',
        short_bio: info.short_bio ?? '',
        email: info.email ?? '',
        phone: info.phone ?? '',
        location: info.location ?? '',
        availability_status: info.availability_status ?? '',
        website_url: info.website_url ?? '',
      })
    }
  }, [info, reset])

  const mutation = useMutation({
    mutationFn: (data: FormData) => adminApi.updatePersonal(data),
    onSuccess: () => {
      toast.success('Personal info updated')
      qc.invalidateQueries({ queryKey: ['personal-info'] })
    },
    onError: () => toast.error('Failed to update'),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Personal Information</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your public profile shown on the portfolio homepage.
          </p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <User className="w-7 h-7 text-primary" />
        </div>
      </div>

      <form
        onSubmit={handleSubmit((d) => mutation.mutate(d))}
        className="space-y-5 p-6 rounded-2xl border border-border bg-card"
      >
        {/* Name & Title */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Full Name *</Label>
            <Input placeholder="Krishan Kumar" {...register('full_name')} />
            {errors.full_name && (
              <p className="text-xs text-destructive">{errors.full_name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Professional Title *</Label>
            <Input placeholder="Software Engineer & Blockchain Developer" {...register('title')} />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>
        </div>

        {/* Tagline */}
        <div className="space-y-1.5">
          <Label>Tagline</Label>
          <Input
            placeholder="Building fast, secure systems in Rust & Solana"
            {...register('tagline')}
          />
          <p className="text-xs text-muted-foreground">
            Short phrase shown in the hero section under your name.
          </p>
        </div>

        {/* Short Bio */}
        <div className="space-y-1.5">
          <Label>Short Bio</Label>
          <Textarea
            placeholder="One or two sentences describing you (shown in hero section)"
            rows={2}
            className="resize-none"
            {...register('short_bio')}
          />
          {errors.short_bio && (
            <p className="text-xs text-destructive">{errors.short_bio.message}</p>
          )}
        </div>

        {/* Full Bio */}
        <div className="space-y-1.5">
          <Label>Full Bio</Label>
          <Textarea
            placeholder="Your detailed biography for the About section..."
            rows={5}
            className="resize-none"
            {...register('bio')}
          />
        </div>

        {/* Contact info */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" placeholder="you@example.com" {...register('email')} />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input placeholder="+91 98765 43210" {...register('phone')} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Location</Label>
            <Input placeholder="Chennai, Tamil Nadu, India" {...register('location')} />
          </div>
          <div className="space-y-1.5">
            <Label>Availability Status</Label>
            <Input
              placeholder="Open to opportunities"
              {...register('availability_status')}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Website URL</Label>
          <Input placeholder="https://yourdomain.com" {...register('website_url')} />
          {errors.website_url && (
            <p className="text-xs text-destructive">{errors.website_url.message}</p>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={mutation.isPending || !isDirty}
            className="gap-2 min-w-32"
          >
            {mutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {mutation.isPending ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
