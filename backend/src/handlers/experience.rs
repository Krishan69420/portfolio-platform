use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};

use uuid::Uuid;

use crate::{
    errors::AppResult,
    models::{Experience, ExperienceRequest},
    services,
    state::AppState,
};

pub async fn get_all_experience(
    State(state): State<AppState>,
) -> AppResult<Json<Vec<Experience>>> {

    let experiences =
        services::experience::get_all_experience(&state.db).await?;

    Ok(Json(experiences))
}

pub async fn get_experience_by_id(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Experience>> {

    let experience =
        services::experience::get_experience_by_id(&state.db, id).await?;

    Ok(Json(experience))
}

pub async fn create_experience(
    State(state): State<AppState>,
    Json(request): Json<ExperienceRequest>,
) -> AppResult<Json<Experience>> {

    let experience =
        services::experience::create_experience(&state.db, request).await?;

    Ok(Json(experience))
}

pub async fn update_experience(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(request): Json<ExperienceRequest>,
) -> AppResult<Json<Experience>> {

    let experience =
        services::experience::update_experience(
            &state.db,
            id,
            request,
        )
        .await?;

    Ok(Json(experience))
}

pub async fn delete_experience(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> AppResult<StatusCode> {

    services::experience::delete_experience(&state.db, id).await?;

    Ok(StatusCode::NO_CONTENT)
}