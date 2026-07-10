use axum::{
    extract::{Path, State},
    Json,
};

use uuid::Uuid;

use crate::{
    errors::AppResult,
    models::{CreateProjectRequest, Project, UpdateProjectRequest},
    services,
    state::AppState,
};
use axum::http::StatusCode;
pub async fn get_all_projects(
    State(state): State<AppState>,
) -> AppResult<Json<Vec<Project>>> {

    let projects =
        services::project::get_all_projects(&state.db).await?;

    Ok(Json(projects))
}

pub async fn get_project_by_id(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Project>> {

    let project =
        services::project::get_project_by_id(&state.db, id).await?;

    Ok(Json(project))
}

pub async fn get_project_by_slug(
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> AppResult<Json<Project>> {

    let project =
        services::project::get_project_by_slug(&state.db, &slug).await?;

    Ok(Json(project))
}
pub async fn create_project(
    State(state): State<AppState>,
    Json(request): Json<CreateProjectRequest>,
) -> AppResult<Json<Project>> {

    let project = services::project::create_project(
        &state.db,
        request,
    )
    .await?;

    Ok(Json(project))
}

pub async fn update_project(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(request): Json<UpdateProjectRequest>,
) -> AppResult<Json<Project>> {

    let project = services::project::update_project(
        &state.db,
        id,
        request,
    )
    .await?;

    Ok(Json(project))
}

pub async fn delete_project(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> AppResult<StatusCode> {

    services::project::delete_project(
        &state.db,
        id,
    )
    .await?;

    Ok(StatusCode::NO_CONTENT)
}