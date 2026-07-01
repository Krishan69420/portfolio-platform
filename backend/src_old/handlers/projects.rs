use crate::{errors::AppResult, AppState};
use axum::{
    extract::{Path, Query, State},
    Json,
};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct ProjectQuery {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub search: Option<String>,
    pub category: Option<String>,
    pub status: Option<String>,
    pub featured: Option<bool>,
}

pub async fn list_projects(
    State(state): State<AppState>,
    Query(q): Query<ProjectQuery>,
) -> AppResult<Json<serde_json::Value>> {
    let page = q.page.unwrap_or(1).max(1);
    let per_page = q.per_page.unwrap_or(12).min(50).max(1);
    let offset = (page - 1) * per_page;

    let projects = sqlx::query_as!(
        crate::models::Project,
        r#"SELECT * FROM projects
           WHERE ($1::TEXT IS NULL OR title ILIKE $1 OR description ILIKE $1)
           AND ($2::TEXT IS NULL OR category = $2)
           AND ($3::TEXT IS NULL OR status = $3)
           AND ($4::BOOLEAN IS NULL OR is_featured = $4)
           ORDER BY sort_order, is_featured DESC, created_at DESC
           LIMIT $5 OFFSET $6"#,
        q.search.as_ref().map(|s| format!("%{}%", s)),
        q.category,
        q.status,
        q.featured,
        per_page,
        offset
    )
    .fetch_all(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;

    let total: i64 = sqlx::query_scalar!(
        r#"SELECT COUNT(*) FROM projects
           WHERE ($1::TEXT IS NULL OR title ILIKE $1 OR description ILIKE $1)
           AND ($2::TEXT IS NULL OR category = $2)
           AND ($3::TEXT IS NULL OR status = $3)
           AND ($4::BOOLEAN IS NULL OR is_featured = $4)"#,
        q.search.as_ref().map(|s| format!("%{}%", s)),
        q.category,
        q.status,
        q.featured,
    )
    .fetch_one(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?
    .unwrap_or(0);

    Ok(Json(serde_json::json!({
        "success": true,
        "data": projects,
        "pagination": {
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": (total as f64 / per_page as f64).ceil() as i64
        }
    })))
}

pub async fn get_featured_projects(
    State(state): State<AppState>,
) -> AppResult<Json<serde_json::Value>> {
    let projects = sqlx::query_as!(
        crate::models::Project,
        "SELECT * FROM projects WHERE is_featured = true ORDER BY sort_order, created_at DESC LIMIT 6"
    )
    .fetch_all(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;

    Ok(Json(serde_json::json!({ "success": true, "data": projects })))
}

pub async fn get_project_by_slug(
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> AppResult<Json<serde_json::Value>> {
    let project = sqlx::query_as!(
        crate::models::Project,
        "SELECT * FROM projects WHERE slug = $1",
        slug
    )
    .fetch_optional(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?
    .ok_or_else(|| crate::errors::AppError::NotFound("Project not found".to_string()))?;

    // Increment view count asynchronously
    let pool = state.db.pool.clone();
    let pid = project.id;
    tokio::spawn(async move {
        let _ = sqlx::query!(
            "UPDATE projects SET view_count = view_count + 1 WHERE id = $1",
            pid
        )
        .execute(&pool)
        .await;
    });

    let images = sqlx::query_as!(
        crate::models::ProjectImage,
        "SELECT * FROM project_images WHERE project_id = $1 ORDER BY sort_order",
        project.id
    )
    .fetch_all(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;

    let tags: Vec<String> = sqlx::query_scalar!(
        "SELECT tag FROM project_tags WHERE project_id = $1",
        project.id
    )
    .fetch_all(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;

    Ok(Json(serde_json::json!({
        "success": true,
        "data": {
            "project": project,
            "images": images,
            "tags": tags
        }
    })))
}
