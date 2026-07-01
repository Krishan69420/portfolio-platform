use crate::{errors::AppResult, AppState};
use axum::{extract::{Path, State}, Json};
use serde::Deserialize;
use uuid::Uuid;
use chrono::NaiveDate;

#[derive(Deserialize)]
pub struct CreateLearningTopic {
    pub name: String,
    pub category: Option<String>,
    pub description: Option<String>,
    pub icon: Option<String>,
    pub icon_color: Option<String>,
    pub progress_percentage: Option<i32>,
    pub status: Option<String>,
    pub is_featured: Option<bool>,
    pub sort_order: Option<i32>,
}

#[derive(Deserialize)]
pub struct CreateMilestone {
    pub title: String,
    pub description: Option<String>,
    pub target_date: Option<NaiveDate>,
    pub is_completed: Option<bool>,
    pub sort_order: Option<i32>,
}

#[derive(Deserialize)]
pub struct StreakLog {
    pub log_date: NaiveDate,
    pub minutes_spent: Option<i32>,
    pub notes: Option<String>,
}

pub async fn list(State(state): State<AppState>) -> AppResult<Json<serde_json::Value>> {
    let rows = sqlx::query_as!(
        crate::models::LearningTopic,
        "SELECT * FROM learning_topics ORDER BY sort_order, name"
    )
    .fetch_all(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;
    Ok(Json(serde_json::json!({ "success": true, "data": rows })))
}

pub async fn create(
    State(state): State<AppState>,
    Json(req): Json<CreateLearningTopic>,
) -> AppResult<Json<serde_json::Value>> {
    if req.name.trim().is_empty() {
        return Err(crate::errors::AppError::BadRequest("Name is required".into()));
    }
    let progress = req.progress_percentage.unwrap_or(0).clamp(0, 100);
    let row = sqlx::query_as!(
        crate::models::LearningTopic,
        r#"INSERT INTO learning_topics
           (name, category, description, icon, icon_color, progress_percentage, status, is_featured, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *"#,
        req.name.trim(), req.category, req.description,
        req.icon, req.icon_color, progress,
        req.status.as_deref().unwrap_or("not-started"),
        req.is_featured.unwrap_or(false), req.sort_order.unwrap_or(0)
    )
    .fetch_one(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;
    Ok(Json(serde_json::json!({ "success": true, "data": row })))
}

pub async fn update(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(req): Json<CreateLearningTopic>,
) -> AppResult<Json<serde_json::Value>> {
    let progress = req.progress_percentage.unwrap_or(0).clamp(0, 100);
    let row = sqlx::query_as!(
        crate::models::LearningTopic,
        r#"UPDATE learning_topics SET
           name=$1, category=$2, description=$3, icon=$4, icon_color=$5,
           progress_percentage=$6, status=$7, is_featured=$8, sort_order=$9
           WHERE id=$10 RETURNING *"#,
        req.name.trim(), req.category, req.description,
        req.icon, req.icon_color, progress,
        req.status.as_deref().unwrap_or("in-progress"),
        req.is_featured.unwrap_or(false), req.sort_order.unwrap_or(0), id
    )
    .fetch_optional(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?
    .ok_or_else(|| crate::errors::AppError::NotFound("Learning topic not found".into()))?;
    Ok(Json(serde_json::json!({ "success": true, "data": row })))
}

pub async fn delete(State(state): State<AppState>, Path(id): Path<Uuid>) -> AppResult<Json<serde_json::Value>> {
    sqlx::query!("DELETE FROM learning_topics WHERE id=$1", id)
        .execute(&state.db.pool).await
        .map_err(crate::errors::AppError::DatabaseError)?;
    Ok(Json(serde_json::json!({ "success": true })))
}

pub async fn add_milestone(
    State(state): State<AppState>,
    Path(topic_id): Path<Uuid>,
    Json(req): Json<CreateMilestone>,
) -> AppResult<Json<serde_json::Value>> {
    let row = sqlx::query_as!(
        crate::models::LearningMilestone,
        r#"INSERT INTO learning_milestones
           (topic_id, title, description, target_date, is_completed, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6) RETURNING *"#,
        topic_id, req.title.trim(), req.description,
        req.target_date, req.is_completed.unwrap_or(false),
        req.sort_order.unwrap_or(0)
    )
    .fetch_one(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;
    Ok(Json(serde_json::json!({ "success": true, "data": row })))
}

pub async fn update_milestone(
    State(state): State<AppState>,
    Path((topic_id, milestone_id)): Path<(Uuid, Uuid)>,
    Json(req): Json<CreateMilestone>,
) -> AppResult<Json<serde_json::Value>> {
    let completed_at: Option<chrono::DateTime<chrono::Utc>> = if req.is_completed.unwrap_or(false) {
        Some(chrono::Utc::now())
    } else { None };
    sqlx::query!(
        r#"UPDATE learning_milestones SET
           title=$1, description=$2, target_date=$3, is_completed=$4,
           completed_at=COALESCE($5, completed_at), sort_order=$6
           WHERE id=$7 AND topic_id=$8"#,
        req.title.trim(), req.description, req.target_date,
        req.is_completed.unwrap_or(false), completed_at,
        req.sort_order.unwrap_or(0), milestone_id, topic_id
    )
    .execute(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;
    Ok(Json(serde_json::json!({ "success": true })))
}

pub async fn delete_milestone(
    State(state): State<AppState>,
    Path((_topic_id, milestone_id)): Path<(Uuid, Uuid)>,
) -> AppResult<Json<serde_json::Value>> {
    sqlx::query!("DELETE FROM learning_milestones WHERE id=$1", milestone_id)
        .execute(&state.db.pool).await
        .map_err(crate::errors::AppError::DatabaseError)?;
    Ok(Json(serde_json::json!({ "success": true })))
}

pub async fn log_streak(
    State(state): State<AppState>,
    Path(topic_id): Path<Uuid>,
    Json(req): Json<StreakLog>,
) -> AppResult<Json<serde_json::Value>> {
    sqlx::query!(
        r#"INSERT INTO learning_streak_log (topic_id, log_date, minutes_spent, notes)
           VALUES ($1,$2,$3,$4)
           ON CONFLICT (topic_id, log_date) DO UPDATE
           SET minutes_spent=$3, notes=$4"#,
        topic_id, req.log_date, req.minutes_spent, req.notes
    )
    .execute(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;

    // Update streak count
    let streak_days: i64 = sqlx::query_scalar!(
        r#"SELECT COUNT(*) FROM (
            SELECT log_date,
                   log_date - ROW_NUMBER() OVER (ORDER BY log_date)::integer AS grp
            FROM learning_streak_log
            WHERE topic_id=$1
        ) g WHERE grp = (
            SELECT log_date - ROW_NUMBER() OVER (ORDER BY log_date)::integer
            FROM learning_streak_log
            WHERE topic_id=$1
            ORDER BY log_date DESC LIMIT 1
        )"#,
        topic_id
    )
    .fetch_one(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?
    .unwrap_or(1);

    sqlx::query!(
        r#"UPDATE learning_topics SET
           current_streak_days=$1,
           longest_streak_days=GREATEST(longest_streak_days, $1),
           last_activity_date=$2
           WHERE id=$3"#,
        streak_days as i32, req.log_date, topic_id
    )
    .execute(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;

    Ok(Json(serde_json::json!({ "success": true, "current_streak": streak_days })))
}

// Unused stubs
pub async fn get_one(State(_s): State<AppState>, Path(_id): Path<Uuid>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn upload_image(State(_s): State<AppState>, Path(_id): Path<Uuid>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn delete_image(State(_s): State<AppState>, Path((_id,_img_id)): Path<(Uuid,Uuid)>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn upload_resume(State(_s): State<AppState>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn list_versions(State(_s): State<AppState>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true,"data":[]}))) }
pub async fn activate_version(State(_s): State<AppState>, Path(_id): Path<Uuid>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn get_settings(State(_s): State<AppState>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true,"data":{}}))) }
pub async fn update_settings(State(_s): State<AppState>, Json(_r): Json<serde_json::Value>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
