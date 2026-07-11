use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use uuid::Uuid;

use crate::{
    errors::AppResult,
    models::{Certification, CertificationRequest},
    services,
    state::AppState,
};

pub async fn get_all_certifications(
    State(state): State<AppState>,
) -> AppResult<Json<Vec<Certification>>> {

    let certifications =
        services::certification::get_all_certifications(&state.db)
            .await?;

    Ok(Json(certifications))
}

pub async fn get_certification_by_id(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Certification>> {

    let certification =
        services::certification::get_certification_by_id(&state.db, id)
            .await?;

    Ok(Json(certification))
}

pub async fn create_certification(
    State(state): State<AppState>,
    Json(request): Json<CertificationRequest>,
) -> AppResult<Json<Certification>> {

    let certification =
        services::certification::create_certification(&state.db, request)
            .await?;

    Ok(Json(certification))
}

pub async fn update_certification(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(request): Json<CertificationRequest>,
) -> AppResult<Json<Certification>> {

    let certification =
        services::certification::update_certification(
            &state.db,
            id,
            request,
        )
        .await?;

    Ok(Json(certification))
}

pub async fn delete_certification(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> AppResult<StatusCode> {

    services::certification::delete_certification(&state.db, id)
        .await?;

    Ok(StatusCode::NO_CONTENT)
}

pub async fn delete_all_certifications(
    State(state): State<AppState>,
) -> AppResult<StatusCode> {

    services::certification::delete_all_certifications(&state.db)
        .await?;

    Ok(StatusCode::NO_CONTENT)
}