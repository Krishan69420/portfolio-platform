use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};

use uuid::Uuid;

use crate::{
    errors::AppResult,
    models::{Skill, SkillRequest},
    services,
    state::AppState,
};

pub async fn get_all_skills(
    State(state): State<AppState>,
) -> AppResult<Json<Vec<Skill>>> {

    let skills = services::skill::get_all_skills(&state.db).await?;

    Ok(Json(skills))
}

pub async fn create_skill(
    State(state): State<AppState>,
    Json(request): Json<SkillRequest>,
) -> AppResult<Json<Skill>> {

    let skill =
        services::skill::create_skill(&state.db, request).await?;

    Ok(Json(skill))
}

pub async fn delete_skill(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> AppResult<StatusCode> {

    services::skill::delete_skill(&state.db, id).await?;

    Ok(StatusCode::NO_CONTENT)
}
pub async fn get_skill_by_id(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Skill>> {

    println!("Handler reached! Skill ID: {}", id);

    let skill = services::skill::get_skill_by_id(
        &state.db,
        id,
    )
    .await?;

    Ok(Json(skill))
}
pub async fn update_skill(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(request): Json<SkillRequest>,
) -> AppResult<Json<Skill>> {

    let skill = services::skill::update_skill(
        &state.db,
        id,
        request,
    )
    .await?;

    Ok(Json(skill))
}