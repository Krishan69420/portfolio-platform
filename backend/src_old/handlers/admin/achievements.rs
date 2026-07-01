use crate::{errors::AppResult, AppState};
use axum::{extract::{Path, State}, Json};
use serde::Deserialize;
use uuid::Uuid;
use chrono::NaiveDate;

#[derive(Deserialize)]
pub struct CreateAchievement {
    pub title: String,
    pub description: Option<String>,
    pub category: Option<String>,
    pub date: Option<NaiveDate>,
    pub organization: Option<String>,
    pub proof_url: Option<String>,
    pub icon: Option<String>,
    pub is_featured: Option<bool>,
    pub sort_order: Option<i32>,
}

pub async fn list(State(state): State<AppState>) -> AppResult<Json<serde_json::Value>> {
    let rows = sqlx::query_as!(
        crate::models::Achievement,
        "SELECT * FROM achievements ORDER BY sort_order, date DESC NULLS LAST"
    )
    .fetch_all(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;
    Ok(Json(serde_json::json!({ "success": true, "data": rows })))
}

pub async fn create(
    State(state): State<AppState>,
    Json(req): Json<CreateAchievement>,
) -> AppResult<Json<serde_json::Value>> {
    if req.title.trim().is_empty() {
        return Err(crate::errors::AppError::BadRequest("Title is required".into()));
    }
    let row = sqlx::query_as!(
        crate::models::Achievement,
        r#"INSERT INTO achievements
           (title, description, category, date, organization, proof_url, icon, is_featured, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *"#,
        req.title.trim(), req.description, req.category,
        req.date, req.organization, req.proof_url, req.icon,
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
    Json(req): Json<CreateAchievement>,
) -> AppResult<Json<serde_json::Value>> {
    let row = sqlx::query_as!(
        crate::models::Achievement,
        r#"UPDATE achievements SET
           title=$1, description=$2, category=$3, date=$4, organization=$5,
           proof_url=$6, icon=$7, is_featured=$8, sort_order=$9
           WHERE id=$10 RETURNING *"#,
        req.title.trim(), req.description, req.category,
        req.date, req.organization, req.proof_url, req.icon,
        req.is_featured.unwrap_or(false), req.sort_order.unwrap_or(0), id
    )
    .fetch_optional(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?
    .ok_or_else(|| crate::errors::AppError::NotFound("Achievement not found".into()))?;
    Ok(Json(serde_json::json!({ "success": true, "data": row })))
}

pub async fn delete(State(state): State<AppState>, Path(id): Path<Uuid>) -> AppResult<Json<serde_json::Value>> {
    sqlx::query!("DELETE FROM achievements WHERE id=$1", id)
        .execute(&state.db.pool).await
        .map_err(crate::errors::AppError::DatabaseError)?;
    Ok(Json(serde_json::json!({ "success": true })))
}

pub async fn get_one(State(_s): State<AppState>, Path(_id): Path<Uuid>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn upload_image(State(_s): State<AppState>, Path(_id): Path<Uuid>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn delete_image(State(_s): State<AppState>, Path((_id,_img_id)): Path<(Uuid,Uuid)>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn add_milestone(State(_s): State<AppState>, Path(_id): Path<Uuid>, Json(_r): Json<serde_json::Value>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn update_milestone(State(_s): State<AppState>, Path((_id,_mid)): Path<(Uuid,Uuid)>, Json(_r): Json<serde_json::Value>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn delete_milestone(State(_s): State<AppState>, Path((_id,_mid)): Path<(Uuid,Uuid)>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn log_streak(State(_s): State<AppState>, Path(_id): Path<Uuid>, Json(_r): Json<serde_json::Value>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn upload_resume(State(_s): State<AppState>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn list_versions(State(_s): State<AppState>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true,"data":[]}))) }
pub async fn activate_version(State(_s): State<AppState>, Path(_id): Path<Uuid>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn get_settings(State(_s): State<AppState>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true,"data":{}}))) }
pub async fn update_settings(State(_s): State<AppState>, Json(_r): Json<serde_json::Value>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
