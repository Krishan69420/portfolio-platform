use crate::{errors::AppResult, AppState};
use axum::{extract::State, Json};

pub async fn get_overview(State(state): State<AppState>) -> AppResult<Json<serde_json::Value>> {
    let total_views: i64 = sqlx::query_scalar!("SELECT COUNT(*) FROM page_views")
        .fetch_one(&state.db.pool)
        .await
        .map_err(crate::errors::AppError::DatabaseError)?
        .unwrap_or(0);

    let views_today: i64 = sqlx::query_scalar!(
        "SELECT COUNT(*) FROM page_views WHERE created_at >= CURRENT_DATE"
    )
    .fetch_one(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?
    .unwrap_or(0);

    let views_this_week: i64 = sqlx::query_scalar!(
        "SELECT COUNT(*) FROM page_views WHERE created_at >= NOW() - INTERVAL '7 days'"
    )
    .fetch_one(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?
    .unwrap_or(0);

    let views_this_month: i64 = sqlx::query_scalar!(
        "SELECT COUNT(*) FROM page_views WHERE created_at >= DATE_TRUNC('month', NOW())"
    )
    .fetch_one(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?
    .unwrap_or(0);

    let total_projects: i64 = sqlx::query_scalar!("SELECT COUNT(*) FROM projects")
        .fetch_one(&state.db.pool)
        .await
        .map_err(crate::errors::AppError::DatabaseError)?
        .unwrap_or(0);

    let total_skills: i64 = sqlx::query_scalar!("SELECT COUNT(*) FROM skills")
        .fetch_one(&state.db.pool)
        .await
        .map_err(crate::errors::AppError::DatabaseError)?
        .unwrap_or(0);

    let total_messages: i64 = sqlx::query_scalar!("SELECT COUNT(*) FROM contact_messages WHERE is_spam = false")
        .fetch_one(&state.db.pool)
        .await
        .map_err(crate::errors::AppError::DatabaseError)?
        .unwrap_or(0);

    let unread_messages: i64 = sqlx::query_scalar!(
        "SELECT COUNT(*) FROM contact_messages WHERE is_read = false AND is_spam = false"
    )
    .fetch_one(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?
    .unwrap_or(0);

    let resume_downloads: i64 = sqlx::query_scalar!("SELECT COUNT(*) FROM resume_downloads")
        .fetch_one(&state.db.pool)
        .await
        .map_err(crate::errors::AppError::DatabaseError)?
        .unwrap_or(0);

    let top_projects = sqlx::query!(
        "SELECT id, title, view_count FROM projects ORDER BY view_count DESC LIMIT 5"
    )
    .fetch_all(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;

    Ok(Json(serde_json::json!({
        "success": true,
        "data": {
            "total_views": total_views,
            "views_today": views_today,
            "views_this_week": views_this_week,
            "views_this_month": views_this_month,
            "total_projects": total_projects,
            "total_skills": total_skills,
            "total_messages": total_messages,
            "unread_messages": unread_messages,
            "resume_downloads": resume_downloads,
            "top_projects": top_projects.iter().map(|p| serde_json::json!({
                "id": p.id,
                "title": p.title,
                "view_count": p.view_count
            })).collect::<Vec<_>>()
        }
    })))
}

pub async fn get_views_chart(State(state): State<AppState>) -> AppResult<Json<serde_json::Value>> {
    let data = sqlx::query!(
        r#"SELECT DATE(created_at) as date, COUNT(*) as views
           FROM page_views
           WHERE created_at >= NOW() - INTERVAL '30 days'
           GROUP BY DATE(created_at)
           ORDER BY date ASC"#
    )
    .fetch_all(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;

    let chart = data.iter().map(|r| serde_json::json!({
        "date": r.date,
        "views": r.views.unwrap_or(0)
    })).collect::<Vec<_>>();

    Ok(Json(serde_json::json!({ "success": true, "data": chart })))
}

pub async fn get_project_stats(State(state): State<AppState>) -> AppResult<Json<serde_json::Value>> {
    let stats = sqlx::query!(
        "SELECT title, view_count FROM projects ORDER BY view_count DESC LIMIT 10"
    )
    .fetch_all(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;

    let chart = stats.iter().map(|r| serde_json::json!({
        "title": r.title,
        "views": r.view_count
    })).collect::<Vec<_>>();

    Ok(Json(serde_json::json!({ "success": true, "data": chart })))
}
