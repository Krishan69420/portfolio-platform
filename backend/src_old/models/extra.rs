// Additional create/update request structs (not in mod.rs)
use chrono::NaiveDate;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateMilestone {
    pub title: String,
    pub description: Option<String>,
    pub target_date: Option<NaiveDate>,
    pub is_completed: Option<bool>,
    pub sort_order: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StreakLog {
    pub log_date: NaiveDate,
    pub minutes_spent: Option<i32>,
    pub notes: Option<String>,
}
