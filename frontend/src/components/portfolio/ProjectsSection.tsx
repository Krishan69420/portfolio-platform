'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Github, ExternalLink, Star, Clock, CheckCircle2, Circle } from 'lucide-react'
import { projectsApi } from '@/lib/api'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Project } from '@/types'

const STATUS_CONFIG = {
  'planning': { icon: Circle, color: 'text-blue-500', label: 'Planning' },
  'in-progress': { icon: Clock, color: 'text-yellow-500', label: 'In Progress' },
  'completed': { icon: CheckCircle2, color: 'text-green-500', label: 'Completed' },
  'archived': { icon: Circle, color: 'text-muted-foreground', label: 'Archived' },
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const statusCfg = STATUS_CONFIG[project.status ?? 'planning']
  const StatusIcon = statusCfg.icon

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
      className="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Cover image or gradient placeholder */}
      <div className="relative h-44 bg-gradient-to-br from-primary/10 via-muted to-solana/10 overflow-hidden">
        {project.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.cover_image_url}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-primary/20 font-mono select-none">
              {project.title.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        {project.is_featured && (
          <div className="absolute top-3 left-3">
            <Badge className="gap-1 bg-primary text-white text-xs">
              <Star className="w-3 h-3" /> Featured
            </Badge>
          </div>
        )}
        <div className="absolute top-3 right-3 flex items-center gap-1 text-xs">
          <StatusIcon className={`w-3 h-3 ${statusCfg.color}`} />
          <span className={`${statusCfg.color} font-medium`}>{statusCfg.label}</span>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-semibold text-base mb-2 group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-2">
          {project.short_description}
        </p>

        {/* Tech stack */}
        {project.tech_stack && project.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.tech_stack.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-mono"
              >
                {tech}
              </span>
            ))}
            {project.tech_stack.length > 4 && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                +{project.tech_stack.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Links */}
        <div className="flex items-center gap-2 pt-3 border-t border-border">
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              Source
            </a>
          )}
          {project.live_demo_url && (
            <a
              href={project.live_demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors ml-auto"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Live Demo
            </a>
          )}
        </div>
      </div>
    </motion.article>
  )
}

const FILTERS = ['All', 'Featured', 'Blockchain', 'Full Stack', 'Backend', 'Frontend']

export function ProjectsSection() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['projects', activeFilter, page],
    queryFn: () =>
      projectsApi.list({
        page,
        per_page: 6,
        featured: activeFilter === 'Featured' ? true : undefined,
        category: !['All', 'Featured'].includes(activeFilter) ? activeFilter : undefined,
      }),
  })

  const projects = ((data as { data?: Project[] })?.data ?? [])
  const pagination = (data as { pagination?: { total_pages: number } })?.pagination

  return (
    <section id="projects" className="section-padding">
      <div className="container-max">
        <SectionHeader
          tag="work"
          title="Projects"
          description="Things I've built — from blockchain programs to full-stack systems."
        />

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mt-10 mb-8">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => { setActiveFilter(f); setPage(1) }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeFilter === f
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 rounded-2xl skeleton" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No projects found.</div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter + page}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {projects.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm text-muted-foreground">
              {page} / {pagination.total_pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
              disabled={page === pagination.total_pages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
