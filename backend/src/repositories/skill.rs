use crate::models::{Skill, SkillRequest};
use sqlx::PgPool;
use uuid::Uuid;

pub async fn get_all_skills(
    pool: &PgPool,
) -> Result<Vec<Skill>, sqlx::Error> {
    sqlx::query_as::<_, Skill>(
        r#"
        SELECT *
        FROM skills
        ORDER BY sort_order ASC
        "#
    )
    .fetch_all(pool)
    .await
}

pub async fn create_skill(
    pool: &PgPool,
    request: &SkillRequest,
) -> Result<Skill, sqlx::Error> {
    sqlx::query_as::<_, Skill>(
        r#"
        INSERT INTO skills (
            name,
            category,
            experience_level,
            years_of_experience,
            icon,
            icon_color,
            is_featured,
            is_currently_learning,
            proficiency_score,
            sort_order
        )
        VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
        )
        RETURNING *
        "#
    )
    .bind(&request.name)
    .bind(&request.category)
    .bind(&request.experience_level)
    .bind(request.years_of_experience)
    .bind(&request.icon)
    .bind(&request.icon_color)
    .bind(request.is_featured)
    .bind(request.is_currently_learning)
    .bind(request.proficiency_score)
    .bind(request.sort_order)
    .fetch_one(pool)
    .await
}

pub async fn delete_skill(
    pool: &PgPool,
    id: Uuid,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        "DELETE FROM skills WHERE id = $1"
    )
    .bind(id)
    .execute(pool)
    .await?;

    Ok(())
}
pub async fn get_skill_by_id(
    pool: &PgPool,
    id: Uuid,
) -> Result<Skill, sqlx::Error> {

    sqlx::query_as::<_, Skill>(
        r#"
        SELECT *
        FROM skills
        WHERE id = $1
        "#
    )
    .bind(id)
    .fetch_one(pool)
    .await
}pub async fn update_skill(
    pool: &PgPool,
    id: Uuid,
    request: &SkillRequest,
) -> Result<Skill, sqlx::Error> {

    sqlx::query_as::<_, Skill>(
        r#"
        UPDATE skills
        SET
            name = $1,
            category = $2,
            experience_level = $3,
            years_of_experience = $4,
            icon = $5,
            icon_color = $6,
            is_featured = $7,
            is_currently_learning = $8,
            proficiency_score = $9,
            sort_order = $10,
            updated_at = NOW()
        WHERE id = $11
        RETURNING *
        "#
    )
    .bind(&request.name)
    .bind(&request.category)
    .bind(&request.experience_level)
    .bind(request.years_of_experience)
    .bind(&request.icon)
    .bind(&request.icon_color)
    .bind(request.is_featured)
    .bind(request.is_currently_learning)
    .bind(request.proficiency_score)
    .bind(request.sort_order)
    .bind(id)
    .fetch_one(pool)
    .await
}