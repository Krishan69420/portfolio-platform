use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Experience {
    pub id: Uuid,
    pub company_name: String,
    pub company_logo_url: Option<String>,
    pub company_url: Option<String>,
    pub role: String,
    pub employment_type: String,
    pub location: Option<String>,
    pub is_remote: bool,
    pub start_date: NaiveDate,
    pub end_date: Option<NaiveDate>,
    pub is_current: bool,
    pub description: Option<String>,
    pub responsibilities: Vec<String>,
    pub achievements: Vec<String>,
    pub tech_stack: Vec<String>,
    pub sort_order: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct ExperienceRequest {
    pub company_name: String,
    pub company_logo_url: Option<String>,
    pub company_url: Option<String>,
    pub role: String,
    pub employment_type: String,
    pub location: Option<String>,
    pub is_remote: bool,
    pub start_date: NaiveDate,
    pub end_date: Option<NaiveDate>,
    pub is_current: bool,
    pub description: Option<String>,
    pub responsibilities: Vec<String>,
    pub achievements: Vec<String>,
    pub tech_stack: Vec<String>,
    pub sort_order: i32,
}