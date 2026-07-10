use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    errors::{AppError, AppResult},
    models::{Skill, SkillRequest},
    repositories::skill,
};

pub async fn get_all_skills(
    pool: &PgPool,
) -> AppResult<Vec<Skill>> {

    let skills = skill::get_all_skills(pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

    Ok(skills)
}

pub async fn create_skill(
    pool: &PgPool,
    request: SkillRequest,
) -> AppResult<Skill> {

    let skill = skill::create_skill(pool, &request)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

    Ok(skill)
}

pub async fn delete_skill(
    pool: &PgPool,
    id: Uuid,
) -> AppResult<()> {

    skill::delete_skill(pool, id)
        .await
        .map_err(|_| AppError::NotFound("Skill not found".to_string()))?;

    Ok(())
}
pub async fn get_skill_by_id(
    pool: &PgPool,
    id: Uuid,
) -> AppResult<Skill> {

    let skill = skill::get_skill_by_id(pool, id)
        .await
        .map_err(|_| AppError::NotFound("Skill not found".to_string()))?;

    Ok(skill)
}
pub async fn update_skill(
    pool: &PgPool,
    id: Uuid,
    request: SkillRequest,
) -> AppResult<Skill> {

    let skill = skill::update_skill(
        pool,
        id,
        &request,
    )
    .await
    .map_err(|_| AppError::NotFound("Skill not found".to_string()))?;

    Ok(skill)
}