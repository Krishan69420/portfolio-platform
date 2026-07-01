// AchievementsSection.tsx
'use client'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Trophy, ExternalLink } from 'lucide-react'
import { portfolioApi } from '@/lib/api'
import { SectionHeader } from '@/components/shared/SectionHeader'
import type { Achievement } from '@/types'

export function AchievementsSection() {
  const { data } = useQuery({ queryKey: ['achievements'], queryFn: () => portfolioApi.getAchievements() })
  const achievements = ((data as { data?: Achievement[] })?.data ?? [])
  if (!achievements.length) return null

  return (
    <section id="achievements" className="section-padding">
      <div className="container-max">
        <SectionHeader tag="milestones" title="Achievements" />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {achievements.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="p-5 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all card-hover">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-3">
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              <h3 className="font-medium text-sm mb-1">{a.title}</h3>
              {a.organization && <p className="text-xs text-primary mb-2">{a.organization}</p>}
              {a.description && <p className="text-xs text-muted-foreground leading-relaxed">{a.description}</p>}
              {a.proof_url && (
                <a href={a.proof_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline mt-3">
                  <ExternalLink className="w-3 h-3" /> View proof
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
