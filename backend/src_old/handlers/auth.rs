use crate::{
    errors::{AppError, AppResult},
    models::{AuthResponse, LoginRequest, UserPublic},
    utils::jwt,
    AppState,
};
use axum::{extract::State, Json};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

pub async fn login(
    State(state): State<AppState>,
    Json(req): Json<LoginRequest>,
) -> AppResult<Json<AuthResponse>> {
    // Fetch user
    let user = sqlx::query!(
        "SELECT id, email, password_hash, role FROM users WHERE email = $1",
        req.email
    )
    .fetch_optional(&state.db.pool)
    .await
    .map_err(AppError::DatabaseError)?
    .ok_or_else(|| AppError::Unauthorized("Invalid email or password".to_string()))?;

    // Verify password
    let valid = jwt::verify_password(&req.password, &user.password_hash)?;
    if !valid {
        return Err(AppError::Unauthorized("Invalid email or password".to_string()));
    }

    // Update last login
    sqlx::query!(
        "UPDATE users SET last_login = NOW() WHERE id = $1",
        user.id
    )
    .execute(&state.db.pool)
    .await
    .map_err(AppError::DatabaseError)?;

    // Create tokens
    let access_token = jwt::create_access_token(
        user.id,
        &user.email,
        &user.role,
        &state.config.jwt_secret,
        state.config.jwt_expiry_hours,
    )?;

    let refresh_token_raw = jwt::generate_refresh_token();
    let refresh_token_hash = jwt::hash_refresh_token(&refresh_token_raw);

    let expires_at = chrono::Utc::now()
        + chrono::Duration::days(state.config.refresh_token_expiry_days as i64);

    sqlx::query!(
        "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
        user.id,
        refresh_token_hash,
        expires_at
    )
    .execute(&state.db.pool)
    .await
    .map_err(AppError::DatabaseError)?;

    Ok(Json(AuthResponse {
        access_token,
        refresh_token: refresh_token_raw,
        token_type: "Bearer".to_string(),
        expires_in: state.config.jwt_expiry_hours * 3600,
        user: UserPublic {
            id: user.id,
            email: user.email,
            role: user.role,
        },
    }))
}

#[derive(Deserialize)]
pub struct RefreshRequest {
    pub refresh_token: String,
}

pub async fn refresh_token(
    State(state): State<AppState>,
    Json(req): Json<RefreshRequest>,
) -> AppResult<Json<serde_json::Value>> {
    let token_hash = jwt::hash_refresh_token(&req.refresh_token);

    let stored = sqlx::query!(
        r#"SELECT rt.id, rt.user_id, rt.expires_at, u.email, u.role
           FROM refresh_tokens rt
           JOIN users u ON u.id = rt.user_id
           WHERE rt.token_hash = $1 AND rt.expires_at > NOW()"#,
        token_hash
    )
    .fetch_optional(&state.db.pool)
    .await
    .map_err(AppError::DatabaseError)?
    .ok_or_else(|| AppError::Unauthorized("Invalid or expired refresh token".to_string()))?;

    // Rotate token - delete old
    sqlx::query!("DELETE FROM refresh_tokens WHERE id = $1", stored.id)
        .execute(&state.db.pool)
        .await
        .map_err(AppError::DatabaseError)?;

    // Create new tokens
    let access_token = jwt::create_access_token(
        stored.user_id,
        &stored.email,
        &stored.role,
        &state.config.jwt_secret,
        state.config.jwt_expiry_hours,
    )?;

    let new_refresh = jwt::generate_refresh_token();
    let new_hash = jwt::hash_refresh_token(&new_refresh);
    let expires_at = chrono::Utc::now()
        + chrono::Duration::days(state.config.refresh_token_expiry_days as i64);

    sqlx::query!(
        "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
        stored.user_id,
        new_hash,
        expires_at
    )
    .execute(&state.db.pool)
    .await
    .map_err(AppError::DatabaseError)?;

    Ok(Json(serde_json::json!({
        "access_token": access_token,
        "refresh_token": new_refresh,
        "token_type": "Bearer",
        "expires_in": state.config.jwt_expiry_hours * 3600
    })))
}

pub async fn logout(
    State(state): State<AppState>,
    Json(req): Json<RefreshRequest>,
) -> AppResult<Json<serde_json::Value>> {
    let token_hash = jwt::hash_refresh_token(&req.refresh_token);
    sqlx::query!("DELETE FROM refresh_tokens WHERE token_hash = $1", token_hash)
        .execute(&state.db.pool)
        .await
        .map_err(AppError::DatabaseError)?;

    Ok(Json(serde_json::json!({ "success": true, "message": "Logged out" })))
}

pub async fn me(
    State(state): State<AppState>,
    axum::Extension(claims): axum::Extension<crate::utils::jwt::Claims>,
) -> AppResult<Json<serde_json::Value>> {
    let user_id = Uuid::parse_str(&claims.sub)
        .map_err(|_| AppError::BadRequest("Invalid user id".to_string()))?;

    let user = sqlx::query!(
        "SELECT id, email, role, created_at, last_login FROM users WHERE id = $1",
        user_id
    )
    .fetch_one(&state.db.pool)
    .await
    .map_err(AppError::DatabaseError)?;

    Ok(Json(serde_json::json!({
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "created_at": user.created_at,
        "last_login": user.last_login
    })))
}

#[derive(Deserialize)]
pub struct ChangePasswordRequest {
    pub current_password: String,
    pub new_password: String,
}

pub async fn change_password(
    State(state): State<AppState>,
    axum::Extension(claims): axum::Extension<crate::utils::jwt::Claims>,
    Json(req): Json<ChangePasswordRequest>,
) -> AppResult<Json<serde_json::Value>> {
    let user_id = Uuid::parse_str(&claims.sub)
        .map_err(|_| AppError::BadRequest("Invalid user id".to_string()))?;

    let user = sqlx::query!("SELECT password_hash FROM users WHERE id = $1", user_id)
        .fetch_one(&state.db.pool)
        .await
        .map_err(AppError::DatabaseError)?;

    let valid = jwt::verify_password(&req.current_password, &user.password_hash)?;
    if !valid {
        return Err(AppError::Unauthorized("Current password is incorrect".to_string()));
    }

    if req.new_password.len() < 8 {
        return Err(AppError::BadRequest("Password must be at least 8 characters".to_string()));
    }

    let new_hash = jwt::hash_password(&req.new_password)?;
    sqlx::query!("UPDATE users SET password_hash = $1 WHERE id = $2", new_hash, user_id)
        .execute(&state.db.pool)
        .await
        .map_err(AppError::DatabaseError)?;

    // Invalidate all refresh tokens
    sqlx::query!("DELETE FROM refresh_tokens WHERE user_id = $1", user_id)
        .execute(&state.db.pool)
        .await
        .map_err(AppError::DatabaseError)?;

    Ok(Json(serde_json::json!({ "success": true, "message": "Password changed. Please login again." })))
}
