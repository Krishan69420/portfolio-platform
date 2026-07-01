use crate::{
    models::PersonalInfo,
    repositories::personal_info,
};

use sqlx::PgPool;

pub async fn get_personal_info(
    pool: &PgPool,
) -> Result<PersonalInfo, sqlx::Error> {

    personal_info::get_personal_info(pool).await
}