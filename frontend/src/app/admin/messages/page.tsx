'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Mail, MailOpen, Trash2, AlertTriangle, Eye, ArrowLeft, Loader2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { toast } from 'sonner'
import { adminApi } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import type { ContactMessage } from '@/types'

export default function AdminMessagesPage() {
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<ContactMessage | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-messages', page],
    queryFn: () => adminApi.listMessages({ page, per_page: 20 }),
  })

  const messages = ((data as { data?: ContactMessage[] })?.data ?? [])
  const pagination = (data as { pagination?: { total: number } })?.pagination

  const markReadMutation = useMutation({
    mutationFn: (id: string) => adminApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-messages'] }),
  })
  const markSpamMutation = useMutation({
    mutationFn: (id: string) => adminApi.markSpam(id),
    onSuccess: () => { toast.success('Marked as spam'); qc.invalidateQueries({ queryKey: ['admin-messages'] }) },
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteMessage(id),
    onSuccess: () => { toast.success('Message deleted'); qc.invalidateQueries({ queryKey: ['admin-messages'] }) },
  })

  const openMessage = async (msg: ContactMessage) => {
    setSelected(msg)
    if (!msg.is_read) {
      markReadMutation.mutate(msg.id)
    }
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Messages</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {pagination?.total ?? 0} total • {messages.filter((m) => !m.is_read).length} unread
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : messages.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground rounded-2xl border border-dashed border-border">
          <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No messages yet</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className={`flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer ${!msg.is_read ? 'bg-primary/3' : ''}`}
              onClick={() => openMessage(msg)}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${!msg.is_read ? 'bg-primary/10' : 'bg-muted'}`}>
                {msg.is_read ? <MailOpen className="w-4 h-4 text-muted-foreground" /> : <Mail className="w-4 h-4 text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-sm font-medium ${!msg.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {msg.sender_name}
                  </span>
                  <span className="text-xs text-muted-foreground">&lt;{msg.sender_email}&gt;</span>
                  {!msg.is_read && <Badge className="text-xs bg-primary text-white ml-auto">New</Badge>}
                </div>
                {msg.subject && <p className="text-sm font-medium truncate">{msg.subject}</p>}
                <p className="text-xs text-muted-foreground truncate">{msg.message}</p>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className="text-xs text-muted-foreground">
                  {format(parseISO(msg.created_at), 'MMM d')}
                </span>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-orange-500" onClick={() => markSpamMutation.mutate(msg.id)}>
                    <AlertTriangle className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(msg.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Message detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              {selected?.subject ?? 'Message'}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-muted/30 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">From</p>
                  <p className="font-medium">{selected.sender_name}</p>
                  <p className="text-muted-foreground">{selected.sender_email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Received</p>
                  <p className="font-medium">{format(parseISO(selected.created_at), 'PPpp')}</p>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-border bg-background min-h-24">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" size="sm" asChild className="gap-2">
                  <a href={`mailto:${selected.sender_email}?subject=Re: ${selected.subject ?? 'Your Message'}`}>
                    Reply via Email
                  </a>
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2 text-orange-500 hover:text-orange-600" onClick={() => { markSpamMutation.mutate(selected.id); setSelected(null) }}>
                    <AlertTriangle className="w-4 h-4" /> Spam
                  </Button>
                  <Button variant="destructive" size="sm" className="gap-2" onClick={() => { deleteMutation.mutate(selected.id); setSelected(null) }}>
                    <Trash2 className="w-4 h-4" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
