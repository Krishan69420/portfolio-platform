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
    routing::{get, post, put, delete},
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
async fn admin_test() -> &'static str {
    "Welcome Admin!"
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

    let public_routes = Router::new()
    .route("/health", get(health))
    .route(
        "/api/portfolio/personal",
        get(handlers::portfolio::get_personal_info),
    )
    .route(
        "/api/auth/login",
        post(handlers::auth::login),
    )
    .route(
    "/api/projects",
    get(handlers::project::get_all_projects),
    )
    .route(
    "/api/projects/:id",
    get(handlers::project::get_project_by_id),
    )
    .route(
    "/api/projects/slug/:slug",
    get(handlers::project::get_project_by_slug),
).route(
    "/api/skills",
    get(handlers::skill::get_all_skills),
)
.route(
    "/api/skills/:id",
    get(handlers::skill::get_skill_by_id),
);

let admin_routes = Router::new()
    .route("/api/admin/test", get(admin_test))

    .route(
        "/api/admin/projects",
        post(handlers::project::create_project),
    )

    .route_layer(
        axum::middleware::from_fn_with_state(
            state.clone(),
            middleware::auth::require_auth,
        )
    )
    .route(
    "/api/admin/projects/:id",
    put(handlers::project::update_project),
    )
    .route(
    "/api/admin/projects/:id",
    delete(handlers::project::delete_project),
    ).route(
    "/api/admin/skills",
    post(handlers::skill::create_skill),
)
.route(
    "/api/admin/skills/:id",
    delete(handlers::skill::delete_skill),
)
.route(
    "/api/admin/skills/:id",
    put(handlers::skill::update_skill),
);

let app = Router::new()
    .merge(public_routes)
    .merge(admin_routes)
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