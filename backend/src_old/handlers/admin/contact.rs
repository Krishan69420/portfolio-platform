// contact.rs
use crate::{errors::AppResult, AppState};
use axum::{extract::{Path, Query, State}, Json};
use serde::Deserialize;
use uuid::Uuid;

#[derive(Deserialize)]
pub struct ContactQuery { pub page: Option<i64>, pub per_page: Option<i64>, pub unread: Option<bool> }

pub async fn list_messages(State(state): State<AppState>, Query(q): Query<ContactQuery>) -> AppResult<Json<serde_json::Value>> {
    let page = q.page.unwrap_or(1).max(1);
    let per_page = q.per_page.unwrap_or(20).min(100);
    let offset = (page - 1) * per_page;
    let messages = sqlx::query!(
        "SELECT id,sender_name,sender_email,subject,message,is_read,is_replied,is_spam,created_at FROM contact_messages WHERE is_spam=false AND ($1::BOOLEAN IS NULL OR is_read = NOT $1) ORDER BY created_at DESC LIMIT $2 OFFSET $3",
        q.unread, per_page, offset
    ).fetch_all(&state.db.pool).await.map_err(crate::errors::AppError::DatabaseError)?;
    let total: i64 = sqlx::query_scalar!("SELECT COUNT(*) FROM contact_messages WHERE is_spam=false").fetch_one(&state.db.pool).await.map_err(crate::errors::AppError::DatabaseError)?.unwrap_or(0);
    let data: Vec<_> = messages.iter().map(|m| serde_json::json!({"id":m.id,"sender_name":m.sender_name,"sender_email":m.sender_email,"subject":m.subject,"message":m.message,"is_read":m.is_read,"is_replied":m.is_replied,"is_spam":m.is_spam,"created_at":m.created_at})).collect();
    Ok(Json(serde_json::json!({"success":true,"data":data,"pagination":{"total":total,"page":page,"per_page":per_page}})))
}

pub async fn get_message(State(state): State<AppState>, Path(id): Path<Uuid>) -> AppResult<Json<serde_json::Value>> {
    let m = sqlx::query!("SELECT * FROM contact_messages WHERE id=$1", id).fetch_optional(&state.db.pool).await.map_err(crate::errors::AppError::DatabaseError)?.ok_or_else(|| crate::errors::AppError::NotFound("Message not found".to_string()))?;
    sqlx::query!("UPDATE contact_messages SET is_read=true WHERE id=$1", id).execute(&state.db.pool).await.map_err(crate::errors::AppError::DatabaseError)?;
    Ok(Json(serde_json::json!({"success":true,"data":{"id":m.id,"sender_name":m.sender_name,"sender_email":m.sender_email,"subject":m.subject,"message":m.message,"is_read":true,"is_replied":m.is_replied,"created_at":m.created_at}})))
}

pub async fn mark_read(State(state): State<AppState>, Path(id): Path<Uuid>) -> AppResult<Json<serde_json::Value>> {
    sqlx::query!("UPDATE contact_messages SET is_read=true WHERE id=$1", id).execute(&state.db.pool).await.map_err(crate::errors::AppError::DatabaseError)?;
    Ok(Json(serde_json::json!({"success":true,"message":"Marked as read"})))
}

pub async fn mark_spam(State(state): State<AppState>, Path(id): Path<Uuid>) -> AppResult<Json<serde_json::Value>> {
    sqlx::query!("UPDATE contact_messages SET is_spam=true WHERE id=$1", id).execute(&state.db.pool).await.map_err(crate::errors::AppError::DatabaseError)?;
    Ok(Json(serde_json::json!({"success":true,"message":"Marked as spam"})))
}

pub async fn delete_message(State(state): State<AppState>, Path(id): Path<Uuid>) -> AppResult<Json<serde_json::Value>> {
    sqlx::query!("DELETE FROM contact_messages WHERE id=$1", id).execute(&state.db.pool).await.map_err(crate::errors::AppError::DatabaseError)?;
    Ok(Json(serde_json::json!({"success":true,"message":"Message deleted"})))
}
