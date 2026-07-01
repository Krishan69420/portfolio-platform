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
};

pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<serde_json::Value>, StatusCode> {

    services::auth::authenticate(
        &state.db,
        &payload.email,
        &payload.password,
    )
    .await
    .map_err(|_| StatusCode::UNAUTHORIZED)?;

    Ok(Json(json!({
        "success": true,
        "message": "Login successful"
    })))
}