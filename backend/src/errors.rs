use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::Serialize;

pub type AppResult<T> = Result<T, AppError>;

#[derive(Debug)]
pub enum AppError {
    Internal(anyhow::Error),
    NotFound(String),
}

#[derive(Serialize)]
struct ErrorResponse {
    success: bool,
    message: String,
}

impl From<anyhow::Error> for AppError {
    fn from(err: anyhow::Error) -> Self {
        Self::Internal(err)
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {

        match self {

            AppError::Internal(err) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    success: false,
                    message: err.to_string(),
                }),
            )
                .into_response(),

            AppError::NotFound(message) => (
                StatusCode::NOT_FOUND,
                Json(ErrorResponse {
                    success: false,
                    message,
                }),
            )
                .into_response(),
        }

    }
}