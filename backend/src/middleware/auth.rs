use axum::{
    extract::{Request, State},
    http::{
        header::AUTHORIZATION,
        StatusCode,
    },
    middleware::Next,
    response::Response,
};

use crate::{
    state::AppState,
    utils::jwt,
};

pub async fn require_auth(
    State(state): axum::extract::State<AppState>,
    request: Request,
    next: Next,
) -> Result<Response, StatusCode> {

    let auth_header = request
        .headers()
        .get(AUTHORIZATION)
        .and_then(|h| h.to_str().ok())
        .ok_or(StatusCode::UNAUTHORIZED)?;

    if !auth_header.starts_with("Bearer ") {
        return Err(StatusCode::UNAUTHORIZED);
    }

    let token = auth_header.trim_start_matches("Bearer ");

    jwt::verify_token(
        token,
        &state.config.jwt_secret,
    )
    .map_err(|_| StatusCode::UNAUTHORIZED)?;

    Ok(next.run(request).await)
}