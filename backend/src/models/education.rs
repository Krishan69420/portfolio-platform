use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
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

    pub cgpa: Option<f32>,
    pub max_cgpa: Option<f32>,
    pub percentage: Option<f32>,

    pub grade: Option<String>,

    pub location: Option<String>,

    pub description: Option<String>,

    pub achievements: Vec<String>,

    pub relevant_courses: Vec<String>,

    pub sort_order: i32,

    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct EducationRequest {
    pub institution_name: String,

    pub institution_logo_url: Option<String>,
    pub institution_url: Option<String>,

    pub degree: Option<String>,
    pub field_of_study: Option<String>,
    pub specialization: Option<String>,

    pub start_date: NaiveDate,
    pub end_date: Option<NaiveDate>,

    pub is_current: bool,

    pub cgpa: Option<f32>,
    pub max_cgpa: Option<f32>,
    pub percentage: Option<f32>,

    pub grade: Option<String>,

    pub location: Option<String>,

    pub description: Option<String>,

    pub achievements: Vec<String>,

    pub relevant_courses: Vec<String>,

    pub sort_order: i32,
}