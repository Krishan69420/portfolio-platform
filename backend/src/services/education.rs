use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    errors::{AppError, AppResult},
    models::{Education, EducationRequest},
    repositories::education,
};

pub async fn get_all_education(
    pool: &PgPool,
) -> AppResult<Vec<Education>> {

    let education_list = education::get_all_education(pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

    Ok(education_list)
}

pub async fn get_education_by_id(
    pool: &PgPool,
    id: Uuid,
) -> AppResult<Education> {

    let education = education::get_education_by_id(pool, id)
        .await
        .map_err(|_| AppError::NotFound("Education not found".to_string()))?;

    Ok(education)
}

pub async fn create_education(
    pool: &PgPool,
    request: EducationRequest,
) -> AppResult<Education> {

    let education = education::create_education(pool, &request)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

    Ok(education)
}

pub async fn update_education(
    pool: &PgPool,
    id: Uuid,
    request: EducationRequest,
) -> AppResult<Education> {

    let education = education::update_education(
        pool,
        id,
        &request,
    )
    .await
    .map_err(|_| AppError::NotFound("Education not found".to_string()))?;

    Ok(education)
}

pub async fn delete_education(
    pool: &PgPool,
    id: Uuid,
) -> AppResult<()> {

    education::delete_education(pool, id)
        .await
        .map_err(|_| AppError::NotFound("Education not found".to_string()))?;

    Ok(())
}
pub async fn delete_all_education(
    pool: &PgPool,
) -> AppResult<()> {

    education::delete_all_education(pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

    Ok(())
}