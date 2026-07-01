use crate::{errors::AppResult, AppState};
use axum::{extract::State, Json};

pub async fn download_resume(
    State(state): State<AppState>,
) -> AppResult<Json<serde_json::Value>> {
    let version = sqlx::query_as!(
        crate::models::ResumeVersion,
        "SELECT * FROM resume_versions WHERE is_current = true LIMIT 1"
    )
    .fetch_optional(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;

    if let Some(v) = &version {
        let vid = v.id;
        let pool = state.db.pool.clone();
        tokio::spawn(async move {
            let _ = sqlx::query!(
                "INSERT INTO resume_downloads (resume_version_id) VALUES ($1)",
                vid
            )
            .execute(&pool)
            .await;
            let _ = sqlx::query!(
                "UPDATE resume_versions SET download_count = download_count + 1 WHERE id = $1",
                vid
            )
            .execute(&pool)
            .await;
        });
    }

    Ok(Json(serde_json::json!({
        "success": true,
        "data": version
    })))
}
