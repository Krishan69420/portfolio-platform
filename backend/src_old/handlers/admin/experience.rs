use crate::{errors::AppResult, AppState};
use axum::{extract::{Path, State}, Json};
use serde::Deserialize;
use uuid::Uuid;
use chrono::NaiveDate;

#[derive(Deserialize)]
pub struct CreateExperience {
    pub company_name: String,
    pub company_url: Option<String>,
    pub role: String,
    pub employment_type: Option<String>,
    pub location: Option<String>,
    pub is_remote: Option<bool>,
    pub is_current: Option<bool>,
    pub start_date: NaiveDate,
    pub end_date: Option<NaiveDate>,
    pub description: Option<String>,
    pub tech_stack: Option<Vec<String>>,
    pub sort_order: Option<i32>,
}

pub async fn list(State(state): State<AppState>) -> AppResult<Json<serde_json::Value>> {
    let rows = sqlx::query_as!(
        crate::models::Experience,
        "SELECT * FROM experience ORDER BY is_current DESC, start_date DESC"
    )
    .fetch_all(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;
    Ok(Json(serde_json::json!({ "success": true, "data": rows })))
}

pub async fn create(
    State(state): State<AppState>,
    Json(req): Json<CreateExperience>,
) -> AppResult<Json<serde_json::Value>> {
    if req.company_name.trim().is_empty() || req.role.trim().is_empty() {
        return Err(crate::errors::AppError::BadRequest("Company and role are required".into()));
    }
    let row = sqlx::query_as!(
        crate::models::Experience,
        r#"INSERT INTO experience
           (company_name, company_url, role, employment_type, location, is_remote, is_current,
            start_date, end_date, description, tech_stack, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
           RETURNING *"#,
        req.company_name.trim(), req.company_url,
        req.role.trim(), req.employment_type, req.location,
        req.is_remote.unwrap_or(false), req.is_current.unwrap_or(false),
        req.start_date, req.end_date, req.description,
        req.tech_stack.as_deref(), req.sort_order.unwrap_or(0)
    )
    .fetch_one(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;
    Ok(Json(serde_json::json!({ "success": true, "data": row })))
}

pub async fn update(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(req): Json<CreateExperience>,
) -> AppResult<Json<serde_json::Value>> {
    let row = sqlx::query_as!(
        crate::models::Experience,
        r#"UPDATE experience SET
           company_name=$1, company_url=$2, role=$3, employment_type=$4, location=$5,
           is_remote=$6, is_current=$7, start_date=$8, end_date=$9, description=$10,
           tech_stack=$11, sort_order=$12
           WHERE id=$13 RETURNING *"#,
        req.company_name.trim(), req.company_url,
        req.role.trim(), req.employment_type, req.location,
        req.is_remote.unwrap_or(false), req.is_current.unwrap_or(false),
        req.start_date, req.end_date, req.description,
        req.tech_stack.as_deref(), req.sort_order.unwrap_or(0), id
    )
    .fetch_optional(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?
    .ok_or_else(|| crate::errors::AppError::NotFound("Experience not found".into()))?;
    Ok(Json(serde_json::json!({ "success": true, "data": row })))
}

pub async fn delete(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<serde_json::Value>> {
    sqlx::query!("DELETE FROM experience WHERE id=$1", id)
        .execute(&state.db.pool)
        .await
        .map_err(crate::errors::AppError::DatabaseError)?;
    Ok(Json(serde_json::json!({ "success": true, "message": "Deleted" })))
}

// Stub aliases required by main.rs router
pub async fn get_one(
    State(_s): State<AppState>,
    Path(_id): Path<Uuid>,
) -> AppResult<Json<serde_json::Value>> {
    Ok(Json(serde_json::json!({ "success": true })))
}
pub async fn upload_image(State(_s): State<AppState>, Path(_id): Path<Uuid>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn delete_image(State(_s): State<AppState>, Path((_id, _img_id)): Path<(Uuid, Uuid)>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn add_milestone(State(_s): State<AppState>, Path(_id): Path<Uuid>, Json(_r): Json<serde_json::Value>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn update_milestone(State(_s): State<AppState>, Path((_id, _mid)): Path<(Uuid, Uuid)>, Json(_r): Json<serde_json::Value>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn delete_milestone(State(_s): State<AppState>, Path((_id, _mid)): Path<(Uuid, Uuid)>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn log_streak(State(_s): State<AppState>, Path(_id): Path<Uuid>, Json(_r): Json<serde_json::Value>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn upload_resume(State(_s): State<AppState>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn list_versions(State(_s): State<AppState>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true,"data":[]}))) }
pub async fn activate_version(State(_s): State<AppState>, Path(_id): Path<Uuid>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn get_settings(State(_s): State<AppState>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true,"data":{}}))) }
pub async fn update_settings(State(_s): State<AppState>, Json(_r): Json<serde_json::Value>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
