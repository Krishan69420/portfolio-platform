use crate::{errors::AppResult, AppState};
use axum::{extract::State, Json};
use uuid::Uuid;

pub async fn get_personal_info(
    State(state): State<AppState>,
) -> AppResult<Json<serde_json::Value>> {
    let row = sqlx::query_as!(
        crate::models::PersonalInfo,
        "SELECT * FROM personal_info ORDER BY created_at LIMIT 1"
    )
    .fetch_optional(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;

    Ok(Json(serde_json::json!({ "success": true, "data": row })))
}

pub async fn get_skills(State(state): State<AppState>) -> AppResult<Json<serde_json::Value>> {
    let skills = sqlx::query_as!(
        crate::models::Skill,
        "SELECT * FROM skills ORDER BY sort_order, name"
    )
    .fetch_all(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;

    Ok(Json(serde_json::json!({ "success": true, "data": skills })))
}

pub async fn get_tech_stack(State(state): State<AppState>) -> AppResult<Json<serde_json::Value>> {
    let stack = sqlx::query_as!(
        crate::models::TechStack,
        "SELECT * FROM tech_stack WHERE is_visible = true ORDER BY sort_order, name"
    )
    .fetch_all(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;

    Ok(Json(serde_json::json!({ "success": true, "data": stack })))
}

pub async fn get_experience(State(state): State<AppState>) -> AppResult<Json<serde_json::Value>> {
    let experience = sqlx::query_as!(
        crate::models::Experience,
        "SELECT * FROM experience ORDER BY is_current DESC, start_date DESC"
    )
    .fetch_all(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;

    Ok(Json(serde_json::json!({ "success": true, "data": experience })))
}

pub async fn get_education(State(state): State<AppState>) -> AppResult<Json<serde_json::Value>> {
    let education = sqlx::query_as!(
        crate::models::Education,
        "SELECT * FROM education ORDER BY is_current DESC, start_date DESC"
    )
    .fetch_all(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;

    Ok(Json(serde_json::json!({ "success": true, "data": education })))
}

pub async fn get_certifications(
    State(state): State<AppState>,
) -> AppResult<Json<serde_json::Value>> {
    let certs = sqlx::query_as!(
        crate::models::Certification,
        "SELECT * FROM certifications ORDER BY sort_order, issue_date DESC"
    )
    .fetch_all(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;

    Ok(Json(serde_json::json!({ "success": true, "data": certs })))
}

pub async fn get_achievements(
    State(state): State<AppState>,
) -> AppResult<Json<serde_json::Value>> {
    let achievements = sqlx::query_as!(
        crate::models::Achievement,
        "SELECT * FROM achievements ORDER BY sort_order, date DESC NULLS LAST"
    )
    .fetch_all(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;

    Ok(Json(serde_json::json!({ "success": true, "data": achievements })))
}

pub async fn get_social_links(
    State(state): State<AppState>,
) -> AppResult<Json<serde_json::Value>> {
    let links = sqlx::query_as!(
        crate::models::SocialLink,
        "SELECT * FROM social_links WHERE is_visible = true ORDER BY sort_order"
    )
    .fetch_all(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;

    Ok(Json(serde_json::json!({ "success": true, "data": links })))
}

pub async fn get_learning_topics(
    State(state): State<AppState>,
) -> AppResult<Json<serde_json::Value>> {
    let topics = sqlx::query_as!(
        crate::models::LearningTopic,
        "SELECT * FROM learning_topics ORDER BY sort_order, name"
    )
    .fetch_all(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;

    Ok(Json(serde_json::json!({ "success": true, "data": topics })))
}

pub async fn get_learning_topic(
    State(state): State<AppState>,
    axum::extract::Path(id): axum::extract::Path<Uuid>,
) -> AppResult<Json<serde_json::Value>> {
    let topic = sqlx::query_as!(
        crate::models::LearningTopic,
        "SELECT * FROM learning_topics WHERE id = $1",
        id
    )
    .fetch_optional(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?
    .ok_or_else(|| crate::errors::AppError::NotFound("Learning topic not found".to_string()))?;

    let milestones = sqlx::query_as!(
        crate::models::LearningMilestone,
        "SELECT * FROM learning_milestones WHERE topic_id = $1 ORDER BY sort_order",
        id
    )
    .fetch_all(&state.db.pool)
    .await
    .map_err(crate::errors::AppError::DatabaseError)?;

    Ok(Json(serde_json::json!({
        "success": true,
        "data": { "topic": topic, "milestones": milestones }
    })))
}
