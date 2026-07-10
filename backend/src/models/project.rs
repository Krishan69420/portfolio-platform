use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Project {
    pub id: Uuid,

    pub title: String,
    pub slug: String,

    pub short_description: String,
    pub description: Option<String>,

    pub tech_stack: Vec<String>,

    pub github_url: Option<String>,
    pub live_demo_url: Option<String>,
    pub cover_image_url: Option<String>,

    pub status: String,
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

#[derive(Debug, Deserialize)]
pub struct CreateProjectRequest {
    pub title: String,
    pub short_description: String,
    pub description: Option<String>,

    pub tech_stack: Vec<String>,

    pub github_url: Option<String>,
    pub live_demo_url: Option<String>,
    pub cover_image_url: Option<String>,

    pub category: Option<String>,

    pub is_featured: bool,
    pub is_open_source: bool,

    pub start_date: Option<chrono::NaiveDate>,
    pub end_date: Option<chrono::NaiveDate>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProjectRequest {
    pub title: String,
    pub short_description: String,
    pub description: Option<String>,

    pub tech_stack: Vec<String>,

    pub github_url: Option<String>,
    pub live_demo_url: Option<String>,
    pub cover_image_url: Option<String>,

    pub category: Option<String>,

    pub is_featured: bool,
    pub is_open_source: bool,

    pub start_date: Option<chrono::NaiveDate>,
    pub end_date: Option<chrono::NaiveDate>,
}