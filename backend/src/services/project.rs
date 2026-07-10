use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    errors::{AppError, AppResult},
    models::{CreateProjectRequest, Project, UpdateProjectRequest},
    repositories::project,
    utils::slug,
};

// Get all projects
pub async fn get_all_projects(
    pool: &PgPool,
) -> AppResult<Vec<Project>> {

    let projects = project::get_all_projects(pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

    Ok(projects)
}

// Get project by ID
pub async fn get_project_by_id(
    pool: &PgPool,
    id: Uuid,
) -> AppResult<Project> {

    let project = project::get_project_by_id(pool, id)
        .await
        .map_err(|_| AppError::NotFound("Project not found".to_string()))?;

    Ok(project)
}

// Get project by slug
pub async fn get_project_by_slug(
    pool: &PgPool,
    slug: &str,
) -> AppResult<Project> {

    let project = project::get_project_by_slug(pool, slug)
        .await
        .map_err(|_| AppError::NotFound("Project not found".to_string()))?;

    Ok(project)
}
pub async fn create_project(
    pool: &PgPool,
    request: CreateProjectRequest,
) -> AppResult<Project> {

    let slug = slug::generate_slug(&request.title);

    let project = project::create_project(
        pool,
        &slug,
        &request,
    )
    .await
    .map_err(|e| AppError::Internal(e.into()))?;

    Ok(project)
}

pub async fn update_project(
    pool: &PgPool,
    id: Uuid,
    request: UpdateProjectRequest,
) -> AppResult<Project> {

    let slug = slug::generate_slug(&request.title);

    let project = project::update_project(
        pool,
        id,
        &slug,
        &request,
    )
    .await
    .map_err(|_| AppError::NotFound("Project not found".to_string()))?;

    Ok(project)
}

pub async fn delete_project(
    pool: &PgPool,
    id: Uuid,
) -> AppResult<()> {

    project::delete_project(pool, id)
        .await
        .map_err(|_| AppError::NotFound("Project not found".to_string()))?;

    Ok(())
}