use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
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

    pub website_url: Option<String>,

    pub profile_picture_url: Option<String>,
    pub resume_url: Option<String>,

    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}