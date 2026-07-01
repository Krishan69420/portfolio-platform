pub mod jwt;

pub use jwt::*;

use slug::slugify;
use uuid::Uuid;

pub fn make_slug(title: &str) -> String {
    let base = slugify(title);
    format!("{}-{}", base, &Uuid::new_v4().to_string()[..8])
}

pub fn make_slug_simple(title: &str) -> String {
    slugify(title)
}

pub fn sanitize_filename(name: &str) -> String {
    name.chars()
        .map(|c| if c.is_alphanumeric() || c == '.' || c == '-' || c == '_' { c } else { '_' })
        .collect()
}

pub fn get_file_extension(filename: &str) -> Option<&str> {
    filename.rsplit('.').next()
}

pub fn is_valid_image_extension(ext: &str) -> bool {
    matches!(ext.to_lowercase().as_str(), "jpg" | "jpeg" | "png" | "gif" | "webp" | "svg")
}

pub fn is_valid_pdf_extension(ext: &str) -> bool {
    ext.to_lowercase() == "pdf"
}

pub fn paginate_params(page: Option<i64>, per_page: Option<i64>) -> (i64, i64) {
    let page = page.unwrap_or(1).max(1);
    let per_page = per_page.unwrap_or(20).min(100).max(1);
    (page, per_page)
}

pub fn calc_offset(page: i64, per_page: i64) -> i64 {
    (page - 1) * per_page
}

pub fn success_response<T: serde::Serialize>(data: T) -> axum::Json<serde_json::Value> {
    axum::Json(serde_json::json!({
        "success": true,
        "data": data
    }))
}

pub fn success_message(message: &str) -> axum::Json<serde_json::Value> {
    axum::Json(serde_json::json!({
        "success": true,
        "message": message
    }))
}
