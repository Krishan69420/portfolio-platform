// analytics.rs
use crate::{errors::AppResult, models::TrackPageView, AppState};
use axum::{extract::State, Json};

pub async fn track_page_view(
    State(state): State<AppState>,
    Json(req): Json<TrackPageView>,
) -> AppResult<Json<serde_json::Value>> {
    sqlx::query!(
        "INSERT INTO page_views (page_path, referrer, session_id) VALUES ($1, $2, $3)",
        req.page_path,
        req.referrer,
        req.session_id
    )
    .execute(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;

    Ok(Json(serde_json::json!({ "success": true })))
}
