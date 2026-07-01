// contact.rs
use crate::{errors::AppResult, models::CreateContactMessage, AppState};
use axum::{extract::State, Json};

pub async fn submit_contact(
    State(state): State<AppState>,
    Json(req): Json<CreateContactMessage>,
) -> AppResult<Json<serde_json::Value>> {
    if req.sender_name.trim().is_empty() {
        return Err(crate::errors::AppError::BadRequest("Name is required".to_string()));
    }
    if !req.sender_email.contains('@') {
        return Err(crate::errors::AppError::BadRequest("Valid email is required".to_string()));
    }
    if req.message.trim().len() < 10 {
        return Err(crate::errors::AppError::BadRequest(
            "Message must be at least 10 characters".to_string(),
        ));
    }

    sqlx::query!(
        r#"INSERT INTO contact_messages (sender_name, sender_email, subject, message)
           VALUES ($1, $2, $3, $4)"#,
        req.sender_name.trim(),
        req.sender_email.trim().to_lowercase(),
        req.subject,
        req.message.trim()
    )
    .execute(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;

    Ok(Json(serde_json::json!({
        "success": true,
        "message": "Message sent successfully! I'll get back to you soon."
    })))
}
