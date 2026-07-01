use crate::{errors::AppResult, AppState};
use axum::{extract::{Path, Query, State}, Json};
use serde::Deserialize;
use uuid::Uuid;
use chrono::NaiveDate;
use crate::utils::make_slug;

#[derive(Deserialize)]
pub struct CreateProject {
    pub title: String,
    pub short_description: Option<String>,
    pub description: Option<String>,
    pub tech_stack: Option<Vec<String>>,
    pub github_url: Option<String>,
    pub live_demo_url: Option<String>,
    pub status: Option<String>,
    pub category: Option<String>,
    pub is_featured: Option<bool>,
    pub is_open_source: Option<bool>,
    pub start_date: Option<NaiveDate>,
    pub end_date: Option<NaiveDate>,
    pub sort_order: Option<i32>,
    pub tags: Option<Vec<String>>,
}

#[derive(Deserialize)]
pub struct ListParams { pub page: Option<i64>, pub per_page: Option<i64> }

pub async fn list(
    State(state): State<AppState>,
    Query(q): Query<ListParams>,
) -> AppResult<Json<serde_json::Value>> {
    let page = q.page.unwrap_or(1).max(1);
    let per_page = q.per_page.unwrap_or(20).min(100);
    let offset = (page - 1) * per_page;
    let rows = sqlx::query_as!(
        crate::models::Project,
        "SELECT * FROM projects ORDER BY sort_order, created_at DESC LIMIT $1 OFFSET $2",
        per_page, offset
    )
    .fetch_all(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;
    let total: i64 = sqlx::query_scalar!("SELECT COUNT(*) FROM projects")
        .fetch_one(&state.db.pool).await
        .map_err(crate::errors::AppError::DatabaseError)?
        .unwrap_or(0);
    Ok(Json(serde_json::json!({
        "success": true, "data": rows,
        "pagination": { "total": total, "page": page, "per_page": per_page,
                        "total_pages": (total as f64 / per_page as f64).ceil() as i64 }
    })))
}

pub async fn get_one(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<serde_json::Value>> {
    let project = sqlx::query_as!(crate::models::Project, "SELECT * FROM projects WHERE id=$1", id)
        .fetch_optional(&state.db.pool).await
        .map_err(crate::errors::AppError::DatabaseError)?
        .ok_or_else(|| crate::errors::AppError::NotFound("Project not found".into()))?;
    let images = sqlx::query_as!(crate::models::ProjectImage,
        "SELECT * FROM project_images WHERE project_id=$1 ORDER BY sort_order", id)
        .fetch_all(&state.db.pool).await
        .map_err(crate::errors::AppError::DatabaseError)?;
    let tags: Vec<String> = sqlx::query_scalar!("SELECT tag FROM project_tags WHERE project_id=$1", id)
        .fetch_all(&state.db.pool).await
        .map_err(crate::errors::AppError::DatabaseError)?;
    Ok(Json(serde_json::json!({ "success": true, "data": { "project": project, "images": images, "tags": tags } })))
}

pub async fn create(
    State(state): State<AppState>,
    Json(req): Json<CreateProject>,
) -> AppResult<Json<serde_json::Value>> {
    if req.title.trim().is_empty() {
        return Err(crate::errors::AppError::BadRequest("Title is required".into()));
    }
    let slug = make_slug(&req.title);
    let row = sqlx::query_as!(
        crate::models::Project,
        r#"INSERT INTO projects
           (title, slug, short_description, description, tech_stack, github_url,
            live_demo_url, status, category, is_featured, is_open_source,
            start_date, end_date, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
           RETURNING *"#,
        req.title.trim(), slug, req.short_description, req.description,
        req.tech_stack.as_deref(),
        req.github_url, req.live_demo_url,
        req.status.as_deref().unwrap_or("planning"),
        req.category,
        req.is_featured.unwrap_or(false), req.is_open_source.unwrap_or(true),
        req.start_date, req.end_date, req.sort_order.unwrap_or(0)
    )
    .fetch_one(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;

    // Insert tags
    if let Some(tags) = &req.tags {
        for tag in tags {
            if !tag.trim().is_empty() {
                let _ = sqlx::query!(
                    "INSERT INTO project_tags (project_id, tag) VALUES ($1,$2) ON CONFLICT DO NOTHING",
                    row.id, tag.trim()
                ).execute(&state.db.pool).await;
            }
        }
    }
    Ok(Json(serde_json::json!({ "success": true, "data": row })))
}

pub async fn update(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(req): Json<CreateProject>,
) -> AppResult<Json<serde_json::Value>> {
    let row = sqlx::query_as!(
        crate::models::Project,
        r#"UPDATE projects SET
           title=$1, short_description=$2, description=$3, tech_stack=$4,
           github_url=$5, live_demo_url=$6, status=$7, category=$8,
           is_featured=$9, is_open_source=$10, start_date=$11, end_date=$12, sort_order=$13
           WHERE id=$14 RETURNING *"#,
        req.title.trim(), req.short_description, req.description,
        req.tech_stack.as_deref(),
        req.github_url, req.live_demo_url,
        req.status.as_deref().unwrap_or("planning"), req.category,
        req.is_featured.unwrap_or(false), req.is_open_source.unwrap_or(true),
        req.start_date, req.end_date, req.sort_order.unwrap_or(0), id
    )
    .fetch_optional(&state.db.pool).await
    .map_err(crate::errors::AppError::DatabaseError)?
    .ok_or_else(|| crate::errors::AppError::NotFound("Project not found".into()))?;

    // Replace tags
    if let Some(tags) = &req.tags {
        sqlx::query!("DELETE FROM project_tags WHERE project_id=$1", id)
            .execute(&state.db.pool).await.ok();
        for tag in tags {
            if !tag.trim().is_empty() {
                let _ = sqlx::query!(
                    "INSERT INTO project_tags (project_id, tag) VALUES ($1,$2) ON CONFLICT DO NOTHING",
                    id, tag.trim()
                ).execute(&state.db.pool).await;
            }
        }
    }
    Ok(Json(serde_json::json!({ "success": true, "data": row })))
}

pub async fn delete(State(state): State<AppState>, Path(id): Path<Uuid>) -> AppResult<Json<serde_json::Value>> {
    sqlx::query!("DELETE FROM projects WHERE id=$1", id)
        .execute(&state.db.pool).await
        .map_err(crate::errors::AppError::DatabaseError)?;
    Ok(Json(serde_json::json!({ "success": true })))
}

pub async fn upload_image(State(_s): State<AppState>, Path(_id): Path<Uuid>) -> AppResult<Json<serde_json::Value>> {
    Ok(Json(serde_json::json!({"success":true,"message":"Connect to file storage (S3/local) to handle image uploads"})))
}

pub async fn delete_image(State(state): State<AppState>, Path((_project_id, img_id)): Path<(Uuid, Uuid)>) -> AppResult<Json<serde_json::Value>> {
    sqlx::query!("DELETE FROM project_images WHERE id=$1", img_id)
        .execute(&state.db.pool).await
        .map_err(crate::errors::AppError::DatabaseError)?;
    Ok(Json(serde_json::json!({ "success": true })))
}

// Unused stubs
pub async fn add_milestone(State(_s): State<AppState>, Path(_id): Path<Uuid>, Json(_r): Json<serde_json::Value>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn update_milestone(State(_s): State<AppState>, Path((_id,_mid)): Path<(Uuid,Uuid)>, Json(_r): Json<serde_json::Value>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn delete_milestone(State(_s): State<AppState>, Path((_id,_mid)): Path<(Uuid,Uuid)>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn log_streak(State(_s): State<AppState>, Path(_id): Path<Uuid>, Json(_r): Json<serde_json::Value>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn upload_resume(State(_s): State<AppState>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn list_versions(State(_s): State<AppState>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true,"data":[]}))) }
pub async fn activate_version(State(_s): State<AppState>, Path(_id): Path<Uuid>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
pub async fn get_settings(State(_s): State<AppState>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true,"data":{}}))) }
pub async fn update_settings(State(_s): State<AppState>, Json(_r): Json<serde_json::Value>) -> AppResult<Json<serde_json::Value>> { Ok(Json(serde_json::json!({"success":true}))) }
