use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use sqlx::types::ipnetwork::IpNetwork;
use uuid::Uuid;

pub mod extra;
pub use extra::*;
// ─── Personal Info ────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct PersonalInfo {
    pub id: Uuid,
    pub full_name: String,
    pub title: String,
    pub tagline: Option<String>,
    pub bio: Option<String>,
    pub short_bio: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub location: Option<String>,
    pub availability_status: Option<String>,
    pub profile_picture_url: Option<String>,
    pub resume_url: Option<String>,
    pub resume_version: Option<i32>,
    pub website_url: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdatePersonalInfo {
    pub full_name: Option<String>,
    pub title: Option<String>,
    pub tagline: Option<String>,
    pub bio: Option<String>,
    pub short_bio: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub location: Option<String>,
    pub availability_status: Option<String>,
    pub website_url: Option<String>,
}

// ─── Social Links ─────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct SocialLink {
    pub id: Uuid,
    pub platform: String,
    pub url: String,
    pub display_name: Option<String>,
    pub icon: Option<String>,
    pub is_visible: bool,
    pub sort_order: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateSocialLink {
    pub platform: String,
    pub url: String,
    pub display_name: Option<String>,
    pub icon: Option<String>,
    pub is_visible: Option<bool>,
    pub sort_order: Option<i32>,
}

// ─── Skills ───────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Skill {
    pub id: Uuid,
    pub name: String,
    pub category: String,
    pub experience_level: Option<String>,
    pub years_of_experience: Option<f64>,
    pub icon: Option<String>,
    pub icon_color: Option<String>,
    pub is_featured: bool,
    pub is_currently_learning: bool,
    pub proficiency_score: Option<i32>,
    pub sort_order: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateSkill {
    pub name: String,
    pub category: String,
    pub experience_level: Option<String>,
    pub years_of_experience: Option<f64>,
    pub icon: Option<String>,
    pub icon_color: Option<String>,
    pub is_featured: Option<bool>,
    pub is_currently_learning: Option<bool>,
    pub proficiency_score: Option<i32>,
    pub sort_order: Option<i32>,
}

// ─── Experience ───────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Experience {
    pub id: Uuid,
    pub company_name: String,
    pub company_logo_url: Option<String>,
    pub company_url: Option<String>,
    pub role: String,
    pub employment_type: Option<String>,
    pub location: Option<String>,
    pub is_remote: bool,
    pub start_date: NaiveDate,
    pub end_date: Option<NaiveDate>,
    pub is_current: bool,
    pub description: Option<String>,
    pub responsibilities: Option<Vec<String>>,
    pub achievements: Option<Vec<String>>,
    pub tech_stack: Option<Vec<String>>,
    pub sort_order: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateExperience {
    pub company_name: String,
    pub company_logo_url: Option<String>,
    pub company_url: Option<String>,
    pub role: String,
    pub employment_type: Option<String>,
    pub location: Option<String>,
    pub is_remote: Option<bool>,
    pub start_date: NaiveDate,
    pub end_date: Option<NaiveDate>,
    pub is_current: Option<bool>,
    pub description: Option<String>,
    pub responsibilities: Option<Vec<String>>,
    pub achievements: Option<Vec<String>>,
    pub tech_stack: Option<Vec<String>>,
    pub sort_order: Option<i32>,
}

