// EducationSection.tsx
'use client'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { GraduationCap, MapPin, Award } from 'lucide-react'
import { portfolioApi } from '@/lib/api'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Badge } from '@/components/ui/badge'
import type { Education } from '@/types'
import { format, parseISO } from 'date-fns'

export function EducationSection() {
  const { data } = useQuery({ queryKey: ['education'], queryFn: () => portfolioApi.getEducation() })
  const education = ((data as { data?: Education[] })?.data ?? [])

  return (
    <section id="education" className="section-padding">
      <div className="container-max">
        <SectionHeader tag="background" title="Education" description="My academic foundation and qualifications." />
        <div className="mt-12 space-y-6">
          {education.map((edu, i) => (
            <motion.div key={edu.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="font-semibold text-base">{edu.institution_name}</h3>
                      <p className="text-primary text-sm">{edu.degree} in {edu.field_of_study}</p>
                      {edu.specialization && <p className="text-xs text-muted-foreground mt-0.5">Specialization: {edu.specialization}</p>}
                    </div>
                    {edu.is_current && <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Current</Badge>}
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                    <span>{format(parseISO(edu.start_date), 'MMM yyyy')} — {edu.end_date ? format(parseISO(edu.end_date), 'MMM yyyy') : 'Present'}</span>
                    {edu.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{edu.location}</span>}
                    {edu.cgpa != null && (
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <Award className="w-3 h-3" />CGPA: {edu.cgpa}/{edu.max_cgpa ?? 10}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
