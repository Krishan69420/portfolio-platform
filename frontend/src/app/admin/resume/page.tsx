'use client'

import { useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import { Upload, Download, FileText, CheckCircle2, Clock, Loader2 } from 'lucide-react'
import { adminApi, api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ResumeVersion } from '@/types'

export default function AdminResumePage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-resume-versions'],
    queryFn: () => adminApi.listResumeVersions(),
  })
  const versions = ((data as { data?: ResumeVersion[] })?.data ?? [])
  const current = versions.find((v) => v.is_current)

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return api.post('/api/admin/resume', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: () => {
      toast.success('Resume uploaded and set as current version')
      qc.invalidateQueries({ queryKey: ['admin-resume-versions'] })
    },
    onError: () => toast.error('Failed to upload resume'),
  })

  const activateMutation = useMutation({
    mutationFn: (id: string) => adminApi.activateResumeVersion(id),
    onSuccess: () => {
      toast.success('Resume version activated')
      qc.invalidateQueries({ queryKey: ['admin-resume-versions'] })
    },
    onError: () => toast.error('Failed to activate'),
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are accepted')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large (max 10 MB)')
      return
    }
    uploadMutation.mutate(file)
    e.target.value = ''
  }

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold">Resume Management</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Upload and manage resume versions. The active version is served to visitors.
        </p>
      </div>

      {/* Upload area */}
      <div
        className="border-2 border-dashed border-border rounded-2xl p-10 text-center hover:border-primary/40 transition-colors cursor-pointer group"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
          {uploadMutation.isPending ? (
            <Loader2 className="w-7 h-7 text-primary animate-spin" />
          ) : (
            <Upload className="w-7 h-7 text-primary" />
          )}
        </div>
        <p className="font-medium mb-1">
          {uploadMutation.isPending ? 'Uploading…' : 'Click to upload resume'}
        </p>
        <p className="text-sm text-muted-foreground">PDF only, max 10 MB</p>
      </div>

      {/* Current version highlight */}
      {current && (
        <div className="p-5 rounded-2xl border border-green-500/20 bg-green-500/5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <h2 className="font-semibold text-green-500">Active Resume</h2>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-sm">{current.file_name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                v{current.version_number} · {formatBytes(current.file_size)} ·{' '}
                {format(parseISO(current.uploaded_at), 'PP')}
              </p>
              <p className="text-xs text-muted-foreground">
                {current.download_count.toLocaleString()} downloads
              </p>
            </div>
            <a
              href={current.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-green-600 hover:underline"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </a>
          </div>
        </div>
      )}

      {/* Version history */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : versions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-2xl">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No resume uploaded yet</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-muted/30">
            <h2 className="text-sm font-semibold">Version History</h2>
          </div>
          <div className="divide-y divide-border">
            {versions.map((v) => (
              <div key={v.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{v.file_name}</p>
                    {v.is_current && (
                      <Badge className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    v{v.version_number} · {formatBytes(v.file_size)} ·{' '}
                    {format(parseISO(v.uploaded_at), 'PP')} ·{' '}
                    {v.download_count} downloads
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!v.is_current && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => activateMutation.mutate(v.id)}
                      disabled={activateMutation.isPending}
                    >
                      Set Active
                    </Button>
                  )}
                  <a
                    href={v.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
