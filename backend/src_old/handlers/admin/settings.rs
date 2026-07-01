use crate::{errors::AppResult, AppState};
use axum::{extract::State, Json};

pub async fn get_settings(State(state): State<AppState>) -> AppResult<Json<serde_json::Value>> {
    let rows = sqlx::query!("SELECT key, value, description FROM site_settings ORDER BY key")
        .fetch_all(&state.db.pool)
        .await
        .map_err(crate::errors::AppError::DatabaseError)?;
    let data: std::collections::HashMap<String, serde_json::Value> = rows
        .iter()
        .map(|r| {
            (
                r.key.clone(),
                serde_json::json!({
                    "value": r.value,
                    "description": r.description,
                }),
            )
        })
        .collect();
    Ok(Json(serde_json::json!({ "success": true, "data": data })))
}

pub async fn update_settings(
    State(state): State<AppState>,
    Json(req): Json<serde_json::Value>,
) -> AppResult<Json<serde_json::Value>> {
    if let Some(obj) = req.as_object() {
        for (key, val) in obj {
            let v = match val {
                serde_json::Value::String(s) => s.clone(),
                serde_json::Value::Bool(b) => b.to_string(),
                serde_json::Value::Number(n) => n.to_string(),
                _ => val.to_string(),
            };
            sqlx::query!(
                r#"INSERT INTO site_settings (key, value)
                   VALUES ($1, $2)
                   ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()"#,
                key,
                v
            )
            .execute(&state.db.pool)
            .await
            .map_err(crate::errors::AppError::DatabaseError)?;
        }
    }
    Ok(Json(serde_json::json!({ "success": true, "message": "Settings updated" })))
}
