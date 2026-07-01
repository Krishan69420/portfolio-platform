use crate::{errors::AppResult, AppState};
use axum::{extract::{Path, State}, Json};
use serde::Deserialize;
use uuid::Uuid;

#[derive(Deserialize)]
pub struct CreateSocialLink {
    pub platform: String,
    pub url: String,
    pub display_name: Option<String>,
    pub icon: Option<String>,
    pub is_visible: Option<bool>,
    pub sort_order: Option<i32>,
}

pub async fn list(State(state): State<AppState>) -> AppResult<Json<serde_json::Value>> {
    let rows = sqlx::query_as!(
        crate::models::SocialLink,
        "SELECT * FROM social_links ORDER BY sort_order, platform"
    )
    .fetch_all(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;
    Ok(Json(serde_json::json!({ "success": true, "data": rows })))
}

pub async fn create(
    State(state): State<AppState>,
    Json(req): Json<CreateSocialLink>,
) -> AppResult<Json<serde_json::Value>> {
    if req.platform.trim().is_empty() || req.url.trim().is_empty() {
        return Err(crate::errors::AppError::BadRequest("Platform and URL are required".into()));
    }
    let row = sqlx::query_as!(
        crate::models::SocialLink,
        r#"INSERT INTO social_links (platform, url, display_name, icon, is_visible, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6) RETURNING *"#,
        req.platform.trim().to_lowercase(), req.url.trim(),
        req.display_name, req.icon,
        req.is_visible.unwrap_or(true), req.sort_order.unwrap_or(0)
    )
    .fetch_one(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;
    Ok(Json(serde_json::json!({ "success": true, "data": row })))
}

pub async fn update(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(req): Json<CreateSocialLink>,
) -> AppResult<Json<serde_json::Value>> {
    let row = sqlx::query_as!(
        crate::models::SocialLink,
        r#"UPDATE social_links SET
           platform=$1, url=$2, display_name=$3, icon=$4, is_visible=$5, sort_order=$6
           WHERE id=$7 RETURNING *"#,
        req.platform.trim().to_lowercase(), req.url.trim(),
        req.display_name, req.icon,
        req.is_visible.unwrap_or(true), req.sort_order.unwrap_or(0), id
    )
    .fetch_optional(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?
    .ok_or_else(|| crate::errors::AppError::NotFound("Social link not found".into()))?;
    Ok(Json(serde_json::json!({ "success": true, "data": row })))
}

pub async fn delete(State(state): State<AppState>, Path(id): Path<Uuid>) -> AppResult<Json<serde_json::Value>> {
    sqlx::query!("DELETE FROM social_links WHERE id=$1", id)
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
