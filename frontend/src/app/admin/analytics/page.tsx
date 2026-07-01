'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { Eye, Download, MessageSquare, FolderKanban, TrendingUp, TrendingDown } from 'lucide-react'
import { adminApi } from '@/lib/api'
import type { AnalyticsOverview } from '@/types'

const COLORS = ['hsl(var(--primary))', '#9945FF', '#14F195', '#3B82F6', '#F59E0B']

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  color = 'primary',
}: {
  label: string
  value: number | string
  sub?: string
  icon: React.ElementType
  trend?: 'up' | 'down'
  color?: string
}) {
  const colorMap: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    green: 'bg-green-500/10 text-green-500',
    purple: 'bg-purple-500/10 text-purple-500',
    blue: 'bg-blue-500/10 text-blue-500',
    orange: 'bg-orange-500/10 text-orange-500',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl border border-border bg-card"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorMap[color] ?? colorMap.primary}`}>
          <Icon className="w-4 h-4" />
        </div>
        {trend && (
          <span className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend === 'up' ? '+' : '-'}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </motion.div>
  )
}

export default function AdminAnalyticsPage() {
  const { data: overviewRes, isLoading: loadingOverview } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: () => adminApi.getOverview(),
    refetchInterval: 60_000,
  })
  const { data: chartRes, isLoading: loadingChart } = useQuery({
    queryKey: ['admin-views-chart'],
    queryFn: () => adminApi.getViewsChart(),
  })
  const { data: projectRes } = useQuery({
    queryKey: ['admin-project-stats'],
    queryFn: () => adminApi.getProjectStats(),
  })

  const overview = (overviewRes as { data?: AnalyticsOverview })?.data
  const rawChart = (chartRes as { data?: Array<{ date: string; views: number }> })?.data ?? []
  const chartData = rawChart.map((d) => ({
    ...d,
    date: format(parseISO(d.date), 'MMM d'),
  }))
  const projectData =
    (projectRes as { data?: Array<{ title: string; views: number }> })?.data ?? []

  // Period comparisons
  const weekVsMonth =
    overview && overview.views_this_month > 0
      ? Math.round((overview.views_this_week / overview.views_this_month) * 100)
      : 0

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Portfolio performance and visitor insights
        </p>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Page Views"
          value={overview?.total_views ?? 0}
          icon={Eye}
          color="blue"
          trend="up"
        />
        <MetricCard
          label="Views Today"
          value={overview?.views_today ?? 0}
          sub="Last 24 hours"
          icon={Eye}
          color="green"
        />
        <MetricCard
          label="This Week"
          value={overview?.views_this_week ?? 0}
          sub={`${weekVsMonth}% of monthly`}
          icon={TrendingUp}
          color="purple"
        />
        <MetricCard
          label="This Month"
          value={overview?.views_this_month ?? 0}
          icon={TrendingUp}
          color="orange"
        />
        <MetricCard
          label="Resume Downloads"
          value={overview?.resume_downloads ?? 0}
          icon={Download}
          color="primary"
        />
        <MetricCard
          label="Projects"
          value={overview?.total_projects ?? 0}
          icon={FolderKanban}
          color="blue"
        />
        <MetricCard
          label="Total Messages"
          value={overview?.total_messages ?? 0}
          sub={`${overview?.unread_messages ?? 0} unread`}
          icon={MessageSquare}
          color={overview?.unread_messages ? 'orange' : 'primary'}
        />
        <MetricCard
          label="Skills Listed"
          value={overview?.total_skills ?? 0}
          icon={TrendingUp}
          color="green"
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* 30-day views area chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-border bg-card">
          <h2 className="font-semibold mb-0.5">Page Views — Last 30 Days</h2>
          <p className="text-xs text-muted-foreground mb-6">Daily unique visits to your portfolio</p>
          {loadingChart ? (
            <div className="h-56 skeleton rounded-xl" />
          ) : chartData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">
              No view data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="hsl(var(--primary))"
                  fill="url(#grad)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top projects bar chart */}
        <div className="p-6 rounded-2xl border border-border bg-card">
          <h2 className="font-semibold mb-0.5">Top Projects</h2>
          <p className="text-xs text-muted-foreground mb-6">By total view count</p>
          {projectData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">
              No project data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={projectData.slice(0, 6)} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="title"
                  tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  width={72}
                  tickFormatter={(v: string) => v.length > 10 ? v.slice(0, 10) + '…' : v}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top projects list */}
      {overview?.top_projects && overview.top_projects.length > 0 && (
        <div className="p-6 rounded-2xl border border-border bg-card">
          <h2 className="font-semibold mb-4">Project Performance</h2>
          <div className="space-y-3">
            {overview.top_projects.map((p, i) => {
              const maxViews = overview.top_projects[0].view_count
              const pct = maxViews > 0 ? (p.view_count / maxViews) * 100 : 0
              return (
                <div key={p.id} className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground w-4 text-right">{i + 1}</span>
                  <span className="text-sm flex-1 truncate font-medium">{p.title}</span>
                  <div className="flex items-center gap-2 w-40">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {p.view_count.toLocaleString()} views
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
