// ============================================================
// Type Definitions - Portfolio Platform
// ============================================================

export interface PersonalInfo {
  id: string
  full_name: string
  title: string
  tagline: string | null
  bio: string | null
  short_bio: string | null
  email: string | null
  phone: string | null
  location: string | null
  availability_status: string | null
  profile_picture_url: string | null
  resume_url: string | null
  resume_version: number | null
  website_url: string | null
  created_at: string
  updated_at: string
}

export interface SocialLink {
  id: string
  platform: string
  url: string
  display_name: string | null
  icon: string | null
  is_visible: boolean
  sort_order: number
}

export interface Skill {
  id: string
  name: string
  category: string
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null
  years_of_experience: number | null
  icon: string | null
  icon_color: string | null
  is_featured: boolean
  is_currently_learning: boolean
  proficiency_score: number | null
  sort_order: number
}

export interface TechStack {
  id: string
  name: string
  category: string
  icon: string | null
  icon_color: string | null
  proficiency_score: number | null
  is_primary: boolean
  is_visible: boolean
  sort_order: number
  created_at?: string
}

export interface Experience {
  id: string
  company_name: string
  company_logo_url: string | null
  company_url: string | null
  role: string
  employment_type: 'full-time' | 'part-time' | 'internship' | 'contract' | 'freelance' | null
  location: string | null
  is_remote: boolean
  start_date: string
  end_date: string | null
  is_current: boolean
  description: string | null
  responsibilities: string[] | null
  achievements: string[] | null
  tech_stack: string[] | null
  sort_order: number
}

export interface Education {
  id: string
  institution_name: string
  institution_logo_url: string | null
  institution_url: string | null
  degree: string | null
  field_of_study: string | null
  specialization: string | null
  start_date: string
  end_date: string | null
  is_current: boolean
  cgpa: number | null
  max_cgpa: number | null
  percentage: number | null
  grade: string | null
  location: string | null
  description: string | null
  achievements: string[] | null
  relevant_courses: string[] | null
}

export interface Certification {
  id: string
  name: string
  issuing_organization: string
  issue_date: string
  expiry_date: string | null
  credential_id: string | null
  credential_url: string | null
  image_url: string | null
  skills: string[] | null
  is_featured: boolean
}

export interface Achievement {
  id: string
  title: string
  description: string | null
  category: string | null
  date: string | null
  organization: string | null
  proof_url: string | null
  icon: string | null
  is_featured: boolean
}

export interface Project {
  id: string
  title: string
  slug: string
  short_description: string | null
  description: string | null
  tech_stack: string[] | null
  github_url: string | null
  live_demo_url: string | null
  cover_image_url: string | null
  status: 'planning' | 'in-progress' | 'completed' | 'archived' | null
  category: string | null
  is_featured: boolean
  is_open_source: boolean
  start_date: string | null
  end_date: string | null
  view_count: number
}

export interface ProjectImage {
  id: string
  project_id: string
  image_url: string
  alt_text: string | null
  caption: string | null
  sort_order: number
}

export interface ProjectDetail extends Project {
  images: ProjectImage[]
  tags: string[]
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  cover_image_url: string | null
  tags: string[] | null
  is_published: boolean
  is_featured: boolean
  read_time_minutes: number | null
  view_count: number
  published_at: string | null
}

export interface LearningTopic {
  id: string
  name: string
  category: string | null
  description: string | null
  icon: string | null
  icon_color: string | null
  progress_percentage: number
  target_completion_date: string | null
  current_streak_days: number
  longest_streak_days: number
  last_activity_date: string | null
  status: 'not-started' | 'in-progress' | 'completed' | 'paused' | null
  is_featured: boolean
}

export interface LearningMilestone {
  id: string
  topic_id: string
  title: string
  description: string | null
  target_date: string | null
  completed_at: string | null
  is_completed: boolean
  sort_order: number
}

export interface ContactMessage {
  id: string
  sender_name: string
  sender_email: string
  subject: string | null
  message: string
  is_read: boolean
  is_replied: boolean
  is_spam: boolean
  created_at: string
}

export interface ResumeVersion {
  id: string
  version_number: number
  file_url: string
  file_name: string
  file_size: number | null
  is_current: boolean
  download_count: number
  uploaded_at: string
}

export interface AnalyticsOverview {
  total_views: number
  views_today: number
  views_this_week: number
  views_this_month: number
  total_projects: number
  total_skills: number
  total_messages: number
  unread_messages: number
  resume_downloads: number
  top_projects: Array<{ id: string; title: string; view_count: number }>
}

export interface AuthUser {
  id: string
  email: string
  role: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: AuthUser
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}
