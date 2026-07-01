use crate::{errors::AppError, utils::jwt, AppState};
use axum::{
    body::Body,
    extract::State,
    http::{header, Request, StatusCode},
    middleware::Next,
    response::Response,
};

pub async fn require_auth(
    State(state): State<AppState>,
    mut req: Request<Body>,
    next: Next,
) -> Result<Response, AppError> {
    let token = req
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|auth| auth.to_str().ok())
        .and_then(|auth| auth.strip_prefix("Bearer "))
        .ok_or_else(|| AppError::Unauthorized("Missing authorization header".to_string()))?;

    let claims = jwt::decode_token(token, &state.config.jwt_secret)?;

    // Verify user exists and is active
    let user = sqlx::query!(
        "SELECT id, role FROM users WHERE id = $1",
        uuid::Uuid::parse_str(&claims.sub).map_err(|_| AppError::Unauthorized("Invalid token".to_string()))?
    )
    .fetch_optional(&state.db.pool)
    .await
    .map_err(AppError::DatabaseError)?
    .ok_or_else(|| AppError::Unauthorized("User not found".to_string()))?;

    // Attach claims to request extensions
    req.extensions_mut().insert(claims);
    req.extensions_mut().insert(user.role);

    Ok(next.run(req).await)
}

pub async fn require_admin(
    State(state): State<AppState>,
    mut req: Request<Body>,
    next: Next,
) -> Result<Response, AppError> {
    // First run auth check
    let token = req
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|auth| auth.to_str().ok())
        .and_then(|auth| auth.strip_prefix("Bearer "))
        .ok_or_else(|| AppError::Unauthorized("Missing authorization header".to_string()))?;

    let claims = jwt::decode_token(token, &state.config.jwt_secret)?;

    if claims.role != "admin" {
        return Err(AppError::Forbidden("Admin access required".to_string()));
    }

    req.extensions_mut().insert(claims);
    Ok(next.run(req).await)
}
