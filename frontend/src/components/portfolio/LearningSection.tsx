'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useQuery } from '@tanstack/react-query'
import { Flame, Target, CheckCircle2, Circle, TrendingUp } from 'lucide-react'
import { portfolioApi } from '@/lib/api'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Badge } from '@/components/ui/badge'
import type { LearningTopic } from '@/types'

const STATUS_STYLES = {
  'not-started': 'text-muted-foreground border-muted-foreground/30 bg-muted/30',
  'in-progress': 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10',
  'completed': 'text-green-500 border-green-500/30 bg-green-500/10',
  'paused': 'text-orange-500 border-orange-500/30 bg-orange-500/10',
}

function LearningCard({ topic, index }: { topic: LearningTopic; index: number }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const statusStyle = STATUS_STYLES[topic.status ?? 'not-started']

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="relative p-5 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: topic.icon_color ?? '#6366f1' }}
          >
            {topic.name.slice(0, 2)}
          </div>
          <div>
            <h3 className="font-semibold text-sm">{topic.name}</h3>
            {topic.category && (
              <p className="text-xs text-muted-foreground">{topic.category}</p>
            )}
          </div>
        </div>
        <Badge variant="outline" className={`text-xs capitalize border ${statusStyle}`}>
          {topic.status?.replace('-', ' ') ?? 'Not Started'}
        </Badge>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>Progress</span>
          <span className="font-medium text-foreground">{topic.progress_percentage}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-solana-light"
            initial={{ width: 0 }}
            animate={inView ? { width: `${topic.progress_percentage}%` } : { width: 0 }}
            transition={{ duration: 1, delay: index * 0.08 + 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        {topic.current_streak_days > 0 && (
          <span className="flex items-center gap-1 text-orange-500">
            <Flame className="w-3.5 h-3.5" />
            {topic.current_streak_days}d streak
          </span>
        )}
        {topic.longest_streak_days > 0 && (
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Best: {topic.longest_streak_days}d
          </span>
        )}
        {topic.target_completion_date && (
          <span className="flex items-center gap-1 ml-auto">
            <Target className="w-3.5 h-3.5" />
            {new Date(topic.target_completion_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </span>
        )}
      </div>

      {topic.description && (
        <p className="mt-3 text-xs text-muted-foreground leading-relaxed border-t border-border pt-3">
          {topic.description}
        </p>
      )}
    </motion.div>
  )
}

export function LearningSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['learning-topics'],
    queryFn: () => portfolioApi.getLearningTopics(),
  })
  const topics = ((data as { data?: LearningTopic[] })?.data ?? [])

  const totalProgress =
    topics.length > 0
      ? Math.round(topics.reduce((acc, t) => acc + t.progress_percentage, 0) / topics.length)
      : 0

  return (
    <section id="learning" className="section-padding bg-muted/20">
      <div className="container-max">
        <SectionHeader
          tag="growth"
          title="Learning Roadmap"
          description="My ongoing journey across systems programming, blockchain, and beyond."
        />

        {/* Summary stats */}
        {topics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 mb-8 p-5 rounded-2xl border border-border bg-card"
          >
            <div className="flex flex-wrap gap-6 items-center">
              <div className="flex-1 min-w-40">
                <p className="text-sm text-muted-foreground mb-2">Overall Progress</p>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary via-solana to-solana-light"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${totalProgress}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                </div>
              </div>
              <div className="flex gap-6 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{totalProgress}%</p>
                  <p className="text-xs text-muted-foreground">Avg Progress</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-500">
                    {topics.filter((t) => t.status === 'completed').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-500">
                    {topics.filter((t) => t.status === 'in-progress').length}
                  </p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl skeleton" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {topics.map((topic, i) => (
              <LearningCard key={topic.id} topic={topic} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
