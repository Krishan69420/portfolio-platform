# Portfolio Platform — Full-Stack CMS

A production-ready personal portfolio management system built with **Rust (Axum)** backend, **Next.js 15** frontend, and **PostgreSQL** database. Includes a full admin dashboard, JWT auth, analytics, and Docker deployment.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| Backend | Rust, Axum 0.7, SQLx, Tokio |
| Database | PostgreSQL 16 |
| Auth | JWT (RS256) + Refresh tokens |
| ORM | SQLx with compile-time checked queries |
| Deployment | Docker, Docker Compose, Nginx |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| State | TanStack Query v5 |

---

## Project Structure

```
portfolio-platform/
├── backend/                    # Rust/Axum backend
│   ├── src/
│   │   ├── main.rs             # Entry point, router setup
│   │   ├── config/             # App configuration from env
│   │   ├── db/                 # Database connection pool
│   │   ├── errors.rs           # Unified error handling
│   │   ├── models/             # All Rust structs (DB + API)
│   │   ├── handlers/           # Route handlers
│   │   │   ├── auth.rs         # Login, refresh, logout
│   │   │   ├── portfolio.rs    # Public portfolio endpoints
│   │   │   ├── projects.rs     # Projects (public)
│   │   │   ├── blog.rs         # Blog posts (public)
│   │   │   ├── contact.rs      # Contact form submission
│   │   │   ├── analytics.rs    # Page view tracking
│   │   │   ├── resume.rs       # Resume download
│   │   │   └── admin/          # Protected admin handlers
│   │   │       ├── personal.rs
│   │   │       ├── skills.rs
│   │   │       ├── projects.rs
│   │   │       ├── learning.rs
│   │   │       ├── contact.rs
│   │   │       ├── analytics.rs
│   │   │       └── ...
│   │   ├── middleware/
│   │   │   └── auth.rs         # JWT auth middleware
│   │   └── utils/
│   │       ├── jwt.rs          # Token creation/validation
│   │       └── mod.rs          # Helpers (slug, pagination, etc.)
│   ├── migrations/
│   │   ├── 001_initial_schema.sql   # Full PostgreSQL schema
│   │   └── 002_seed_data.sql        # Default data + admin user
│   ├── Cargo.toml
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/                   # Next.js 15 frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx      # Root layout (ThemeProvider, QueryProvider)
│   │   │   ├── page.tsx        # Public portfolio home
│   │   │   └── admin/
│   │   │       ├── login/      # Admin login page
│   │   │       └── dashboard/  # Protected admin dashboard
│   │   │           ├── layout.tsx   # Sidebar shell
│   │   │           ├── page.tsx     # Analytics overview
│   │   │           ├── skills/      # Skills CRUD
│   │   │           ├── projects/    # Projects CRUD
│   │   │           ├── messages/    # Contact messages
│   │   │           └── ...
│   │   ├── components/
│   │   │   ├── portfolio/      # Public site sections
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── HeroSection.tsx
│   │   │   │   ├── AboutSection.tsx
│   │   │   │   ├── SkillsSection.tsx
│   │   │   │   ├── TechStackSection.tsx
│   │   │   │   ├── ExperienceSection.tsx
│   │   │   │   ├── EducationSection.tsx
│   │   │   │   ├── ProjectsSection.tsx
│   │   │   │   ├── LearningSection.tsx
│   │   │   │   ├── CertificationsSection.tsx
│   │   │   │   ├── AchievementsSection.tsx
│   │   │   │   ├── ContactSection.tsx
│   │   │   │   └── Footer.tsx
│   │   │   ├── admin/
│   │   │   │   └── AdminCrudTable.tsx  # Reusable CRUD table + form dialog
│   │   │   ├── shared/
│   │   │   │   ├── SectionHeader.tsx
│   │   │   │   ├── SectionSkeleton.tsx
│   │   │   │   └── QueryProvider.tsx
│   │   │   └── ui/             # shadcn/ui components
│   │   ├── hooks/
│   │   │   └── useAuth.tsx     # Auth context + hook
│   │   ├── lib/
│   │   │   ├── api.ts          # Axios client + all API calls
│   │   │   └── utils.ts        # cn(), formatDate(), etc.
│   │   ├── types/
│   │   │   └── index.ts        # All TypeScript interfaces
│   │   └── styles/
│   │       └── globals.css     # Design tokens + utilities
│   ├── Dockerfile
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── .env.example
│
├── docker/
│   └── nginx/
│       ├── nginx.conf          # Main nginx configuration
│       └── conf.d/
│           └── portfolio.conf  # Site config with SSL + rate limiting
├── docker-compose.yml          # Full stack orchestration
├── .env.example                # Root environment template
└── README.md
```

---

## Quick Start (Development)

### Prerequisites
- Rust 1.82+ (`rustup install stable`)
- Node.js 22+
- PostgreSQL 16+
- Docker + Docker Compose (optional but recommended)

### 1. Clone and configure

