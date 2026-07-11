use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    errors::{AppError, AppResult},
    models::{Experience, ExperienceRequest},
    repositories::experience,
};

pub async fn get_all_experience(
    pool: &PgPool,
) -> AppResult<Vec<Experience>> {

    let experiences = experience::get_all_experience(pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

    Ok(experiences)
}

pub async fn get_experience_by_id(
    pool: &PgPool,
    id: Uuid,
) -> AppResult<Experience> {

    let exp = experience::get_experience_by_id(pool, id)
        .await
        .map_err(|_| AppError::NotFound("Experience not found".to_string()))?;

    Ok(exp)
}

pub async fn create_experience(
    pool: &PgPool,
    request: ExperienceRequest,
) -> AppResult<Experience> {

    let exp = experience::create_experience(pool, &request)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

    Ok(exp)
}

pub async fn update_experience(
    pool: &PgPool,
    id: Uuid,
    request: ExperienceRequest,
) -> AppResult<Experience> {

    let exp = experience::update_experience(
        pool,
        id,
        &request,
    )
    .await
    .map_err(|_| AppError::NotFound("Experience not found".to_string()))?;

    Ok(exp)
}

pub async fn delete_experience(
    pool: &PgPool,
    id: Uuid,
) -> AppResult<()> {

    experience::delete_experience(pool, id)
        .await
        .map_err(|_| AppError::NotFound("Experience not found".to_string()))?;

    Ok(())
}