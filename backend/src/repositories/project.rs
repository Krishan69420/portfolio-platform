use sqlx::PgPool;
use uuid::Uuid;
use crate::models::{
    Project,
    CreateProjectRequest,
    UpdateProjectRequest,
};

pub async fn create_project(
    pool: &PgPool,
    slug: &str,
    request: &CreateProjectRequest,
) -> Result<Project, sqlx::Error> {
    sqlx::query_as::<_, Project>(
        r#"
        INSERT INTO projects (
            title,
            slug,
            short_description,
            description,
            tech_stack,
            github_url,
            live_demo_url,
            cover_image_url,
            category,
            is_featured,
            is_open_source,
            start_date,
            end_date
        )
        VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
        )
        RETURNING *
        "#
    )
    .bind(&request.title)
    .bind(slug)
    .bind(&request.short_description)
    .bind(&request.description)
    .bind(&request.tech_stack)
    .bind(&request.github_url)
    .bind(&request.live_demo_url)
    .bind(&request.cover_image_url)
    .bind(&request.category)
    .bind(request.is_featured)
    .bind(request.is_open_source)
    .bind(request.start_date)
    .bind(request.end_date)
    .fetch_one(pool)
    .await
}

pub async fn update_project(
    pool: &PgPool,
    id: Uuid,
    slug: &str,
    request: &UpdateProjectRequest,
) -> Result<Project, sqlx::Error> {

    sqlx::query_as::<_, Project>(
        r#"
        UPDATE projects
        SET
            title = $1,
            slug = $2,
            short_description = $3,
            description = $4,
            tech_stack = $5,
            github_url = $6,
            live_demo_url = $7,
            cover_image_url = $8,
            category = $9,
            is_featured = $10,
            is_open_source = $11,
            start_date = $12,
            end_date = $13,
            updated_at = NOW()
        WHERE id = $14
        RETURNING *
        "#
    )
    .bind(&request.title)
    .bind(slug)
    .bind(&request.short_description)
    .bind(&request.description)
    .bind(&request.tech_stack)
    .bind(&request.github_url)
    .bind(&request.live_demo_url)
    .bind(&request.cover_image_url)
    .bind(&request.category)
    .bind(request.is_featured)
    .bind(request.is_open_source)
    .bind(request.start_date)
    .bind(request.end_date)
    .bind(id)
    .fetch_one(pool)
    .await
}

pub async fn delete_project(
    pool: &PgPool,
    id: Uuid,
) -> Result<(), sqlx::Error> {

    sqlx::query(
        r#"
        DELETE FROM projects
        WHERE id = $1
        "#
    )
    .bind(id)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn get_all_projects(
    pool: &PgPool,
) -> Result<Vec<Project>, sqlx::Error> {
    sqlx::query_as::<_, Project>(
        r#"
        SELECT *
        FROM projects
        ORDER BY sort_order ASC, created_at DESC
        "#
    )
    .fetch_all(pool)
    .await
}


pub async fn get_project_by_id(
    pool: &PgPool,
    id: Uuid,
) -> Result<Project, sqlx::Error> {
    sqlx::query_as::<_, Project>(
        r#"
        SELECT *
        FROM projects
        WHERE id = $1
        "#
    )
    .bind(id)
    .fetch_one(pool)
    .await
}

pub async fn get_project_by_slug(
    pool: &PgPool,
    slug: &str,
) -> Result<Project, sqlx::Error> {
    sqlx::query_as::<_, Project>(
        r#"
        SELECT *
        FROM projects
        WHERE slug = $1
        "#
    )
    .bind(slug)
    .fetch_one(pool)
    .await
}