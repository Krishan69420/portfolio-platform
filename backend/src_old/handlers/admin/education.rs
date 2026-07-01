use crate::{errors::AppResult, AppState};
use axum::{extract::{Path, State}, Json};
use serde::Deserialize;
use uuid::Uuid;
use chrono::NaiveDate;

#[derive(Deserialize)]
pub struct CreateEducation {
    pub institution_name: String,
    pub institution_url: Option<String>,
    pub degree: Option<String>,
    pub field_of_study: Option<String>,
    pub specialization: Option<String>,
    pub location: Option<String>,
    pub start_date: NaiveDate,
    pub end_date: Option<NaiveDate>,
    pub is_current: Option<bool>,
    pub cgpa: Option<f64>,
    pub max_cgpa: Option<f64>,
    pub percentage: Option<f64>,
    pub description: Option<String>,
    pub sort_order: Option<i32>,
}

pub async fn list(State(state): State<AppState>) -> AppResult<Json<serde_json::Value>> {
    let rows = sqlx::query_as!(
        crate::models::Education,
        "SELECT * FROM education ORDER BY is_current DESC, start_date DESC"
    )
    .fetch_all(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;
    Ok(Json(serde_json::json!({ "success": true, "data": rows })))
}

pub async fn create(
    State(state): State<AppState>,
    Json(req): Json<CreateEducation>,
) -> AppResult<Json<serde_json::Value>> {
    if req.institution_name.trim().is_empty() {
        return Err(crate::errors::AppError::BadRequest("Institution name is required".into()));
    }
    let row = sqlx::query_as!(
        crate::models::Education,
        r#"INSERT INTO education
           (institution_name, institution_url, degree, field_of_study, specialization,
            location, start_date, end_date, is_current, cgpa, max_cgpa, percentage, description, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
           RETURNING *"#,
        req.institution_name.trim(), req.institution_url,
        req.degree, req.field_of_study, req.specialization,
        req.location, req.start_date, req.end_date,
        req.is_current.unwrap_or(false), req.cgpa, req.max_cgpa,
        req.percentage, req.description, req.sort_order.unwrap_or(0)
    )
    .fetch_one(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;
    Ok(Json(serde_json::json!({ "success": true, "data": row })))
}

pub async fn update(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(req): Json<CreateEducation>,
) -> AppResult<Json<serde_json::Value>> {
    let row = sqlx::query_as!(
        crate::models::Education,
        r#"UPDATE education SET
           institution_name=$1, institution_url=$2, degree=$3, field_of_study=$4,
           specialization=$5, location=$6, start_date=$7, end_date=$8, is_current=$9,
           cgpa=$10, max_cgpa=$11, percentage=$12, description=$13, sort_order=$14
           WHERE id=$15 RETURNING *"#,
        req.institution_name.trim(), req.institution_url,
        req.degree, req.field_of_study, req.specialization,
        req.location, req.start_date, req.end_date,
        req.is_current.unwrap_or(false), req.cgpa, req.max_cgpa,
        req.percentage, req.description, req.sort_order.unwrap_or(0), id
    )
    .fetch_optional(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?
    .ok_or_else(|| crate::errors::AppError::NotFound("Education not found".into()))?;
    Ok(Json(serde_json::json!({ "success": true, "data": row })))
}

pub async fn delete(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<serde_json::Value>> {
    sqlx::query!("DELETE FROM education WHERE id=$1", id)
        .execute(&state.db.pool)
        .await
        .map_err(crate::errors::AppError::DatabaseError)?;
    Ok(Json(serde_json::json!({ "success": true, "message": "Deleted" })))
}

// Unused router stubs (shared interface)
pub async fn get_one(State(_s): State<AppState>, Path(_id): Path<Uuid>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn upload_image(State(_s): State<AppState>, Path(_id): Path<Uuid>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn delete_image(State(_s): State<AppState>, Path((_id, _img_id)): Path<(Uuid,Uuid)>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn add_milestone(State(_s): State<AppState>, Path(_id): Path<Uuid>, Json(_r): Json<serde_json::Value>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn update_milestone(State(_s): State<AppState>, Path((_id,_mid)): Path<(Uuid,Uuid)>, Json(_r): Json<serde_json::Value>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn delete_milestone(State(_s): State<AppState>, Path((_id,_mid)): Path<(Uuid,Uuid)>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn log_streak(State(_s): State<AppState>, Path(_id): Path<Uuid>, Json(_r): Json<serde_json::Value>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn upload_resume(State(_s): State<AppState>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn list_versions(State(_s): State<AppState>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true,"data":[]}))) }
pub async fn activate_version(State(_s): State<AppState>, Path(_id): Path<Uuid>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn get_settings(State(_s): State<AppState>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true,"data":{}}))) }
pub async fn update_settings(State(_s): State<AppState>, Json(_r): Json<serde_json::Value>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
