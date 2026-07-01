import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// ─── Token storage helpers ────────────────────────────────────────────────────
const TOKEN_KEY = 'portfolio_access_token'
const REFRESH_KEY = 'portfolio_refresh_token'

export const tokenStorage = {
  get: () => (typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  remove: () => localStorage.removeItem(TOKEN_KEY),
  getRefresh: () => (typeof window !== 'undefined' ? localStorage.getItem(REFRESH_KEY) : null),
  setRefresh: (t: string) => localStorage.setItem(REFRESH_KEY, t),
  removeRefresh: () => localStorage.removeItem(REFRESH_KEY),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}

// ─── Axios instance ───────────────────────────────────────────────────────────
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach JWT
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let failedQueue: Array<{ resolve: (v: unknown) => void; reject: (r: unknown) => void }> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)))
  failedQueue = []
}

// Response interceptor — refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`
            return api(original)
          })
          .catch((err) => Promise.reject(err))
      }

      original._retry = true
      isRefreshing = true

      const refresh = tokenStorage.getRefresh()
      if (!refresh) {
        tokenStorage.clear()
        window.location.href = '/admin/login'
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post(`${API_BASE}/api/auth/refresh`, {
          refresh_token: refresh,
        })
        const newToken = data.access_token
        tokenStorage.set(newToken)
        if (data.refresh_token) tokenStorage.setRefresh(data.refresh_token)
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`
        original.headers.Authorization = `Bearer ${newToken}`
        processQueue(null, newToken)
        return api(original)
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        tokenStorage.clear()
        window.location.href = '/admin/login'
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  },
)

// ─── Typed API helpers ────────────────────────────────────────────────────────
const get = <T>(url: string, params?: Record<string, unknown>) =>
  api.get<{ success: boolean; data: T }>(url, { params }).then((r) => r.data)

const post = <T>(url: string, body?: unknown) =>
  api.post<{ success: boolean; data: T; message?: string }>(url, body).then((r) => r.data)

const put = <T>(url: string, body?: unknown) =>
  api.put<{ success: boolean; data: T; message?: string }>(url, body).then((r) => r.data)

const del = (url: string) =>
  api.delete<{ success: boolean; message?: string }>(url).then((r) => r.data)

// ─── Public Portfolio API ─────────────────────────────────────────────────────
export const portfolioApi = {
  getPersonalInfo: () => get('/api/portfolio/personal'),
  getSkills: () => get('/api/portfolio/skills'),
  getTechStack: () => get('/api/portfolio/tech-stack'),
  getExperience: () => get('/api/portfolio/experience'),
  getEducation: () => get('/api/portfolio/education'),
  getCertifications: () => get('/api/portfolio/certifications'),
  getAchievements: () => get('/api/portfolio/achievements'),
  getSocialLinks: () => get('/api/portfolio/social-links'),
  getLearningTopics: () => get('/api/portfolio/learning'),
  getLearningTopic: (id: string) => get(`/api/portfolio/learning/${id}`),
}

export const projectsApi = {
  list: (params?: Record<string, unknown>) => get('/api/projects', params),
  featured: () => get('/api/projects/featured'),
  getBySlug: (slug: string) => get(`/api/projects/${slug}`),
}

export const blogApi = {
  list: (params?: Record<string, unknown>) => get('/api/blog', params),
  featured: () => get('/api/blog/featured'),
  getBySlug: (slug: string) => get(`/api/blog/${slug}`),
}

export const contactApi = {
  submit: (data: { sender_name: string; sender_email: string; subject?: string; message: string }) =>
    post('/api/contact', data),
}

export const resumeApi = {
  getDownloadInfo: () => get('/api/resume/download'),
}

export const analyticsApi = {
  trackPageView: (data: { page_path: string; referrer?: string; session_id?: string }) =>
    post('/api/analytics/track', data).catch(() => {}), // silent fail
}

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) => post('/api/auth/login', { email, password }),
  logout: (refresh_token: string) => post('/api/auth/logout', { refresh_token }),
  me: () => get('/api/admin/auth/me'),
  changePassword: (current_password: string, new_password: string) =>
    post('/api/admin/auth/change-password', { current_password, new_password }),
}

// ─── Admin API ────────────────────────────────────────────────────────────────
export const adminApi = {
  // Personal
  updatePersonal: (data: unknown) => put('/api/admin/personal', data),

  // Tech stack
  listTechStack: () => get('/api/admin/tech-stack'),
  createTechStack: (data: unknown) => post('/api/admin/tech-stack', data),
  updateTechStack: (id: string, data: unknown) => put(`/api/admin/tech-stack/${id}`, data),
  deleteTechStack: (id: string) => del(`/api/admin/tech-stack/${id}`),

  // Skills
  listSkills: () => get('/api/admin/skills'),
  createSkill: (data: unknown) => post('/api/admin/skills', data),
  updateSkill: (id: string, data: unknown) => put(`/api/admin/skills/${id}`, data),
  deleteSkill: (id: string) => del(`/api/admin/skills/${id}`),

  // Experience
  listExperience: () => get('/api/admin/experience'),
  createExperience: (data: unknown) => post('/api/admin/experience', data),
  updateExperience: (id: string, data: unknown) => put(`/api/admin/experience/${id}`, data),
  deleteExperience: (id: string) => del(`/api/admin/experience/${id}`),

  // Education
  listEducation: () => get('/api/admin/education'),
  createEducation: (data: unknown) => post('/api/admin/education', data),
  updateEducation: (id: string, data: unknown) => put(`/api/admin/education/${id}`, data),
  deleteEducation: (id: string) => del(`/api/admin/education/${id}`),

  // Projects
  listProjects: (params?: Record<string, unknown>) => get('/api/admin/projects', params),
  getProject: (id: string) => get(`/api/admin/projects/${id}`),
  createProject: (data: unknown) => post('/api/admin/projects', data),
  updateProject: (id: string, data: unknown) => put(`/api/admin/projects/${id}`, data),
  deleteProject: (id: string) => del(`/api/admin/projects/${id}`),

  // Certifications
  listCertifications: () => get('/api/admin/certifications'),
  createCertification: (data: unknown) => post('/api/admin/certifications', data),
  updateCertification: (id: string, data: unknown) => put(`/api/admin/certifications/${id}`, data),
  deleteCertification: (id: string) => del(`/api/admin/certifications/${id}`),

  // Achievements
  listAchievements: () => get('/api/admin/achievements'),
  createAchievement: (data: unknown) => post('/api/admin/achievements', data),
  updateAchievement: (id: string, data: unknown) => put(`/api/admin/achievements/${id}`, data),
  deleteAchievement: (id: string) => del(`/api/admin/achievements/${id}`),

  // Social links
  listSocialLinks: () => get('/api/admin/social-links'),
  createSocialLink: (data: unknown) => post('/api/admin/social-links', data),
  updateSocialLink: (id: string, data: unknown) => put(`/api/admin/social-links/${id}`, data),
  deleteSocialLink: (id: string) => del(`/api/admin/social-links/${id}`),

  // Learning
  listLearning: () => get('/api/admin/learning'),
  createLearning: (data: unknown) => post('/api/admin/learning', data),
  updateLearning: (id: string, data: unknown) => put(`/api/admin/learning/${id}`, data),
  deleteLearning: (id: string) => del(`/api/admin/learning/${id}`),
  addMilestone: (topicId: string, data: unknown) => post(`/api/admin/learning/${topicId}/milestones`, data),
  logStreak: (topicId: string, data: unknown) => post(`/api/admin/learning/${topicId}/streak`, data),

  // Contact
  listMessages: (params?: Record<string, unknown>) => get('/api/admin/contact', params),
  getMessage: (id: string) => get(`/api/admin/contact/${id}`),
  markRead: (id: string) => put(`/api/admin/contact/${id}/read`),
  markSpam: (id: string) => put(`/api/admin/contact/${id}/spam`),
  deleteMessage: (id: string) => del(`/api/admin/contact/${id}`),

  // Analytics
  getOverview: () => get('/api/admin/analytics/overview'),
  getViewsChart: () => get('/api/admin/analytics/views'),
  getProjectStats: () => get('/api/admin/analytics/projects'),

  // Settings
  getSettings: () => get('/api/admin/settings'),
  updateSettings: (data: unknown) => put('/api/admin/settings', data),

  // Resume
  listResumeVersions: () => get('/api/admin/resume/versions'),
  activateResumeVersion: (id: string) => put(`/api/admin/resume/versions/${id}/activate`),

  // Blog
  listBlogPosts: () => get('/api/admin/blog'),
  createBlogPost: (data: unknown) => post('/api/admin/blog', data),
  updateBlogPost: (id: string, data: unknown) => put(`/api/admin/blog/${id}`, data),
  deleteBlogPost: (id: string) => del(`/api/admin/blog/${id}`),
}
