use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Certification {
    pub id: Uuid,

    pub name: String,
    pub issuing_organization: String,

    pub issue_date: NaiveDate,
    pub expiry_date: Option<NaiveDate>,

    pub credential_id: Option<String>,
    pub credential_url: Option<String>,

    pub image_url: Option<String>,

    pub skills: Vec<String>,

    pub is_featured: bool,

    pub sort_order: i32,

    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CertificationRequest {
    pub name: String,

    pub issuing_organization: String,

    pub issue_date: NaiveDate,
    pub expiry_date: Option<NaiveDate>,

    pub credential_id: Option<String>,
    pub credential_url: Option<String>,

    pub image_url: Option<String>,

    pub skills: Vec<String>,

    pub is_featured: bool,

    pub sort_order: i32,
}