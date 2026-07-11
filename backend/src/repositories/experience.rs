use crate::models::{Experience, ExperienceRequest};
use sqlx::PgPool;
use uuid::Uuid;

pub async fn get_all_experience(
    pool: &PgPool,
) -> Result<Vec<Experience>, sqlx::Error> {
    sqlx::query_as::<_, Experience>(
        r#"
        SELECT *
        FROM experience
        ORDER BY sort_order ASC
        "#
    )
    .fetch_all(pool)
    .await
}

pub async fn get_experience_by_id(
    pool: &PgPool,
    id: Uuid,
) -> Result<Experience, sqlx::Error> {
    sqlx::query_as::<_, Experience>(
        r#"
        SELECT *
        FROM experience
        WHERE id = $1
        "#
    )
    .bind(id)
    .fetch_one(pool)
    .await
}

pub async fn create_experience(
    pool: &PgPool,
    request: &ExperienceRequest,
) -> Result<Experience, sqlx::Error> {
    sqlx::query_as::<_, Experience>(
        r#"
        INSERT INTO experience (
            company_name,
            company_logo_url,
            company_url,
            role,
            employment_type,
            location,
            is_remote,
            start_date,
            end_date,
            is_current,
            description,
            responsibilities,
            achievements,
            tech_stack,
            sort_order
        )
        VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15
        )
        RETURNING *
        "#
    )
    .bind(&request.company_name)
    .bind(&request.company_logo_url)
    .bind(&request.company_url)
    .bind(&request.role)
    .bind(&request.employment_type)
    .bind(&request.location)
    .bind(request.is_remote)
    .bind(request.start_date)
    .bind(request.end_date)
    .bind(request.is_current)
    .bind(&request.description)
    .bind(&request.responsibilities)
    .bind(&request.achievements)
    .bind(&request.tech_stack)
    .bind(request.sort_order)
    .fetch_one(pool)
    .await
}

pub async fn update_experience(
    pool: &PgPool,
    id: Uuid,
    request: &ExperienceRequest,
) -> Result<Experience, sqlx::Error> {
    sqlx::query_as::<_, Experience>(
        r#"
        UPDATE experience
        SET
            company_name = $1,
            company_logo_url = $2,
            company_url = $3,
            role = $4,
            employment_type = $5,
            location = $6,
            is_remote = $7,
            start_date = $8,
            end_date = $9,
            is_current = $10,
            description = $11,
            responsibilities = $12,
            achievements = $13,
            tech_stack = $14,
            sort_order = $15,
            updated_at = NOW()
        WHERE id = $16
        RETURNING *
        "#
    )
    .bind(&request.company_name)
    .bind(&request.company_logo_url)
    .bind(&request.company_url)
    .bind(&request.role)
    .bind(&request.employment_type)
    .bind(&request.location)
    .bind(request.is_remote)
    .bind(request.start_date)
    .bind(request.end_date)
    .bind(request.is_current)
    .bind(&request.description)
    .bind(&request.responsibilities)
    .bind(&request.achievements)
    .bind(&request.tech_stack)
    .bind(request.sort_order)
    .bind(id)
    .fetch_one(pool)
    .await
}

pub async fn delete_experience(
    pool: &PgPool,
    id: Uuid,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        "DELETE FROM experience WHERE id = $1"
    )
    .bind(id)
    .execute(pool)
    .await?;

    Ok(())
}