// ─── Education ────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Education {
    pub id: Uuid,
    pub institution_name: String,
    pub institution_logo_url: Option<String>,
    pub institution_url: Option<String>,
    pub degree: Option<String>,
    pub field_of_study: Option<String>,
    pub specialization: Option<String>,
    pub start_date: NaiveDate,
    pub end_date: Option<NaiveDate>,
    pub is_current: bool,
    pub cgpa: Option<f64>,
    pub max_cgpa: Option<f64>,
    pub percentage: Option<f64>,
    pub grade: Option<String>,
    pub location: Option<String>,
    pub description: Option<String>,
    pub achievements: Option<Vec<String>>,
    pub relevant_courses: Option<Vec<String>>,
    pub sort_order: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// ─── Projects ─────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Project {
    pub id: Uuid,
    pub title: String,
    pub slug: String,
    pub short_description: Option<String>,
    pub description: Option<String>,
    pub tech_stack: Option<Vec<String>>,
    pub github_url: Option<String>,
    pub live_demo_url: Option<String>,
    pub cover_image_url: Option<String>,
    pub status: Option<String>,
    pub category: Option<String>,
    pub is_featured: bool,
    pub is_open_source: bool,
    pub start_date: Option<NaiveDate>,
    pub end_date: Option<NaiveDate>,
    pub view_count: i32,
    pub sort_order: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct ProjectImage {
    pub id: Uuid,
    pub project_id: Uuid,
    pub image_url: String,
    pub alt_text: Option<String>,
    pub caption: Option<String>,
    pub sort_order: i32,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectWithImages {
    #[serde(flatten)]
    pub project: Project,
    pub images: Vec<ProjectImage>,
    pub tags: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateProject {
    pub title: String,
    pub short_description: Option<String>,
    pub description: Option<String>,
    pub tech_stack: Option<Vec<String>>,
    pub github_url: Option<String>,
    pub live_demo_url: Option<String>,
    pub status: Option<String>,
    pub category: Option<String>,
    pub is_featured: Option<bool>,
    pub is_open_source: Option<bool>,
    pub start_date: Option<NaiveDate>,
    pub end_date: Option<NaiveDate>,
    pub sort_order: Option<i32>,
    pub tags: Option<Vec<String>>,
}

// ─── Certifications ───────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Certification {
    pub id: Uuid,
    pub name: String,
    pub issuing_organization: String,
    pub issue_date: NaiveDate,
    pub expiry_date: Option<NaiveDate>,
    pub credential_id: Option<String>,
    pub credential_url: Option<String>,
    pub image_url: Option<String>,
    pub skills: Option<Vec<String>>,
    pub is_featured: bool,
    pub sort_order: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// ─── Achievements ─────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Achievement {
    pub id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub category: Option<String>,
    pub date: Option<NaiveDate>,
    pub organization: Option<String>,
    pub proof_url: Option<String>,
    pub icon: Option<String>,
    pub is_featured: bool,
    pub sort_order: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// ─── Learning ─────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct LearningTopic {
    pub id: Uuid,
    pub name: String,
    pub category: Option<String>,
    pub description: Option<String>,
    pub icon: Option<String>,
    pub icon_color: Option<String>,
    pub progress_percentage: i32,
    pub target_completion_date: Option<NaiveDate>,
    pub current_streak_days: i32,
    pub longest_streak_days: i32,
    pub last_activity_date: Option<NaiveDate>,
    pub status: Option<String>,
    pub is_featured: bool,
    pub sort_order: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct LearningMilestone {
    pub id: Uuid,
    pub topic_id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub target_date: Option<NaiveDate>,
    pub completed_at: Option<DateTime<Utc>>,
    pub is_completed: bool,
    pub sort_order: i32,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LearningTopicWithMilestones {
    #[serde(flatten)]
    pub topic: LearningTopic,
    pub milestones: Vec<LearningMilestone>,
}

// ─── Contact ──────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct ContactMessage {
    pub id: Uuid,
    pub sender_name: String,
    pub sender_email: String,
    pub subject: Option<String>,
    pub message: String,
    pub ip_address: Option<IpNetwork>,
    pub user_agent: Option<String>,
    pub is_read: bool,
    pub is_replied: bool,
    pub is_spam: bool,
    pub replied_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateContactMessage {
    pub sender_name: String,
    pub sender_email: String,
    pub subject: Option<String>,
    pub message: String,
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub password_hash: String,
    pub role: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub last_login: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthResponse {
    pub access_token: String,
    pub refresh_token: String,
    pub token_type: String,
    pub expires_in: u64,
    pub user: UserPublic,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserPublic {
    pub id: Uuid,
    pub email: String,
    pub role: String,
}

// ─── Tech Stack ───────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct TechStack {
    pub id: Uuid,
    pub name: String,
    pub category: String,
    pub icon: Option<String>,
    pub icon_color: Option<String>,
    pub proficiency_score: Option<i32>,
    pub is_primary: bool,
    pub is_visible: bool,
    pub sort_order: i32,
    pub created_at: DateTime<Utc>,
}

// ─── Analytics ────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize)]
pub struct TrackPageView {
    pub page_path: String,
    pub referrer: Option<String>,
    pub session_id: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AnalyticsOverview {
    pub total_views: i64,
    pub views_today: i64,
    pub views_this_week: i64,
    pub views_this_month: i64,
    pub total_projects: i64,
    pub total_skills: i64,
    pub total_messages: i64,
    pub unread_messages: i64,
    pub resume_downloads: i64,
    pub resume_downloads_this_month: i64,
    pub top_projects: Vec<TopProject>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct TopProject {
    pub id: Uuid,
    pub title: String,
    pub view_count: i32,
}

// ─── Pagination ───────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize)]
pub struct PaginationParams {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub search: Option<String>,
    pub filter: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PaginatedResponse<T> {
    pub data: Vec<T>,
    pub total: i64,
    pub page: i64,
    pub per_page: i64,
    pub total_pages: i64,
}

impl<T> PaginatedResponse<T> {
    pub fn new(data: Vec<T>, total: i64, page: i64, per_page: i64) -> Self {
        let total_pages = (total as f64 / per_page as f64).ceil() as i64;
        Self {
            data,
            total,
            page,
            per_page,
            total_pages,
        }
    }
}

// ─── Resume Versions ─────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct ResumeVersion {
    pub id: Uuid,
    pub version_number: i32,
    pub file_url: String,
    pub file_name: String,
    pub file_size: Option<i64>,
    pub is_current: bool,
    pub download_count: i32,
    pub uploaded_at: DateTime<Utc>,
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct BlogPost {
    pub id: Uuid,
    pub title: String,
    pub slug: String,
    pub excerpt: Option<String>,
    pub content: Option<String>,
    pub cover_image_url: Option<String>,
    pub tags: Option<Vec<String>>,
    pub is_published: bool,
    pub is_featured: bool,
    pub read_time_minutes: Option<i32>,
    pub view_count: i32,
    pub published_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
