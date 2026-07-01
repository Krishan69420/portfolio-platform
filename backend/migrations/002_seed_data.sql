-- ============================================================
-- Seed Data - Portfolio Platform
-- Migration: 002_seed_data.sql
-- ============================================================

-- Admin user (password: Admin@123456 - change immediately)
-- Hash generated with bcrypt cost 12
INSERT INTO users (email, password_hash, role) VALUES (
    'admin@portfolio.dev',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBR5yE5BkN5m6u',
    'admin'
) ON CONFLICT DO NOTHING;

-- Personal Info
INSERT INTO personal_info (
    full_name, title, tagline, bio, short_bio,
    email, location, availability_status
) VALUES (
    'Krishan Kumar',
    'Software Engineer & Blockchain Developer',
    'Building fast, secure systems in Rust & Solana',
    'I am a B.Tech CSE (AI/ML) student at SRM Institute of Science and Technology, passionate about building high-performance systems using Rust and decentralized applications on Solana. I love pushing the boundaries of what''s possible with modern technology.',
    'Rust & Solana developer. Building the decentralized future, one block at a time.',
    'admin@portfolio.dev',
    'Chennai, Tamil Nadu, India',
    'Open to opportunities'
) ON CONFLICT DO NOTHING;

-- Social Links
INSERT INTO social_links (platform, url, display_name, icon, sort_order) VALUES
    ('github', 'https://github.com/krishankumar', 'GitHub', 'github', 1),
    ('linkedin', 'https://linkedin.com/in/krishankumar', 'LinkedIn', 'linkedin', 2),
    ('twitter', 'https://twitter.com/krishankumar', 'Twitter / X', 'twitter', 3),
    ('email', 'mailto:admin@portfolio.dev', 'Email', 'mail', 4),
    ('discord', 'https://discord.com/users/krishankumar', 'Discord', 'discord', 5);

-- Skills
INSERT INTO skills (name, category, experience_level, years_of_experience, icon_color, is_featured, proficiency_score) VALUES
    ('Rust', 'Systems', 'intermediate', 1.5, '#CE412B', TRUE, 72),
    ('TypeScript', 'Frontend', 'advanced', 2.5, '#3178C6', TRUE, 85),
    ('Solana', 'Blockchain', 'intermediate', 1.0, '#9945FF', TRUE, 65),
    ('React / Next.js', 'Frontend', 'advanced', 2.0, '#61DAFB', TRUE, 80),
    ('Python', 'Backend', 'advanced', 3.0, '#3776AB', FALSE, 82),
    ('PostgreSQL', 'Database', 'intermediate', 2.0, '#336791', FALSE, 70),
    ('Docker', 'DevOps', 'intermediate', 1.5, '#2496ED', FALSE, 68),
    ('Web3 / Anchor', 'Blockchain', 'beginner', 0.8, '#F16822', FALSE, 45);

-- Tech Stack
INSERT INTO tech_stack (name, category, icon_color, is_primary, sort_order) VALUES
    ('Rust', 'Language', '#CE412B', TRUE, 1),
    ('TypeScript', 'Language', '#3178C6', TRUE, 2),
    ('Next.js 15', 'Framework', '#000000', TRUE, 3),
    ('Axum', 'Framework', '#CE412B', TRUE, 4),
    ('PostgreSQL', 'Database', '#336791', TRUE, 5),
    ('Solana', 'Blockchain', '#9945FF', TRUE, 6),
    ('Docker', 'DevOps', '#2496ED', FALSE, 7),
    ('Tailwind CSS', 'Styling', '#06B6D4', FALSE, 8);

-- Education
INSERT INTO education (
    institution_name, degree, field_of_study, specialization,
    start_date, is_current, cgpa, max_cgpa, location
) VALUES (
    'SRM Institute of Science and Technology',
    'Bachelor of Technology',
    'Computer Science and Engineering',
    'Artificial Intelligence and Machine Learning',
    '2022-07-01',
    TRUE,
    8.45,
    10.0,
    'Chennai, Tamil Nadu, India'
);

