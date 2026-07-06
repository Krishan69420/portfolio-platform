use axum::{
    extract::State,
    http::StatusCode,
    Json,
};

use serde_json::json;

use crate::{
    models::LoginRequest,
    services,
    state::AppState,
    utils::jwt,
};

pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<serde_json::Value>, StatusCode> {

    let user = services::auth::authenticate(
        &state.db,
        &payload.email,
        &payload.password,
    )
    .await
    .map_err(|_| StatusCode::UNAUTHORIZED)?;

    let token = jwt::generate_token(
        user.id,
        &user.email,
        &user.role,
        &state.config.jwt_secret,
    )
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(json!({
        "success": true,
        "message": "Login successful",
        "access_token": token,
        "token_type": "Bearer"
    })))
}