use bcrypt::{hash, verify, DEFAULT_COST};
use serde::{Deserialize, Serialize};
use sqlx::Row;
use tauri::State;
use crate::AppState;

#[derive(Serialize, Deserialize, Debug)]
pub struct UserResponse {
    pub id: i64,
    pub username: String,
    pub created_at: String,
}

#[tauri::command]
pub async fn signup(
    username: String,
    password: String,
    state: State<'_, AppState>,
) -> Result<UserResponse, String> {
    if username.trim().is_empty() || password.trim().is_empty() {
        return Err("Username and password cannot be empty".into());
    }
    if password.len() < 6 {
        return Err("Password must be at least 6 characters".into());
    }

    let password_hash = hash(password, DEFAULT_COST)
        .map_err(|e| format!("Hash error: {}", e))?;

    let result = sqlx::query(
        "INSERT INTO users (username, password_hash) VALUES (?, ?)"
    )
    .bind(&username)
    .bind(&password_hash)
    .execute(&state.db)
    .await
    .map_err(|e| {
        if e.to_string().contains("UNIQUE") {
            "Username already taken".to_string()
        } else {
            format!("DB error: {}", e)
        }
    })?;

    let row = sqlx::query(
        "SELECT id, username, created_at FROM users WHERE id = ?"
    )
    .bind(result.last_insert_rowid())
    .fetch_one(&state.db)
    .await
    .map_err(|e| format!("DB error: {}", e))?;

    Ok(UserResponse {
        id: row.get("id"),
        username: row.get("username"),
        created_at: row.get::<Option<String>, _>("created_at")
            .unwrap_or_default(),
    })
}

#[tauri::command]
pub async fn login(
    username: String,
    password: String,
    state: State<'_, AppState>,
) -> Result<UserResponse, String> {
    let row = sqlx::query(
        "SELECT id, username, password_hash, created_at FROM users WHERE username = ?"
    )
    .bind(&username)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| format!("DB error: {}", e))?
    .ok_or("Invalid username or password")?;

    let stored_hash: String = row.get("password_hash");
    let valid = verify(password, &stored_hash)
        .map_err(|e| format!("Verify error: {}", e))?;

    if !valid {
        return Err("Invalid username or password".into());
    }

    Ok(UserResponse {
        id: row.get("id"),
        username: row.get("username"),
        created_at: row.get::<Option<String>, _>("created_at")
            .unwrap_or_default(),
    })
}