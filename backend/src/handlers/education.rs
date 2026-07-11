use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use uuid::Uuid;

use crate::{
    errors::AppResult,
    models::{Education, EducationRequest},
    services,
    state::AppState,
};

pub async fn get_all_education(
    State(state): State<AppState>,
) -> AppResult<Json<Vec<Education>>> {

    let education =
        services::education::get_all_education(&state.db).await?;

    Ok(Json(education))
}

pub async fn get_education_by_id(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Education>> {

    let education =
        services::education::get_education_by_id(&state.db, id).await?;

    Ok(Json(education))
}

pub async fn create_education(
    State(state): State<AppState>,
    Json(request): Json<EducationRequest>,
) -> AppResult<Json<Education>> {

    let education =
        services::education::create_education(&state.db, request).await?;

    Ok(Json(education))
}

pub async fn update_education(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(request): Json<EducationRequest>,
) -> AppResult<Json<Education>> {

    let education =
        services::education::update_education(
            &state.db,
            id,
            request,
        )
        .await?;

    Ok(Json(education))
}

pub async fn delete_education(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> AppResult<StatusCode> {

    services::education::delete_education(&state.db, id).await?;

    Ok(StatusCode::NO_CONTENT)
}
pub async fn delete_all_education(
    State(state): State<AppState>,
) -> AppResult<StatusCode> {
    services::education::delete_all_education(&state.db).await?;
    Ok(StatusCode::NO_CONTENT)
}