-- Learning Topics
INSERT INTO learning_topics (name, category, description, icon, icon_color, progress_percentage, status, is_featured, sort_order) VALUES
    ('Rust Programming', 'Systems', 'Deep dive into Rust ownership, lifetimes, async, and systems programming', 'code', '#CE412B', 72, 'in-progress', TRUE, 1),
    ('Solana Development', 'Blockchain', 'Building programs with Anchor framework, SPL tokens, and DeFi protocols', 'layers', '#9945FF', 60, 'in-progress', TRUE, 2),
    ('Web3 & DeFi', 'Blockchain', 'Understanding DeFi primitives, AMMs, lending protocols, and MEV', 'globe', '#F16822', 45, 'in-progress', TRUE, 3),
    ('System Design', 'Architecture', 'Designing scalable distributed systems, databases, and microservices', 'server', '#06B6D4', 55, 'in-progress', FALSE, 4),
    ('Data Structures & Algorithms', 'CS Fundamentals', 'Mastering DSA for competitive programming and interviews', 'cpu', '#10B981', 80, 'in-progress', FALSE, 5),
    ('Backend Development', 'Backend', 'Building production-grade APIs, microservices, and databases', 'database', '#8B5CF6', 75, 'in-progress', FALSE, 6);

-- Learning Milestones (Rust)
WITH rust_topic AS (SELECT id FROM learning_topics WHERE name = 'Rust Programming')
INSERT INTO learning_milestones (topic_id, title, description, is_completed, completed_at, sort_order)
SELECT
    rt.id,
    m.title,
    m.description,
    m.is_completed,
    m.completed_at,
    m.sort_order
FROM rust_topic rt, (VALUES
    ('Ownership & Borrowing', 'Master Rust''s unique memory model', TRUE, NOW() - INTERVAL '60 days', 1),
    ('Async/Await & Tokio', 'Build async applications with Tokio runtime', TRUE, NOW() - INTERVAL '30 days', 2),
    ('Build a REST API with Axum', 'Complete REST API with auth and database', TRUE, NOW() - INTERVAL '7 days', 3),
    ('Macros & Procedural Macros', 'Metaprogramming in Rust', FALSE, NULL, 4),
    ('Unsafe Rust & FFI', 'Low-level systems programming', FALSE, NULL, 5)
) AS m(title, description, is_completed, completed_at, sort_order);

-- Sample Project
INSERT INTO projects (
    title, slug, short_description, description,
    tech_stack, github_url, status, category, is_featured, start_date
) VALUES (
    'Solana DeFi Dashboard',
    'solana-defi-dashboard',
    'Real-time DeFi analytics dashboard for Solana ecosystem protocols',
    'A comprehensive dashboard for tracking DeFi positions across Solana protocols including Raydium, Orca, and Marinade Finance. Features real-time price feeds, portfolio tracking, and yield optimization suggestions.',
    ARRAY['Rust', 'Solana', 'Anchor', 'React', 'TypeScript', 'PostgreSQL'],
    'https://github.com/krishankumar/solana-defi-dashboard',
    'in-progress',
    'Blockchain',
    TRUE,
    '2024-01-15'
);

INSERT INTO projects (
    title, slug, short_description, description,
    tech_stack, github_url, status, category, is_featured, start_date, end_date
) VALUES (
    'Portfolio CMS',
    'portfolio-cms',
    'Full-stack portfolio management system built with Rust and Next.js',
    'This very platform! A production-ready portfolio CMS with Rust/Axum backend, Next.js 15 frontend, JWT auth, and PostgreSQL. Features admin dashboard, analytics, and content management.',
    ARRAY['Rust', 'Axum', 'Next.js', 'TypeScript', 'PostgreSQL', 'Docker'],
    'https://github.com/krishankumar/portfolio-cms',
    'completed',
    'Full Stack',
    TRUE,
    '2024-03-01',
    '2024-04-01'
);

-- Site Settings
INSERT INTO site_settings (key, value, description) VALUES
    ('site_title', 'Krishan Kumar | Software Engineer', 'Browser tab title'),
    ('site_description', 'Software Engineer specializing in Rust and Solana blockchain development', 'Meta description'),
    ('maintenance_mode', 'false', 'Put site in maintenance mode'),
    ('analytics_enabled', 'true', 'Enable page view tracking'),
    ('contact_enabled', 'true', 'Enable contact form'),
    ('blog_enabled', 'false', 'Enable blog section')
ON CONFLICT (key) DO NOTHING;
