pub fn generate_slug(title: &str) -> String {
    title
        .trim()
        .to_lowercase()
        .replace(' ', "-")
}