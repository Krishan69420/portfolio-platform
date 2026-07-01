'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown, Download, Github, Linkedin, Mail, Zap } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { portfolioApi, resumeApi } from '@/lib/api'
import type { PersonalInfo, SocialLink } from '@/types'

const TYPING_WORDS = ['Rust Engineer', 'Solana Developer', 'Web3 Builder', 'Full-Stack Dev']

function useTypewriter(words: string[], speed = 80, pause = 1800) {
  const [display, setDisplay] = useState('')
  const [wordIdx, setWordIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = words[wordIdx % words.length]
    const tick = deleting ? speed / 2 : charIdx === current.length ? pause : speed

    const timer = setTimeout(() => {
      if (!deleting && charIdx < current.length) {
        setDisplay(current.slice(0, charIdx + 1))
        setCharIdx((c) => c + 1)
      } else if (!deleting && charIdx === current.length) {
        setDeleting(true)
      } else if (deleting && charIdx > 0) {
        setDisplay(current.slice(0, charIdx - 1))
        setCharIdx((c) => c - 1)
      } else {
        setDeleting(false)
        setWordIdx((w) => w + 1)
      }
    }, tick)
    return () => clearTimeout(timer)
  }, [words, wordIdx, charIdx, deleting, speed, pause])

  return display
}

const SOCIAL_ICONS: Record<string, React.ElementType> = {
  github: Github,
  linkedin: Linkedin,
  email: Mail,
}

export function HeroSection() {
  const typed = useTypewriter(TYPING_WORDS)

  const { data: infoRes } = useQuery({
    queryKey: ['personal-info'],
    queryFn: () => portfolioApi.getPersonalInfo(),
  })
  const { data: linksRes } = useQuery({
    queryKey: ['social-links'],
    queryFn: () => portfolioApi.getSocialLinks(),
  })
  const { data: resumeRes } = useQuery({
    queryKey: ['resume-download'],
    queryFn: () => resumeApi.getDownloadInfo(),
  })

  const info = (infoRes as { data?: PersonalInfo })?.data
  const links = ((linksRes as { data?: SocialLink[] })?.data ?? []).slice(0, 4)
  const resume = (resumeRes as { data?: { file_url?: string } })?.data

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background">
        <div className="absolute inset-0 dot-grid opacity-40" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-solana/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 container-max section-padding text-center"
      >
        {/* Availability badge */}
        {info?.availability_status && (
          <motion.div variants={itemVariants} className="flex justify-center mb-6">
            <Badge variant="outline" className="gap-2 px-4 py-1.5 text-sm border-primary/40 bg-primary/5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              {info.availability_status}
            </Badge>
          </motion.div>
        )}

        {/* Name */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4"
        >
          {info?.full_name ? (
            <>
              <span className="block">{info.full_name.split(' ')[0]}</span>
              <span className="block gradient-text">{info.full_name.split(' ').slice(1).join(' ')}</span>
            </>
          ) : (
            <>
              <span className="block">Krishan</span>
              <span className="block gradient-text">Kumar</span>
            </>
          )}
        </motion.h1>

        {/* Typewriter */}
        <motion.div variants={itemVariants} className="h-10 flex items-center justify-center mb-6">
          <span className="text-xl sm:text-2xl font-mono text-muted-foreground">
            {'< '}
            <span className="text-primary">{typed}</span>
            <span className="animate-pulse">|</span>
            {' />'}
          </span>
        </motion.div>

        {/* Bio */}
        <motion.p
          variants={itemVariants}
          className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {info?.short_bio ?? 'Building fast, secure systems in Rust and decentralized applications on Solana. Passionate about open-source and the future of Web3.'}
        </motion.p>

        {/* CTA buttons */}
        <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <Button size="lg" className="gap-2 group" asChild>
            <Link href="#projects">
              <Zap className="w-4 h-4 group-hover:animate-bounce" />
              View Projects
            </Link>
          </Button>

          {resume?.file_url ? (
            <Button size="lg" variant="outline" className="gap-2 group" asChild>
              <a href={resume.file_url} download target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4 group-hover:animate-bounce" />
                Download Resume
              </a>
            </Button>
          ) : (
            <Button size="lg" variant="outline" className="gap-2" disabled>
              <Download className="w-4 h-4" />
              Resume
            </Button>
          )}
        </motion.div>

        {/* Social links */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-4">
          {links.map((link) => {
            const Icon = SOCIAL_ICONS[link.platform] ?? Github
            return (
              <motion.a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
                aria-label={link.display_name ?? link.platform}
              >
                <Icon className="w-4 h-4" />
              </motion.a>
            )
          })}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          variants={itemVariants}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ArrowDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </motion.div>
    </section>
  )
}
