// TechStackSection.tsx
'use client'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { portfolioApi } from '@/lib/api'
import { SectionHeader } from '@/components/shared/SectionHeader'
import type { TechStack } from '@/types'

export function TechStackSection() {
  const { data } = useQuery({ queryKey: ['tech-stack'], queryFn: () => portfolioApi.getTechStack() })
  const stack = ((data as { data?: TechStack[] })?.data ?? [])
  const primary = stack.filter((t) => t.is_primary)
  const secondary = stack.filter((t) => !t.is_primary)

  return (
    <section id="tech-stack" className="section-padding">
      <div className="container-max">
        <SectionHeader tag="tools" title="Tech Stack" description="Primary technologies in my everyday workflow." />
        <div className="mt-12 space-y-8">
          {primary.length > 0 && (
            <div>
              <p className="text-xs font-mono text-primary mb-4 flex items-center gap-2"><span className="w-4 h-px bg-primary" />Primary Stack</p>
              <div className="flex flex-wrap gap-3">
                {primary.map((t, i) => (
                  <motion.div key={t.id} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors group">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.icon_color ?? '#6366f1' }} />
                    <span className="text-sm font-medium">{t.name}</span>
                    <span className="text-xs text-muted-foreground">{t.category}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          {secondary.length > 0 && (
            <div>
              <p className="text-xs font-mono text-muted-foreground mb-4 flex items-center gap-2"><span className="w-4 h-px bg-muted-foreground" />Also use</p>
              <div className="flex flex-wrap gap-2">
                {secondary.map((t, i) => (
                  <motion.span key={t.id} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} className="px-3 py-1.5 text-xs rounded-lg bg-muted text-muted-foreground font-mono hover:text-foreground transition-colors">
                    {t.name}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