```bash
git clone https://github.com/yourusername/portfolio-platform
cd portfolio-platform

# Backend env
cp backend/.env.example backend/.env
# Edit backend/.env — set DATABASE_URL and JWT_SECRET

# Frontend env
cp frontend/.env.example frontend/.env.local
# Edit if your backend runs on a different port
```

### 2. Start PostgreSQL

**Option A — Docker (easiest):**
```bash
docker run -d \
  --name portfolio_db \
  -e POSTGRES_DB=portfolio_db \
  -e POSTGRES_USER=portfolio_user \
  -e POSTGRES_PASSWORD=portfolio_pass \
  -p 5432:5432 \
  postgres:16-alpine
```

**Option B — Local PostgreSQL:**
```bash
createdb portfolio_db
createuser portfolio_user
psql -c "ALTER USER portfolio_user WITH PASSWORD 'portfolio_pass';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE portfolio_db TO portfolio_user;"
```

### 3. Run Backend

```bash
cd backend
cargo run
# Backend starts on http://localhost:8080
# Migrations run automatically on startup
```

### 4. Run Frontend

```bash
cd frontend
npm install
npm run dev
# Frontend starts on http://localhost:3000
```

### 5. Access

| URL | Description |
|-----|-------------|
| `http://localhost:3000` | Public portfolio |
| `http://localhost:3000/admin/login` | Admin login |
| `http://localhost:8080/api/portfolio/personal` | API health check |

**Default admin credentials:**
- Email: `admin@portfolio.dev`
- Password: `Admin@123456`

> ⚠️ **Change these immediately after first login** via Admin → Settings → Change Password

---

## Docker Deployment (Full Stack)

### Development mode

```bash
cp .env.example .env
# Fill in JWT_SECRET at minimum

docker compose up -d
# Starts: PostgreSQL + Backend + Frontend
```

### Production mode (with Nginx + SSL)

```bash
cp .env.example .env
# Fill in ALL values, especially:
# - POSTGRES_PASSWORD (strong password)
# - JWT_SECRET (openssl rand -hex 64)
# - CORS_ORIGINS (your domain)
# - NEXT_PUBLIC_API_URL (https://yourdomain.com)
# - NEXT_PUBLIC_SITE_URL (https://yourdomain.com)

# Edit docker/nginx/conf.d/portfolio.conf
# Replace 'yourdomain.com' with your actual domain

# Start with nginx profile
docker compose --profile production up -d
```

### SSL with Let's Encrypt

```bash
# Install certbot
docker run -it --rm \
  -v ./docker/certbot/conf:/etc/letsencrypt \
  -v ./docker/certbot/www:/var/www/certbot \
  certbot/certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  -d yourdomain.com -d www.yourdomain.com \
  --email your@email.com --agree-tos --no-eff-email

# Restart nginx
docker compose restart nginx
```

---

## API Reference

### Public Endpoints (no auth)

```
GET  /api/portfolio/personal     Personal info + bio
GET  /api/portfolio/skills       All skills
GET  /api/portfolio/tech-stack   Tech stack items
GET  /api/portfolio/experience   Work experience
GET  /api/portfolio/education    Education history
GET  /api/portfolio/certifications
GET  /api/portfolio/achievements
GET  /api/portfolio/social-links
GET  /api/portfolio/learning     Learning roadmap topics
GET  /api/portfolio/learning/:id Single topic + milestones

GET  /api/projects               List (paginatable, filterable)
GET  /api/projects/featured      Featured projects
GET  /api/projects/:slug         Single project with images

GET  /api/blog                   Published posts
GET  /api/blog/featured          Featured posts
GET  /api/blog/:slug             Single post

POST /api/contact                Submit contact message
GET  /api/resume/download        Get current resume URL
POST /api/analytics/track        Track page view

POST /api/auth/login             { email, password } → tokens
POST /api/auth/refresh           { refresh_token } → new tokens
POST /api/auth/logout            { refresh_token }
```

### Admin Endpoints (Bearer token required)

```
GET  /api/admin/auth/me
POST /api/admin/auth/change-password

PUT  /api/admin/personal
POST /api/admin/personal/avatar

GET/POST       /api/admin/skills
PUT/DELETE     /api/admin/skills/:id

GET/POST       /api/admin/projects
GET/PUT/DELETE /api/admin/projects/:id
POST           /api/admin/projects/:id/images

GET/POST       /api/admin/experience
PUT/DELETE     /api/admin/experience/:id

GET/POST       /api/admin/education
PUT/DELETE     /api/admin/education/:id

GET/POST       /api/admin/certifications
PUT/DELETE     /api/admin/certifications/:id

GET/POST       /api/admin/achievements
PUT/DELETE     /api/admin/achievements/:id

GET/POST       /api/admin/social-links
PUT/DELETE     /api/admin/social-links/:id

GET/POST       /api/admin/learning
PUT/DELETE     /api/admin/learning/:id
POST           /api/admin/learning/:id/milestones
POST           /api/admin/learning/:id/streak

GET  /api/admin/contact          List messages
GET  /api/admin/contact/:id
PUT  /api/admin/contact/:id/read
PUT  /api/admin/contact/:id/spam
DELETE /api/admin/contact/:id

GET  /api/admin/analytics/overview
GET  /api/admin/analytics/views
GET  /api/admin/analytics/projects

GET  /api/admin/resume/versions
POST /api/admin/resume
PUT  /api/admin/resume/versions/:id/activate

GET/PUT /api/admin/settings

GET/POST       /api/admin/blog
PUT/DELETE     /api/admin/blog/:id
```

