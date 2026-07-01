use crate::{errors::AppResult, AppState};
use axum::{extract::{Path, Query, State}, Json};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct BlogQuery {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
}

pub async fn list_posts(
    State(state): State<AppState>,
    Query(q): Query<BlogQuery>,
) -> AppResult<Json<serde_json::Value>> {
    let page = q.page.unwrap_or(1).max(1);
    let per_page = q.per_page.unwrap_or(10).min(50).max(1);
    let offset = (page - 1) * per_page;

    let posts = sqlx::query_as!(
        crate::models::BlogPost,
        r#"SELECT * FROM blog_posts WHERE is_published = true
           ORDER BY published_at DESC LIMIT $1 OFFSET $2"#,
        per_page, offset
    )
    .fetch_all(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;

    Ok(Json(serde_json::json!({ "success": true, "data": posts })))
}

pub async fn get_featured_posts(
    State(state): State<AppState>,
) -> AppResult<Json<serde_json::Value>> {
    let posts = sqlx::query_as!(
        crate::models::BlogPost,
        "SELECT * FROM blog_posts WHERE is_published = true AND is_featured = true ORDER BY published_at DESC LIMIT 3"
    )
    .fetch_all(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;

    Ok(Json(serde_json::json!({ "success": true, "data": posts })))
}

pub async fn get_post(
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> AppResult<Json<serde_json::Value>> {
    let post = sqlx::query_as!(
        crate::models::BlogPost,
        "SELECT * FROM blog_posts WHERE slug = $1 AND is_published = true",
        slug
    )
    .fetch_optional(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?
    .ok_or_else(|| crate::errors::AppError::NotFound("Post not found".to_string()))?;

    Ok(Json(serde_json::json!({ "success": true, "data": post })))
}
