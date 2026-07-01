use crate::errors::{AppError, AppResult};
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: String,  // user_id
    pub email: String,
    pub role: String,
    pub iat: i64,
    pub exp: i64,
    pub jti: String,  // unique token id
}

pub fn create_access_token(
    user_id: Uuid,
    email: &str,
    role: &str,
    secret: &str,
    expiry_hours: u64,
) -> AppResult<String> {
    let now = Utc::now();
    let exp = (now + Duration::hours(expiry_hours as i64)).timestamp();

    let claims = Claims {
        sub: user_id.to_string(),
        email: email.to_string(),
        role: role.to_string(),
        iat: now.timestamp(),
        exp,
        jti: Uuid::new_v4().to_string(),
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(AppError::JwtError)
}

pub fn decode_token(token: &str, secret: &str) -> AppResult<Claims> {
    let validation = Validation::new(Algorithm::HS256);
    let decoded = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &validation,
    )
    .map_err(AppError::JwtError)?;

    Ok(decoded.claims)
}

pub fn hash_password(password: &str) -> AppResult<String> {
    bcrypt::hash(password, 12)
        .map_err(|e| AppError::InternalServerError(anyhow::anyhow!("Password hashing failed: {}", e)))
}

pub fn verify_password(password: &str, hash: &str) -> AppResult<bool> {
    bcrypt::verify(password, hash)
        .map_err(|e| AppError::InternalServerError(anyhow::anyhow!("Password verification failed: {}", e)))
}

pub fn generate_refresh_token() -> String {
    use rand::Rng;
    let mut rng = rand::thread_rng();
    let bytes: Vec<u8> = (0..64).map(|_| rng.gen()).collect();
    hex::encode(bytes)
}

pub fn hash_refresh_token(token: &str) -> String {
    use sha2::{Digest, Sha256};
    let mut hasher = Sha256::new();
    hasher.update(token.as_bytes());
    hex::encode(hasher.finalize())
}
