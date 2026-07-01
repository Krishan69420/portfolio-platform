'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useQuery } from '@tanstack/react-query'
import { Briefcase, MapPin, Calendar } from 'lucide-react'
import { portfolioApi } from '@/lib/api'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Badge } from '@/components/ui/badge'
import type { Experience } from '@/types'
import { format, parseISO } from 'date-fns'

function TimelineItem({ exp, index }: { exp: Experience; index: number }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const isLeft = index % 2 === 0

  const formatDate = (d: string | null) =>
    d ? format(parseISO(d), 'MMM yyyy') : 'Present'

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`relative flex gap-6 md:gap-10 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row`}
    >
      {/* Timeline dot */}
      <div className="hidden md:flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center flex-shrink-0 z-10">
          <Briefcase className="w-4 h-4 text-primary" />
        </div>
        {/* Connector line */}
        <div className="flex-1 w-px bg-border mt-2" />
      </div>

      {/* Mobile dot */}
      <div className="flex md:hidden flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center flex-shrink-0">
          <Briefcase className="w-3 h-3 text-primary" />
        </div>
        <div className="flex-1 w-px bg-border mt-2" />
      </div>

      {/* Content card */}
      <div
        className={`flex-1 pb-10 ${isLeft ? 'md:text-left' : 'md:text-right'}`}
      >
        <div className="p-5 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors">
          <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
            <div>
              <h3 className="font-semibold text-base">{exp.role}</h3>
              <p className="text-primary text-sm font-medium">{exp.company_name}</p>
            </div>
            {exp.is_current && (
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">
                Current
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(exp.start_date)} — {formatDate(exp.end_date)}
            </span>
            {exp.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {exp.location} {exp.is_remote && '(Remote)'}
              </span>
            )}
            {exp.employment_type && (
              <Badge variant="outline" className="text-xs capitalize">
                {exp.employment_type}
              </Badge>
            )}
          </div>

          {exp.description && (
            <p className="text-sm text-muted-foreground mb-4">{exp.description}</p>
          )}

          {exp.tech_stack && exp.tech_stack.length > 0 && (
            <div className={`flex flex-wrap gap-1.5 ${isLeft ? '' : 'md:justify-end'}`}>
              {exp.tech_stack.map((t) => (
                <span key={t} className="text-xs px-2 py-0.5 bg-muted rounded font-mono text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export function ExperienceSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['experience'],
    queryFn: () => portfolioApi.getExperience(),
  })
  const experience = ((data as { data?: Experience[] })?.data ?? [])

  return (
    <section id="experience" className="section-padding bg-muted/20">
      <div className="container-max">
        <SectionHeader
          tag="career"
          title="Experience"
          description="My professional journey and the companies I've worked with."
        />

        {isLoading ? (
          <div className="space-y-6 mt-12">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-36 rounded-2xl skeleton" />
            ))}
          </div>
        ) : experience.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground mt-12">
            No experience listed yet.
          </div>
        ) : (
          <div className="mt-12 relative">
            {/* Central timeline bar (desktop) */}
            <div className="hidden md:block absolute left-[19px] top-0 bottom-0 w-px bg-border" />
            <div className="space-y-0">
              {experience.map((exp, i) => (
                <TimelineItem key={exp.id} exp={exp} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