---

## Database Schema Summary

| Table | Purpose |
|-------|---------|
| `users` | Admin accounts |
| `refresh_tokens` | JWT refresh token rotation |
| `personal_info` | Bio, location, availability |
| `resume_versions` | Resume PDF version history |
| `social_links` | LinkedIn, GitHub, etc. |
| `skills` | Technical skills with proficiency |
| `tech_stack` | Primary + secondary tech |
| `experience` | Work history timeline |
| `education` | Degrees, CGPA |
| `certifications` | Certificates with credential URLs |
| `achievements` | Trophies, wins, recognitions |
| `projects` | Portfolio projects |
| `project_images` | Multiple images per project |
| `project_tags` | Tags per project |
| `blog_posts` | Blog with markdown content |
| `learning_topics` | Roadmap topics with progress % |
| `learning_milestones` | Milestones per topic |
| `learning_notes` | Notes per topic |
| `learning_streak_log` | Daily activity log |
| `contact_messages` | Visitor messages |
| `page_views` | Analytics tracking |
| `resume_downloads` | Download analytics |
| `project_views` | Per-project view tracking |
| `site_settings` | Key-value site config |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | — | Min 64 chars, cryptographically random |
| `HOST` | | `0.0.0.0` | Bind address |
| `PORT` | | `8080` | Listen port |
| `JWT_EXPIRY_HOURS` | | `24` | Access token lifetime |
| `REFRESH_TOKEN_EXPIRY_DAYS` | | `30` | Refresh token lifetime |
| `CORS_ORIGINS` | | `http://localhost:3000` | Comma-separated allowed origins |
| `UPLOAD_DIR` | | `./uploads` | Local file storage path |
| `MAX_UPLOAD_SIZE_MB` | | `10` | File upload size limit |
| `ENVIRONMENT` | | `development` | `development` or `production` |
| `RUST_LOG` | | `info` | Log verbosity |

### Frontend (`frontend/.env.local`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | | `http://localhost:8080` | Backend API base URL |
| `NEXT_PUBLIC_SITE_URL` | | `http://localhost:3000` | Public site URL (metadata) |

---

## Completing the Admin Dashboard

The `AdminCrudTable` component makes adding new admin pages straightforward. Follow this pattern for any new entity (e.g. `experience`):

```tsx
// src/app/admin/dashboard/experience/page.tsx
'use client'
import { AdminCrudTable, FormDialog } from '@/components/admin/AdminCrudTable'
import { adminApi } from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// ... define schema, columns, form, mutations
```

Each admin page follows the same 4-step pattern:
1. `useQuery` to load data
2. `useForm` with Zod schema
3. `useMutation` for create/update/delete
4. Pass to `AdminCrudTable` + `FormDialog`

---

## Security Checklist

- [ ] Change default admin password immediately
- [ ] Generate strong `JWT_SECRET` (`openssl rand -hex 64`)
- [ ] Set strong `POSTGRES_PASSWORD`
- [ ] Configure `CORS_ORIGINS` to your domain only
- [ ] Enable SSL in production (Nginx + Certbot)
- [ ] Review rate limiting in `nginx/conf.d/portfolio.conf`
- [ ] Enable PostgreSQL SSL in production
- [ ] Set `ENVIRONMENT=production` in backend env
- [ ] Keep `RUST_LOG` at `info` or `warn` in production

---

## Performance Notes

- **Rust backend**: Typically handles 50k+ req/s on a single core
- **Connection pooling**: SQLx pool of 5–20 connections
- **Next.js**: Built with standalone output for minimal image size
- **Nginx**: Gzip compression + static asset caching headers
- **Database**: Full-text search indexes on projects + skills
- **Analytics**: Fire-and-forget async tracking (non-blocking)

---

## Extending

### Add a new section (e.g. "Publications")

1. Add table to `001_initial_schema.sql`
2. Add Rust model struct to `models/mod.rs`
3. Add public handler in `handlers/portfolio.rs`
4. Add admin CRUD handler in `handlers/admin/`
5. Register routes in `main.rs`
6. Add TypeScript type in `types/index.ts`
7. Add API method in `lib/api.ts`
8. Create public component in `components/portfolio/`
9. Create admin page in `app/admin/dashboard/`

---

## License

MIT — use freely for your own portfolio.
