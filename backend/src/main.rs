mod config;
mod db;
mod errors;
mod handlers;
mod middleware;
mod models;
mod state;
mod utils;
mod repositories;
mod services;

use axum::{
    routing::{get, post},
    Json,
    Router,
};
use serde::Serialize;
use sqlx::PgPool;
use std::{net::SocketAddr, sync::Arc};
use tower_http::{
    cors::CorsLayer,
    trace::TraceLayer,
};

use config::AppConfig;
use state::AppState;

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    database: String,
    version: String,
}

async fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok".into(),
        database: "connected".into(),
        version: "1.0.0".into(),
    })
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();

    tracing_subscriber::fmt::init();

    let config = Arc::new(AppConfig::from_env()?);

    let pool: PgPool = db::connect(&config.database_url).await?;

    println!("✅ Connected to PostgreSQL");

    let state = AppState {
        db: pool,
        config: config.clone(),
    };

    let app = Router::new()
    .route("/health", get(health))
    .route(
        "/api/portfolio/personal",
        get(handlers::portfolio::get_personal_info),
    ).route(
    "/api/auth/login",
    post(handlers::auth::login),
)
    .layer(CorsLayer::new().allow_origin(config.allowed_origins()))
    .layer(TraceLayer::new_for_http())
    .with_state(state);

    let addr: SocketAddr = format!("{}:{}", config.host, config.port).parse()?;

    println!("🚀 Portfolio Backend Started");
    println!("Listening on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;

    axum::serve(listener, app).await?;

    Ok(())
}