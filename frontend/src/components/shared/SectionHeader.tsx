// SectionHeader.tsx
import { motion } from 'framer-motion'

interface SectionHeaderProps {
  tag: string
  title: string
  description?: string
}

export function SectionHeader({ tag, title, description }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <span className="text-xs font-mono text-primary uppercase tracking-widest mb-3 block">
        // {tag}
      </span>
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{title}</h2>
      {description && (
        <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">{description}</p>
      )}
    </motion.div>
  )
}
