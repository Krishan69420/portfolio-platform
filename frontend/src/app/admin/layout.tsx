'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, User, Code2, Briefcase, GraduationCap, FolderKanban,
  Brain, Award, Trophy, Link as LinkIcon, MessageSquare, FileText,
  BarChart3, Settings, LogOut, ChevronLeft, ChevronRight, Menu,
  Moon, Sun, BookOpen, Layers, ExternalLink,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/personal',  icon: User,           label: 'Personal Info' },
  { href: '/admin/skills',    icon: Code2,          label: 'Skills' },
  { href: '/admin/tech-stack',icon: Layers,         label: 'Tech Stack' },
  { href: '/admin/experience',icon: Briefcase,      label: 'Experience' },
  { href: '/admin/education', icon: GraduationCap,  label: 'Education' },
  { href: '/admin/projects',  icon: FolderKanban,   label: 'Projects' },
  { href: '/admin/learning',  icon: Brain,          label: 'Learning' },
  { href: '/admin/certifications', icon: Award,     label: 'Certifications' },
  { href: '/admin/achievements',   icon: Trophy,    label: 'Achievements' },
  { href: '/admin/blog',      icon: BookOpen,       label: 'Blog' },
  { href: '/admin/social-links',   icon: LinkIcon,  label: 'Social Links' },
  { href: '/admin/messages',  icon: MessageSquare,  label: 'Messages' },
  { href: '/admin/resume',    icon: FileText,       label: 'Resume' },
  { href: '/admin/analytics', icon: BarChart3,      label: 'Analytics' },
  { href: '/admin/settings',  icon: Settings,       label: 'Settings' },
]

const SHELL_EXCLUDED = ['/admin/login']

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AuthProvider>
  )
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (SHELL_EXCLUDED.some((p) => pathname.startsWith(p))) {
    return <>{children}</>
  }
  return <AdminShell>{children}</AdminShell>
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/admin/login')
    }
  }, [isLoading, isAuthenticated, router])

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    router.replace('/admin/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full" />
      </div>
    )
  }
  if (!isAuthenticated) return null

  const currentPage = NAV_ITEMS.find(
    (n) => pathname === n.href || pathname.startsWith(n.href + '/'),
  )

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn(
      'flex flex-col h-full bg-card border-r border-border',
      !mobile && (collapsed ? 'w-16' : 'w-60'),
      mobile && 'w-64',
    )}>
      {/* Logo */}
      <div className={cn('flex items-center h-16 px-4 border-b border-border flex-shrink-0',
        !mobile && collapsed ? 'justify-center' : 'gap-3')}>
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Code2 className="w-4 h-4 text-white" />
        </div>
        {(!collapsed || mobile) && (
          <div className="min-w-0">
            <p className="font-bold text-sm leading-none">Portfolio</p>
            <p className="text-xs text-muted-foreground mt-0.5">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              title={!mobile && collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg text-sm transition-all duration-150',
                !mobile && collapsed ? 'justify-center px-0 py-2.5 w-full' : 'px-3 py-2',
                isActive ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              )}>
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {(!collapsed || mobile) && <span className="flex-1 truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User + logout */}
      <div className={cn('flex-shrink-0 p-3 border-t border-border space-y-1',
        !mobile && collapsed && 'flex flex-col items-center')}>
        {(!collapsed || mobile) && user && (
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/50 mb-1">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs text-white font-bold flex-shrink-0">
              {user.email[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate">{user.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout}
          title={!mobile && collapsed ? 'Logout' : undefined}
          className={cn(
            'flex items-center gap-2 w-full rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors',
            !mobile && collapsed ? 'justify-center p-2.5' : 'px-3 py-2',
          )}>
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {(!collapsed || mobile) && <span>Logout</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col relative flex-shrink-0 transition-all duration-300"
        style={{ width: collapsed ? 64 : 240 }}>
        <SidebarContent />
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 z-10 w-6 h-6 rounded-full border border-border bg-card flex items-center justify-center shadow-sm hover:bg-muted transition-colors">
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 z-50 lg:hidden">
              <SidebarContent mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 flex-shrink-0 gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden w-9 h-9" onClick={() => setMobileOpen(true)}>
              <Menu className="w-4 h-4" />
            </Button>
            <div className="hidden sm:block">
              <h1 className="font-semibold text-sm">{currentPage?.label ?? 'Admin'}</h1>
              <p className="text-xs text-muted-foreground">Portfolio Management</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {mounted && (
              <Button variant="ghost" size="icon" className="w-9 h-9"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            )}
            <Button variant="ghost" size="icon" className="w-9 h-9" asChild>
              <Link href="/" target="_blank"><ExternalLink className="w-4 h-4" /></Link>
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
