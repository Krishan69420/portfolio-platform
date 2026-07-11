use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    errors::{AppError, AppResult},
    models::{Certification, CertificationRequest},
    repositories::certification,
};

pub async fn get_all_certifications(
    pool: &PgPool,
) -> AppResult<Vec<Certification>> {

    let certifications =
        certification::get_all_certifications(pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

    Ok(certifications)
}

pub async fn get_certification_by_id(
    pool: &PgPool,
    id: Uuid,
) -> AppResult<Certification> {

    let certification =
        certification::get_certification_by_id(pool, id)
            .await
            .map_err(|_| AppError::NotFound("Certification not found".to_string()))?;

    Ok(certification)
}

pub async fn create_certification(
    pool: &PgPool,
    request: CertificationRequest,
) -> AppResult<Certification> {

    let certification =
        certification::create_certification(pool, &request)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

    Ok(certification)
}

pub async fn update_certification(
    pool: &PgPool,
    id: Uuid,
    request: CertificationRequest,
) -> AppResult<Certification> {

    let certification =
        certification::update_certification(pool, id, &request)
            .await
            .map_err(|_| AppError::NotFound("Certification not found".to_string()))?;

    Ok(certification)
}

pub async fn delete_certification(
    pool: &PgPool,
    id: Uuid,
) -> AppResult<()> {

    certification::delete_certification(pool, id)
        .await
        .map_err(|_| AppError::NotFound("Certification not found".to_string()))?;

    Ok(())
}

pub async fn delete_all_certifications(
    pool: &PgPool,
) -> AppResult<()> {

    certification::delete_all_certifications(pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

    Ok(())
}