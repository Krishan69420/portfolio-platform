import { Suspense } from 'react'
import { Navbar } from '@/components/portfolio/Navbar'
import { HeroSection } from '@/components/portfolio/HeroSection'
import { AboutSection } from '@/components/portfolio/AboutSection'
import { SkillsSection } from '@/components/portfolio/SkillsSection'
import { TechStackSection } from '@/components/portfolio/TechStackSection'
import { ExperienceSection } from '@/components/portfolio/ExperienceSection'
import { EducationSection } from '@/components/portfolio/EducationSection'
import { ProjectsSection } from '@/components/portfolio/ProjectsSection'
import { LearningSection } from '@/components/portfolio/LearningSection'
import { CertificationsSection } from '@/components/portfolio/CertificationsSection'
import { AchievementsSection } from '@/components/portfolio/AchievementsSection'
import { ContactSection } from '@/components/portfolio/ContactSection'
import { Footer } from '@/components/portfolio/Footer'
import { SectionSkeleton } from '@/components/shared/SectionSkeleton'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Suspense fallback={<SectionSkeleton />}>
        <HeroSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <AboutSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <SkillsSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <TechStackSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <ExperienceSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <EducationSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <ProjectsSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <LearningSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <CertificationsSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <AchievementsSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <ContactSection />
      </Suspense>
      <Footer />
    </main>
  )
}
