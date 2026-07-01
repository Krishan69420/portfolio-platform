'use client'

import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  Eye, FolderKanban, Code2, MessageSquare, Download, TrendingUp,
  ArrowUpRight, Mail, Star,
} from 'lucide-react'
import Link from 'next/link'
import { adminApi } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { AnalyticsOverview } from '@/types'
import { format, parseISO } from 'date-fns'

function StatCard({ label, value, icon: Icon, delta, color = 'primary', href }: {
  label: string; value: number | string; icon: React.ElementType
  delta?: string; color?: string; href?: string
}) {
  const colorMap: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    green: 'bg-green-500/10 text-green-500',
    blue: 'bg-blue-500/10 text-blue-500',
    orange: 'bg-orange-500/10 text-orange-500',
    purple: 'bg-purple-500/10 text-purple-500',
    yellow: 'bg-yellow-500/10 text-yellow-500',
  }

  const card = (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="p-5 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color] ?? colorMap.primary}`}>
          <Icon className="w-5 h-5" />
        </div>
        {delta && (
          <Badge variant="outline" className="text-xs text-green-500 border-green-500/20 bg-green-500/5 gap-1">
            <TrendingUp className="w-3 h-3" /> {delta}
          </Badge>
        )}
      </div>
      <p className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </motion.div>
  )

  return href ? <Link href={href}>{card}</Link> : card
}

export default function AdminDashboardPage() {
  const { data: overviewRes, isLoading } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: () => adminApi.getOverview(),
    refetchInterval: 60_000,
  })
  const { data: chartRes } = useQuery({
    queryKey: ['admin-views-chart'],
    queryFn: () => adminApi.getViewsChart(),
  })
  const { data: projectRes } = useQuery({
    queryKey: ['admin-project-stats'],
    queryFn: () => adminApi.getProjectStats(),
  })

  const overview = (overviewRes as { data?: AnalyticsOverview })?.data
  const chartData = ((chartRes as { data?: Array<{ date: string; views: number }> })?.data ?? [])
    .map((d) => ({ ...d, date: format(parseISO(d.date), 'MMM d') }))
  const projectData = (projectRes as { data?: Array<{ title: string; views: number }> })?.data ?? []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-32 rounded-2xl skeleton" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link href="/" target="_blank"><ArrowUpRight className="w-4 h-4" /> View Site</Link>
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Views" value={overview?.total_views ?? 0} icon={Eye} color="blue" />
        <StatCard label="Views Today" value={overview?.views_today ?? 0} icon={TrendingUp} color="green" delta="+today" />
        <StatCard label="This Month" value={overview?.views_this_month ?? 0} icon={TrendingUp} color="purple" />
        <StatCard label="Resume Downloads" value={overview?.resume_downloads ?? 0} icon={Download} color="orange" href="/admin/resume" />
        <StatCard label="Projects" value={overview?.total_projects ?? 0} icon={FolderKanban} color="primary" href="/admin/projects" />
        <StatCard label="Skills" value={overview?.total_skills ?? 0} icon={Code2} color="primary" href="/admin/skills" />
        <StatCard
          label="Messages"
          value={overview?.total_messages ?? 0}
          icon={MessageSquare}
          color={overview?.unread_messages ? 'orange' : 'primary'}
          href="/admin/messages"
          delta={overview?.unread_messages ? `${overview.unread_messages} unread` : undefined}
        />
        <StatCard label="This Week" value={overview?.views_this_week ?? 0} icon={Eye} color="blue" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Views chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-border bg-card">
          <h2 className="font-semibold mb-1">Page Views (30 days)</h2>
          <p className="text-xs text-muted-foreground mb-6">Daily portfolio visits</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fill="url(#viewsGradient)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top projects */}
        <div className="p-6 rounded-2xl border border-border bg-card">
          <h2 className="font-semibold mb-1">Top Projects</h2>
          <p className="text-xs text-muted-foreground mb-6">By view count</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={projectData.slice(0, 5)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="title" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={80} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick actions */}
      <div className="p-6 rounded-2xl border border-border bg-card">
        <h2 className="font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Add Project', href: '/admin/projects', icon: FolderKanban },
            { label: 'Update Skills', href: '/admin/skills', icon: Code2 },
            { label: 'Upload Resume', href: '/admin/resume', icon: Download },
            { label: 'Read Messages', href: '/admin/messages', icon: Mail, badge: overview?.unread_messages },
            { label: 'Add Learning Topic', href: '/admin/learning', icon: Star },
          ].map((action) => (
            <Button key={action.href} variant="outline" size="sm" asChild className="gap-2">
              <Link href={action.href}>
                <action.icon className="w-4 h-4" />
                {action.label}
                {action.badge ? <Badge className="ml-1 text-xs bg-primary text-white">{action.badge}</Badge> : null}
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
