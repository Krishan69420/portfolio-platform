// personal.rs - Admin personal info management
use crate::{errors::AppResult, models::UpdatePersonalInfo, AppState};
use axum::{extract::State, Json};

pub async fn update_personal_info(
    State(state): State<AppState>,
    Json(req): Json<UpdatePersonalInfo>,
) -> AppResult<Json<serde_json::Value>> {
    let existing = sqlx::query!("SELECT id FROM personal_info ORDER BY created_at LIMIT 1")
        .fetch_optional(&state.db.pool)
        .await
        .map_err(crate::errors::AppError::DatabaseError)?;

    if let Some(row) = existing {
        sqlx::query!(
            r#"UPDATE personal_info SET
               full_name = COALESCE($1, full_name),
               title = COALESCE($2, title),
               tagline = COALESCE($3, tagline),
               bio = COALESCE($4, bio),
               short_bio = COALESCE($5, short_bio),
               email = COALESCE($6, email),
               phone = COALESCE($7, phone),
               location = COALESCE($8, location),
               availability_status = COALESCE($9, availability_status),
               website_url = COALESCE($10, website_url)
               WHERE id = $11"#,
            req.full_name, req.title, req.tagline, req.bio, req.short_bio,
            req.email, req.phone, req.location, req.availability_status, req.website_url,
            row.id
        )
        .execute(&state.db.pool)
        .await
        .map_err(crate::errors::AppError::DatabaseError)?;
    } else {
        let full_name = req.full_name.unwrap_or_else(|| "Portfolio Owner".to_string());
        let title = req.title.unwrap_or_else(|| "Software Engineer".to_string());
        sqlx::query!(
            "INSERT INTO personal_info (full_name, title, tagline, bio, short_bio, email, phone, location, availability_status, website_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
            full_name, title, req.tagline, req.bio, req.short_bio,
            req.email, req.phone, req.location, req.availability_status, req.website_url
        )
        .execute(&state.db.pool)
        .await
        .map_err(crate::errors::AppError::DatabaseError)?;
    }

    Ok(Json(serde_json::json!({ "success": true, "message": "Personal info updated" })))
}

pub async fn upload_avatar(
    State(_state): State<AppState>,
) -> AppResult<Json<serde_json::Value>> {
    // File upload handled by dedicated upload service or S3
    Ok(Json(serde_json::json!({ "success": true, "message": "Avatar upload endpoint - connect to file storage" })))
}
