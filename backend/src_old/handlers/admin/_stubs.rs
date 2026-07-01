// Stub implementations for all remaining admin handlers

use crate::{errors::AppResult, AppState};
use axum::{extract::{Path, State}, Json};
use uuid::Uuid;

// ─── Settings ────────────────────────────────────────────────────────────────
pub mod settings_impl {
    use super::*;
    pub async fn get_settings(State(state): State<AppState>) -> AppResult<Json<serde_json::Value>> {
        let settings = sqlx::query!("SELECT key, value, description FROM site_settings ORDER BY key")
            .fetch_all(&state.db.pool).await.map_err(crate::errors::AppError::DatabaseError)?;
        let data: std::collections::HashMap<String, serde_json::Value> = settings.iter()
            .map(|s| (s.key.clone(), serde_json::json!({"value": s.value, "description": s.description})))
            .collect();
        Ok(Json(serde_json::json!({"success": true, "data": data})))
    }

    pub async fn update_settings(State(state): State<AppState>, Json(req): Json<serde_json::Value>) -> AppResult<Json<serde_json::Value>> {
        if let Some(obj) = req.as_object() {
            for (key, val) in obj {
                sqlx::query!("INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2", key, val.as_str().unwrap_or(""))
                    .execute(&state.db.pool).await.map_err(crate::errors::AppError::DatabaseError)?;
            }
        }
        Ok(Json(serde_json::json!({"success": true, "message": "Settings updated"})))
    }
}
