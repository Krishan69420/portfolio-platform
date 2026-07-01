// CertificationsSection.tsx
'use client'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { BadgeCheck, ExternalLink } from 'lucide-react'
import { portfolioApi } from '@/lib/api'
import { SectionHeader } from '@/components/shared/SectionHeader'
import type { Certification } from '@/types'
import { format, parseISO } from 'date-fns'

export function CertificationsSection() {
  const { data } = useQuery({ queryKey: ['certifications'], queryFn: () => portfolioApi.getCertifications() })
  const certs = ((data as { data?: Certification[] })?.data ?? [])
  if (!certs.length) return null

  return (
    <section id="certifications" className="section-padding bg-muted/20">
      <div className="container-max">
        <SectionHeader tag="credentials" title="Certifications" />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {certs.map((cert, i) => (
            <motion.div key={cert.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="p-5 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all card-hover">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BadgeCheck className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-sm truncate">{cert.name}</h3>
                  <p className="text-xs text-muted-foreground">{cert.issuing_organization}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Issued {format(parseISO(cert.issue_date), 'MMMM yyyy')}</p>
              {cert.skills && cert.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {cert.skills.slice(0, 3).map((s) => <span key={s} className="text-xs px-2 py-0.5 bg-muted rounded font-mono">{s}</span>)}
                </div>
              )}
              {cert.credential_url && (
                <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <ExternalLink className="w-3 h-3" /> View credential
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
