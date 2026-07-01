use crate::{errors::AppResult, models::CreateSkill, AppState};
use axum::{extract::{Path, State}, Json};
use uuid::Uuid;

pub async fn list_skills(State(state): State<AppState>) -> AppResult<Json<serde_json::Value>> {
    let skills = sqlx::query_as!(
        crate::models::Skill,
        "SELECT * FROM skills ORDER BY sort_order, category, name"
    )
    .fetch_all(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;
    Ok(Json(serde_json::json!({ "success": true, "data": skills })))
}

pub async fn create_skill(
    State(state): State<AppState>,
    Json(req): Json<CreateSkill>,
) -> AppResult<Json<serde_json::Value>> {
    if req.name.trim().is_empty() {
        return Err(crate::errors::AppError::BadRequest("Skill name is required".to_string()));
    }

    let skill = sqlx::query_as!(
        crate::models::Skill,
        r#"INSERT INTO skills (name, category, experience_level, years_of_experience, icon, icon_color,
           is_featured, is_currently_learning, proficiency_score, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING *"#,
        req.name.trim(),
        req.category.trim(),
        req.experience_level,
        req.years_of_experience,
        req.icon,
        req.icon_color,
        req.is_featured.unwrap_or(false),
        req.is_currently_learning.unwrap_or(false),
        req.proficiency_score,
        req.sort_order.unwrap_or(0)
    )
    .fetch_one(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;

    Ok(Json(serde_json::json!({ "success": true, "data": skill })))
}

pub async fn update_skill(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(req): Json<CreateSkill>,
) -> AppResult<Json<serde_json::Value>> {
    let skill = sqlx::query_as!(
        crate::models::Skill,
        r#"UPDATE skills SET
           name = $1, category = $2, experience_level = $3, years_of_experience = $4,
           icon = $5, icon_color = $6, is_featured = $7, is_currently_learning = $8,
           proficiency_score = $9, sort_order = $10
           WHERE id = $11 RETURNING *"#,
        req.name.trim(),
        req.category.trim(),
        req.experience_level,
        req.years_of_experience,
        req.icon,
        req.icon_color,
        req.is_featured.unwrap_or(false),
        req.is_currently_learning.unwrap_or(false),
        req.proficiency_score,
        req.sort_order.unwrap_or(0),
        id
    )
    .fetch_optional(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?
    .ok_or_else(|| crate::errors::AppError::NotFound("Skill not found".to_string()))?;

    Ok(Json(serde_json::json!({ "success": true, "data": skill })))
}

pub async fn delete_skill(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<serde_json::Value>> {
    sqlx::query!("DELETE FROM skills WHERE id = $1", id)
        .execute(&state.db.pool)
        .await
        .map_err(crate::errors::AppError::DatabaseError)?;

    Ok(Json(serde_json::json!({ "success": true, "message": "Skill deleted" })))
}
