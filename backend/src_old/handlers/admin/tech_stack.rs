use crate::{errors::AppResult, AppState};
use axum::{extract::{Path, State}, Json};
use serde::Deserialize;
use uuid::Uuid;

#[derive(Deserialize)]
pub struct CreateTechStack {
    pub name: String,
    pub category: String,
    pub icon: Option<String>,
    pub icon_color: Option<String>,
    pub proficiency_score: Option<i32>,
    pub is_primary: Option<bool>,
    pub is_visible: Option<bool>,
    pub sort_order: Option<i32>,
}

pub async fn list(State(state): State<AppState>) -> AppResult<Json<serde_json::Value>> {
    let rows = sqlx::query!(
        "SELECT id,name,category,icon,icon_color,proficiency_score,is_primary,is_visible,sort_order,created_at FROM tech_stack ORDER BY sort_order, name"
    )
    .fetch_all(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;
    let data: Vec<_> = rows.iter().map(|r| serde_json::json!({
        "id": r.id, "name": r.name, "category": r.category,
        "icon": r.icon, "icon_color": r.icon_color,
        "proficiency_score": r.proficiency_score,
        "is_primary": r.is_primary, "is_visible": r.is_visible,
        "sort_order": r.sort_order, "created_at": r.created_at
    })).collect();
    Ok(Json(serde_json::json!({ "success": true, "data": data })))
}

pub async fn create(
    State(state): State<AppState>,
    Json(req): Json<CreateTechStack>,
) -> AppResult<Json<serde_json::Value>> {
    if req.name.trim().is_empty() {
        return Err(crate::errors::AppError::BadRequest("Name is required".into()));
    }
    let row = sqlx::query!(
        r#"INSERT INTO tech_stack (name, category, icon, icon_color, proficiency_score, is_primary, is_visible, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, name, category"#,
        req.name.trim(), req.category.trim(), req.icon, req.icon_color,
        req.proficiency_score, req.is_primary.unwrap_or(false),
        req.is_visible.unwrap_or(true), req.sort_order.unwrap_or(0)
    )
    .fetch_one(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;
    Ok(Json(serde_json::json!({ "success": true, "data": { "id": row.id, "name": row.name } })))
}

pub async fn update(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(req): Json<CreateTechStack>,
) -> AppResult<Json<serde_json::Value>> {
    sqlx::query!(
        r#"UPDATE tech_stack SET
           name=$1, category=$2, icon=$3, icon_color=$4, proficiency_score=$5,
           is_primary=$6, is_visible=$7, sort_order=$8
           WHERE id=$9"#,
        req.name.trim(), req.category.trim(), req.icon, req.icon_color,
        req.proficiency_score, req.is_primary.unwrap_or(false),
        req.is_visible.unwrap_or(true), req.sort_order.unwrap_or(0), id
    )
    .execute(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;
    Ok(Json(serde_json::json!({ "success": true })))
}

pub async fn delete(State(state): State<AppState>, Path(id): Path<Uuid>) -> AppResult<Json<serde_json::Value>> {
    sqlx::query!("DELETE FROM tech_stack WHERE id=$1", id)
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
