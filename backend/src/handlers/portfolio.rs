use axum::{
    extract::State,
    http::StatusCode,
    Json,
};

use crate::{
    services,
    state::AppState,
};

pub async fn get_personal_info(
    State(state): State<AppState>,
) -> Result<Json<crate::models::PersonalInfo>, StatusCode> {

    let personal = services::personal_info::get_personal_info(&state.db)
    .await
    .map_err(|err| {
        println!("DATABASE ERROR: {:?}", err);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;
    Ok(Json(personal))
}