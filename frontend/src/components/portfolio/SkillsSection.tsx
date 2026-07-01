'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useQuery } from '@tanstack/react-query'
import { portfolioApi } from '@/lib/api'
import { SectionHeader } from '@/components/shared/SectionHeader'
import type { Skill } from '@/types'

const LEVEL_COLORS = {
  beginner: 'bg-blue-500',
  intermediate: 'bg-yellow-500',
  advanced: 'bg-orange-500',
  expert: 'bg-primary',
}

function SkillCard({ skill, index }: { skill: Skill; index: number }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-all duration-300 card-hover"
    >
      {skill.is_currently_learning && (
        <span className="absolute top-2 right-2 text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
          learning
        </span>
      )}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: skill.icon_color ?? '#6366f1' }}
        >
          {skill.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{skill.name}</p>
          <p className="text-xs text-muted-foreground">{skill.category}</p>
        </div>
      </div>

      {skill.proficiency_score != null && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="capitalize">{skill.experience_level ?? 'intermediate'}</span>
            <span>{skill.proficiency_score}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${LEVEL_COLORS[skill.experience_level as keyof typeof LEVEL_COLORS] ?? 'bg-primary'}`}
              initial={{ width: 0 }}
              animate={inView ? { width: `${skill.proficiency_score}%` } : { width: 0 }}
              transition={{ duration: 0.8, delay: index * 0.05 + 0.3, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {skill.years_of_experience != null && (
        <p className="text-xs text-muted-foreground mt-2">
          {skill.years_of_experience}y experience
        </p>
      )}
    </motion.div>
  )
}

export function SkillsSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: () => portfolioApi.getSkills(),
  })

  const skills = ((data as { data?: Skill[] })?.data ?? [])
  const categories = [...new Set(skills.map((s) => s.category))]

  return (
    <section id="skills" className="section-padding bg-muted/20">
      <div className="container-max">
        <SectionHeader
          tag="expertise"
          title="Skills & Technologies"
          description="Technologies I work with professionally, ordered by proficiency."
        />

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-12">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl skeleton" />
            ))}
          </div>
        ) : (
          <div className="mt-12 space-y-10">
            {categories.map((cat) => (
              <div key={cat}>
                <h3 className="text-sm font-mono text-primary mb-4 flex items-center gap-2">
                  <span className="w-4 h-px bg-primary" />
                  {cat}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {skills
                    .filter((s) => s.category === cat)
                    .map((skill, i) => (
                      <SkillCard key={skill.id} skill={skill} index={i} />
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
