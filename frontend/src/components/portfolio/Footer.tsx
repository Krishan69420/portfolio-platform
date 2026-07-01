'use client'
import Link from 'next/link'
import { Code2, Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border py-8 px-4">
      <div className="container-max flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
            <Code2 className="w-3 h-3 text-white" />
          </div>
          <span className="font-mono">kk.dev</span>
        </div>
        <p className="flex items-center gap-1 text-xs">
          Built with <Heart className="w-3 h-3 text-primary fill-primary" /> using Rust + Next.js 15
        </p>
        <div className="flex items-center gap-4 text-xs">
          <Link href="/admin" className="hover:text-foreground transition-colors">Admin</Link>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  )
}
