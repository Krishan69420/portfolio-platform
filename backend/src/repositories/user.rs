use crate::models::User;
use sqlx::PgPool;

pub async fn find_by_email(
    pool: &PgPool,
    email: &str,
) -> Result<User, sqlx::Error> {

    sqlx::query_as::<_, User>(
        r#"
        SELECT *
        FROM users
        WHERE email = $1
        "#,
    )
    .bind(email)
    .fetch_one(pool)
    .await
}