use crate::{errors::AppResult, AppState};
use axum::{extract::{Path, State}, Json};
use serde::Deserialize;
use uuid::Uuid;
use crate::utils::make_slug_simple;

#[derive(Deserialize)]
pub struct CreateBlogPost {
    pub title: String,
    pub excerpt: Option<String>,
    pub content: Option<String>,
    pub cover_image_url: Option<String>,
    pub tags: Option<Vec<String>>,
    pub is_published: Option<bool>,
    pub is_featured: Option<bool>,
    pub read_time_minutes: Option<i32>,
}

pub async fn list(State(state): State<AppState>) -> AppResult<Json<serde_json::Value>> {
    let rows = sqlx::query_as!(
        crate::models::BlogPost,
        "SELECT * FROM blog_posts ORDER BY created_at DESC"
    )
    .fetch_all(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;
    Ok(Json(serde_json::json!({ "success": true, "data": rows })))
}

pub async fn create(
    State(state): State<AppState>,
    Json(req): Json<CreateBlogPost>,
) -> AppResult<Json<serde_json::Value>> {
    if req.title.trim().is_empty() {
        return Err(crate::errors::AppError::BadRequest("Title is required".into()));
    }
    let slug = make_slug_simple(&req.title);
    let published_at = if req.is_published.unwrap_or(false) {
        Some(chrono::Utc::now())
    } else { None };

    let row = sqlx::query_as!(
        crate::models::BlogPost,
        r#"INSERT INTO blog_posts
           (title, slug, excerpt, content, cover_image_url, tags,
            is_published, is_featured, read_time_minutes, published_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *"#,
        req.title.trim(), slug, req.excerpt, req.content,
        req.cover_image_url,
        req.tags.as_deref(),
        req.is_published.unwrap_or(false),
        req.is_featured.unwrap_or(false),
        req.read_time_minutes, published_at
    )
    .fetch_one(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;
    Ok(Json(serde_json::json!({ "success": true, "data": row })))
}

pub async fn update(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(req): Json<CreateBlogPost>,
) -> AppResult<Json<serde_json::Value>> {
    let existing = sqlx::query!("SELECT published_at, is_published FROM blog_posts WHERE id=$1", id)
        .fetch_optional(&state.db.pool)
        .await
        .map_err(crate::errors::AppError::DatabaseError)?
        .ok_or_else(|| crate::errors::AppError::NotFound("Post not found".into()))?;

    let published_at = if req.is_published.unwrap_or(false) && !existing.is_published {
        Some(chrono::Utc::now())
    } else {
        existing.published_at
    };

    let row = sqlx::query_as!(
        crate::models::BlogPost,
        r#"UPDATE blog_posts SET
           title=$1, excerpt=$2, content=$3, cover_image_url=$4, tags=$5,
           is_published=$6, is_featured=$7, read_time_minutes=$8, published_at=$9
           WHERE id=$10 RETURNING *"#,
        req.title.trim(), req.excerpt, req.content,
        req.cover_image_url,
        req.tags.as_deref(),
        req.is_published.unwrap_or(false),
        req.is_featured.unwrap_or(false),
        req.read_time_minutes, published_at, id
    )
    .fetch_optional(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?
    .ok_or_else(|| crate::errors::AppError::NotFound("Post not found".into()))?;
    Ok(Json(serde_json::json!({ "success": true, "data": row })))
}

pub async fn delete(State(state): State<AppState>, Path(id): Path<Uuid>) -> AppResult<Json<serde_json::Value>> {
    sqlx::query!("DELETE FROM blog_posts WHERE id=$1", id)
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
