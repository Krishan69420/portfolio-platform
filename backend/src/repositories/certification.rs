use crate::models::{Certification, CertificationRequest};
use sqlx::PgPool;
use uuid::Uuid;

pub async fn get_all_certifications(
    pool: &PgPool,
) -> Result<Vec<Certification>, sqlx::Error> {
    sqlx::query_as::<_, Certification>(
        r#"
        SELECT *
        FROM certifications
        ORDER BY sort_order ASC
        "#
    )
    .fetch_all(pool)
    .await
}

pub async fn get_certification_by_id(
    pool: &PgPool,
    id: Uuid,
) -> Result<Certification, sqlx::Error> {
    sqlx::query_as::<_, Certification>(
        r#"
        SELECT *
        FROM certifications
        WHERE id = $1
        "#
    )
    .bind(id)
    .fetch_one(pool)
    .await
}

pub async fn create_certification(
    pool: &PgPool,
    request: &CertificationRequest,
) -> Result<Certification, sqlx::Error> {
    sqlx::query_as::<_, Certification>(
        r#"
        INSERT INTO certifications(
            name,
            issuing_organization,
            issue_date,
            expiry_date,
            credential_id,
            credential_url,
            image_url,
            skills,
            is_featured,
            sort_order
        )
        VALUES(
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
        )
        RETURNING *
        "#
    )
    .bind(&request.name)
    .bind(&request.issuing_organization)
    .bind(request.issue_date)
    .bind(request.expiry_date)
    .bind(&request.credential_id)
    .bind(&request.credential_url)
    .bind(&request.image_url)
    .bind(&request.skills)
    .bind(request.is_featured)
    .bind(request.sort_order)
    .fetch_one(pool)
    .await
}

pub async fn update_certification(
    pool: &PgPool,
    id: Uuid,
    request: &CertificationRequest,
) -> Result<Certification, sqlx::Error> {
    sqlx::query_as::<_, Certification>(
        r#"
        UPDATE certifications
        SET
            name=$1,
            issuing_organization=$2,
            issue_date=$3,
            expiry_date=$4,
            credential_id=$5,
            credential_url=$6,
            image_url=$7,
            skills=$8,
            is_featured=$9,
            sort_order=$10,
            updated_at=NOW()
        WHERE id=$11
        RETURNING *
        "#
    )
    .bind(&request.name)
    .bind(&request.issuing_organization)
    .bind(request.issue_date)
    .bind(request.expiry_date)
    .bind(&request.credential_id)
    .bind(&request.credential_url)
    .bind(&request.image_url)
    .bind(&request.skills)
    .bind(request.is_featured)
    .bind(request.sort_order)
    .bind(id)
    .fetch_one(pool)
    .await
}

pub async fn delete_certification(
    pool: &PgPool,
    id: Uuid,
) -> Result<(), sqlx::Error> {
    sqlx::query("DELETE FROM certifications WHERE id = $1")
        .bind(id)
        .execute(pool)
        .await?;

    Ok(())
}

pub async fn delete_all_certifications(
    pool: &PgPool,
) -> Result<(), sqlx::Error> {
    sqlx::query("DELETE FROM certifications")
        .execute(pool)
        .await?;

    Ok(())
}