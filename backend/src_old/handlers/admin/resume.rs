use crate::{errors::AppResult, AppState};
use axum::{extract::{Path, State}, Json};
use uuid::Uuid;

pub async fn upload_resume(
    State(_state): State<AppState>,
) -> AppResult<Json<serde_json::Value>> {
    // Production: integrate with multer for multipart, save to local /app/uploads or S3
    // Return the file URL to store in resume_versions table
    Ok(Json(serde_json::json!({
        "success": false,
        "message": "File upload requires multipart integration. Connect to S3 or local storage.",
        "hint": "POST with Content-Type: multipart/form-data, field name: 'file'"
    })))
}

pub async fn list_versions(State(state): State<AppState>) -> AppResult<Json<serde_json::Value>> {
    let versions = sqlx::query_as!(
        crate::models::ResumeVersion,
        "SELECT * FROM resume_versions ORDER BY version_number DESC"
    )
    .fetch_all(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;
    Ok(Json(serde_json::json!({ "success": true, "data": versions })))
}

pub async fn activate_version(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<serde_json::Value>> {
    // Verify version exists
    let version = sqlx::query!(
        "SELECT id, file_url, version_number FROM resume_versions WHERE id=$1", id
    )
    .fetch_optional(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?
    .ok_or_else(|| crate::errors::AppError::NotFound("Resume version not found".into()))?;

    // Deactivate all, then activate this one
    let mut tx = state.db.pool.begin().await.map_err(crate::errors::AppError::DatabaseError)?;
    sqlx::query!("UPDATE resume_versions SET is_current = false")
        .execute(&mut *tx).await.map_err(crate::errors::AppError::DatabaseError)?;
    sqlx::query!("UPDATE resume_versions SET is_current = true WHERE id=$1", id)
        .execute(&mut *tx).await.map_err(crate::errors::AppError::DatabaseError)?;
    // Update personal_info resume_url to point to active version
    sqlx::query!(
        "UPDATE personal_info SET resume_url=$1, resume_version=$2",
        version.file_url, version.version_number
    )
    .execute(&mut *tx).await.map_err(crate::errors::AppError::DatabaseError)?;
    tx.commit().await.map_err(crate::errors::AppError::DatabaseError)?;

    Ok(Json(serde_json::json!({
        "success": true,
        "message": "Resume version activated"
    })))
}
