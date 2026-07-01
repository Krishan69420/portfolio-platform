use bcrypt::verify;

pub fn verify_password(
    password: &str,
    hash: &str,
) -> bool {
    verify(password, hash).unwrap_or(false)
}