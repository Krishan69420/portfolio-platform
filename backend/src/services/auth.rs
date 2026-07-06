use sqlx::PgPool;

use crate::{
    models::User,
    repositories::user,
    utils::password,
};

pub async fn authenticate(
    pool: &PgPool,
    email: &str,
    password: &str,
) -> Result<User, &'static str> {

    println!("Trying login for: {}", email);

    let user = user::find_by_email(pool, email)
        .await
        .map_err(|e| {
            println!("Database Error: {:?}", e);
            "User not found"
        })?;

    println!("User found: {}", user.email);

    let valid = password::verify_password(password, &user.password_hash);

    println!("Password valid: {}", valid);

    if !valid {
        return Err("Invalid password");
    }

    println!("Login successful!");

    Ok(user)
}