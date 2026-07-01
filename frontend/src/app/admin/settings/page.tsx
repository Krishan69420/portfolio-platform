'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Save, Loader2, Settings, Lock, Globe } from 'lucide-react'
import { adminApi, authApi } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

interface SiteSettings {
  site_title?: string
  site_description?: string
  maintenance_mode?: string
  analytics_enabled?: string
  contact_enabled?: string
  blog_enabled?: string
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({})
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminApi.getSettings(),
  })

  useEffect(() => {
    if (data) {
      const raw = (data as { data?: Record<string, string> })?.data ?? {}
      setSettings(raw)
    }
  }, [data])

  const settingsMutation = useMutation({
    mutationFn: (vals: SiteSettings) => adminApi.updateSettings(vals),
    onSuccess: () => {
      toast.success('Settings saved')
      qc.invalidateQueries({ queryKey: ['admin-settings'] })
    },
    onError: () => toast.error('Failed to save settings'),
  })

  const passwordMutation = useMutation({
    mutationFn: ({ current, next }: { current: string; next: string }) =>
      authApi.changePassword(current, next),
    onSuccess: () => {
      toast.success('Password changed. Please log in again.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    },
    onError: () => toast.error('Failed to change password. Check current password.'),
  })

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    passwordMutation.mutate({ current: currentPassword, next: newPassword })
  }

  const toggle = (key: keyof SiteSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: prev[key] === 'true' ? 'false' : 'true',
    }))
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Site configuration and security</p>
        </div>
      </div>

      {/* Site settings */}
      <div className="p-6 rounded-2xl border border-border bg-card space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4 text-primary" />
          <h2 className="font-semibold">Site Configuration</h2>
        </div>

        <div className="space-y-1.5">
          <Label>Site Title</Label>
          <Input
            placeholder="Krishan Kumar | Software Engineer"
            value={settings.site_title ?? ''}
            onChange={(e) => setSettings((p) => ({ ...p, site_title: e.target.value }))}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Site Description</Label>
          <Input
            placeholder="Software Engineer specializing in Rust and Solana"
            value={settings.site_description ?? ''}
            onChange={(e) => setSettings((p) => ({ ...p, site_description: e.target.value }))}
          />
        </div>

        <div className="space-y-3 pt-2">
          {[
            { key: 'maintenance_mode' as const, label: 'Maintenance Mode', desc: 'Show a maintenance page to visitors' },
            { key: 'analytics_enabled' as const, label: 'Analytics Tracking', desc: 'Track page views and visitor data' },
            { key: 'contact_enabled' as const, label: 'Contact Form', desc: 'Allow visitors to send messages' },
            { key: 'blog_enabled' as const, label: 'Blog Section', desc: 'Show blog posts on public portfolio' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-2 border-t border-border/50 first:border-0">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <Switch
                checked={settings[key] === 'true'}
                onCheckedChange={() => toggle(key)}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={() => settingsMutation.mutate(settings)}
            disabled={settingsMutation.isPending}
            className="gap-2"
          >
            {settingsMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Settings
          </Button>
        </div>
      </div>

      {/* Change password */}
      <div className="p-6 rounded-2xl border border-border bg-card space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-primary" />
          <h2 className="font-semibold">Change Password</h2>
        </div>

        <div className="space-y-1.5">
          <Label>Current Password</Label>
          <Input
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>New Password</Label>
          <Input
            type="password"
            placeholder="Min 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Confirm New Password</Label>
          <Input
            type="password"
            placeholder="Repeat new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handlePasswordChange}
            disabled={passwordMutation.isPending || !currentPassword || !newPassword}
            variant="outline"
            className="gap-2"
          >
            {passwordMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            Update Password
          </Button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="p-6 rounded-2xl border border-destructive/20 bg-destructive/3 space-y-3">
        <h2 className="font-semibold text-destructive">Danger Zone</h2>
        <p className="text-sm text-muted-foreground">
          These actions are irreversible. Handle with care.
        </p>
        <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive" disabled>
          Reset All Analytics Data
        </Button>
      </div>
    </div>
  )
}
