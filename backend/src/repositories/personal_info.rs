use crate::models::PersonalInfo;
use sqlx::PgPool;

pub async fn get_personal_info(
    pool: &PgPool,
) -> Result<PersonalInfo, sqlx::Error> {

    sqlx::query_as::<_, PersonalInfo>(
        r#"
        SELECT *
        FROM personal_info
        LIMIT 1
        "#
    )
    .fetch_one(pool)
    .await
}