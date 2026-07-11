use crate::models::{Education, EducationRequest};
use sqlx::PgPool;
use uuid::Uuid;

pub async fn get_all_education(
    pool: &PgPool,
) -> Result<Vec<Education>, sqlx::Error> {
    sqlx::query_as::<_, Education>(
        r#"
        SELECT *
        FROM education
        ORDER BY sort_order ASC
        "#
    )
    .fetch_all(pool)
    .await
}

pub async fn get_education_by_id(
    pool: &PgPool,
    id: Uuid,
) -> Result<Education, sqlx::Error> {
    sqlx::query_as::<_, Education>(
        r#"
        SELECT *
        FROM education
        WHERE id = $1
        "#
    )
    .bind(id)
    .fetch_one(pool)
    .await
}

pub async fn create_education(
    pool: &PgPool,
    request: &EducationRequest,
) -> Result<Education, sqlx::Error> {
    sqlx::query_as::<_, Education>(
        r#"
        INSERT INTO education (
            institution_name,
            institution_logo_url,
            institution_url,
            degree,
            field_of_study,
            specialization,
            start_date,
            end_date,
            is_current,
            cgpa,
            max_cgpa,
            percentage,
            grade,
            location,
            description,
            achievements,
            relevant_courses,
            sort_order
        )
        VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,
            $10,$11,$12,$13,$14,$15,$16,$17,$18
        )
        RETURNING *
        "#
    )
    .bind(&request.institution_name)
    .bind(&request.institution_logo_url)
    .bind(&request.institution_url)
    .bind(&request.degree)
    .bind(&request.field_of_study)
    .bind(&request.specialization)
    .bind(request.start_date)
    .bind(request.end_date)
    .bind(request.is_current)
    .bind(request.cgpa)
    .bind(request.max_cgpa)
    .bind(request.percentage)
    .bind(&request.grade)
    .bind(&request.location)
    .bind(&request.description)
    .bind(&request.achievements)
    .bind(&request.relevant_courses)
    .bind(request.sort_order)
    .fetch_one(pool)
    .await
}

pub async fn update_education(
    pool: &PgPool,
    id: Uuid,
    request: &EducationRequest,
) -> Result<Education, sqlx::Error> {
    sqlx::query_as::<_, Education>(
        r#"
        UPDATE education
        SET
            institution_name = $1,
            institution_logo_url = $2,
            institution_url = $3,
            degree = $4,
            field_of_study = $5,
            specialization = $6,
            start_date = $7,
            end_date = $8,
            is_current = $9,
            cgpa = $10,
            max_cgpa = $11,
            percentage = $12,
            grade = $13,
            location = $14,
            description = $15,
            achievements = $16,
            relevant_courses = $17,
            sort_order = $18,
            updated_at = NOW()
        WHERE id = $19
        RETURNING *
        "#
    )
    .bind(&request.institution_name)
    .bind(&request.institution_logo_url)
    .bind(&request.institution_url)
    .bind(&request.degree)
    .bind(&request.field_of_study)
    .bind(&request.specialization)
    .bind(request.start_date)
    .bind(request.end_date)
    .bind(request.is_current)
    .bind(request.cgpa)
    .bind(request.max_cgpa)
    .bind(request.percentage)
    .bind(&request.grade)
    .bind(&request.location)
    .bind(&request.description)
    .bind(&request.achievements)
    .bind(&request.relevant_courses)
    .bind(request.sort_order)
    .bind(id)
    .fetch_one(pool)
    .await
}

pub async fn delete_education(
    pool: &PgPool,
    id: Uuid,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        "DELETE FROM education WHERE id = $1"
    )
    .bind(id)
    .execute(pool)
    .await?;

    Ok(())
}
pub async fn delete_all_education(
    pool: &PgPool,
) -> Result<(), sqlx::Error> {
    sqlx::query("DELETE FROM education")
        .execute(pool)
        .await?;

    Ok(())
}