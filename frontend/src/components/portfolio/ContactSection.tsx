'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Send, MapPin, Mail, Phone, Github, Linkedin, Twitter, MessageSquare, Instagram, Youtube } from 'lucide-react'
import { toast } from 'sonner'
import { portfolioApi, contactApi } from '@/lib/api'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { PersonalInfo, SocialLink } from '@/types'

const schema = z.object({
  sender_name: z.string().min(2, 'Name must be at least 2 characters'),
  sender_email: z.string().email('Please enter a valid email'),
  subject: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})
type FormData = z.infer<typeof schema>

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  email: Mail,
  instagram: Instagram,
  youtube: Youtube,
  phone: Phone,
  discord: MessageSquare,
  telegram: MessageSquare,
}

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false)
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  const { data: infoRes } = useQuery({ queryKey: ['personal-info'], queryFn: () => portfolioApi.getPersonalInfo() })
  const { data: linksRes } = useQuery({ queryKey: ['social-links'], queryFn: () => portfolioApi.getSocialLinks() })

  const info = (infoRes as { data?: PersonalInfo })?.data
  const links = ((linksRes as { data?: SocialLink[] })?.data ?? []).filter((l) => l.is_visible)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      await contactApi.submit(data)
      setSubmitted(true)
      reset()
      toast.success("Message sent! I'll get back to you soon.")
    } catch {
      toast.error('Failed to send. Please try again or email directly.')
    }
  }

  return (
    <section id="contact" className="section-padding">
      <div className="container-max">
        <SectionHeader
          tag="get in touch"
          title="Contact Me"
          description="Have a project in mind or want to collaborate? Let's talk."
        />

        <div ref={ref} className="mt-12 grid lg:grid-cols-2 gap-12">
          {/* Left: Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-xl font-semibold mb-3">Let's build something together</h3>
              <p className="text-muted-foreground leading-relaxed">
                I'm always open to discussing new projects, opportunities in Rust or Solana ecosystem, or just a friendly chat about tech.
              </p>
            </div>

            <div className="space-y-4">
              {info?.email && (
                <a href={`mailto:${info.email}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  {info.email}
                </a>
              )}
              {info?.location && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  {info.location}
                </div>
              )}
            </div>

            {/* Social links */}
            <div>
              <p className="text-sm font-medium mb-4">Find me on</p>
              <div className="flex flex-wrap gap-3">
                {links.map((link) => {
                  const Icon = PLATFORM_ICONS[link.platform] ?? MessageSquare
                  return (
                    <motion.a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card hover:border-primary/40 text-sm text-muted-foreground hover:text-foreground transition-all"
                    >
                      <Icon className="w-4 h-4" />
                      {link.display_name ?? link.platform}
                    </motion.a>
                  )
                })}
              </div>
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-10 rounded-2xl border border-green-500/20 bg-green-500/5"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                  <Send className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Message Sent!</h3>
                <p className="text-muted-foreground text-sm mb-6">Thanks for reaching out. I'll reply within 24 hours.</p>
                <Button variant="outline" onClick={() => setSubmitted(false)}>Send another</Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6 rounded-2xl border border-border bg-card">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Name <span className="text-primary">*</span></Label>
                    <Input id="name" placeholder="Your name" {...register('sender_name')} className={errors.sender_name ? 'border-destructive' : ''} />
                    {errors.sender_name && <p className="text-xs text-destructive">{errors.sender_name.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email <span className="text-primary">*</span></Label>
                    <Input id="email" type="email" placeholder="your@email.com" {...register('sender_email')} className={errors.sender_email ? 'border-destructive' : ''} />
                    {errors.sender_email && <p className="text-xs text-destructive">{errors.sender_email.message}</p>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="What's this about?" {...register('subject')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message">Message <span className="text-primary">*</span></Label>
                  <Textarea
                    id="message"
                    placeholder="Tell me about your project..."
                    rows={5}
                    {...register('message')}
                    className={errors.message ? 'border-destructive resize-none' : 'resize-none'}
                  />
                  {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
                </div>
                <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
