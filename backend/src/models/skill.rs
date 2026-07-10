use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Skill {
    pub id: Uuid,

    pub name: String,

    pub category: String,

    pub experience_level: Option<String>,

    pub years_of_experience: Option<f32>,

    pub icon: Option<String>,

    pub icon_color: Option<String>,

    pub is_featured: bool,

    pub is_currently_learning: bool,

    pub proficiency_score: i32,

    pub sort_order: i32,

    pub created_at: DateTime<Utc>,

    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct SkillRequest {
    pub name: String,

    pub category: String,

    pub experience_level: Option<String>,

    pub years_of_experience: Option<f32>,

    pub icon: Option<String>,

    pub icon_color: Option<String>,

    pub is_featured: bool,

    pub is_currently_learning: bool,

    pub proficiency_score: i32,

    pub sort_order: i32,
}