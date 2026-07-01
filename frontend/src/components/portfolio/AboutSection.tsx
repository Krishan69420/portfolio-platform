// AboutSection.tsx
'use client'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { GraduationCap, MapPin, Zap } from 'lucide-react'
import { portfolioApi } from '@/lib/api'
import { SectionHeader } from '@/components/shared/SectionHeader'
import type { PersonalInfo } from '@/types'

export function AboutSection() {
  const { data } = useQuery({ queryKey: ['personal-info'], queryFn: () => portfolioApi.getPersonalInfo() })
  const info = (data as { data?: PersonalInfo })?.data

  return (
    <section id="about" className="section-padding">
      <div className="container-max">
        <SectionHeader tag="about" title="About Me" />
        <div className="mt-12 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="text-muted-foreground leading-relaxed text-lg mb-6">
              {info?.bio ?? 'Passionate software engineer focused on building high-performance systems and decentralized applications.'}
            </p>
            <div className="space-y-3">
              {info?.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" /> {info.location}
                </div>
              )}
              {info?.availability_status && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4 text-primary" /> {info.availability_status}
                </div>
              )}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="grid grid-cols-2 gap-4">
            {[
              { label: 'Focus Areas', value: 'Rust · Solana · Web3' },
              { label: 'Education', value: 'B.Tech CSE (AI/ML)' },
              { label: 'Institution', value: 'SRM Institute' },
              { label: 'Status', value: info?.availability_status ?? 'Available' },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-xl border border-border bg-card">
                <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                <p className="text-sm font-medium">{item.value}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
