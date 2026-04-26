// mod commands;
// mod db;

// use db::init::get_migrations;
// use sqlx::SqlitePool;
// use tauri::Manager;

// pub struct AppState {
//     pub db: SqlitePool,
// }

// #[cfg_attr(mobile, tauri::mobile_entry_point)]
// pub fn run() {
//     tauri::Builder::default()
//         .plugin(
//             tauri_plugin_sql::Builder::default()
//                 .add_migrations("sqlite:devkit.db", get_migrations())
//                 .build(),
//         )
//         .plugin(tauri_plugin_store::Builder::default().build())
//         .plugin(tauri_plugin_http::init())
//         .setup(|app| {
//             let app_dir = app.path().app_data_dir()
//                 .expect("Could not get app data dir");
//             std::fs::create_dir_all(&app_dir)?;
//             let db_path = format!(
//                 "sqlite:{}/devkit.db?mode=rwc",
//                 app_dir.display()
//             );
//             let pool = tauri::async_runtime::block_on(async {
//                 SqlitePool::connect(&db_path)
//                     .await
//                     .expect("Failed to connect to SQLite")
//             });
//             app.manage(AppState { db: pool });
//             Ok(())
//         })
//         .invoke_handler(tauri::generate_handler![
//             commands::auth::signup,
//             commands::auth::login,
//         ])
//         .run(tauri::generate_context!())
//         .expect("error while running tauri application");
// }









mod commands;
mod db;

use db::init::get_migrations;
use sqlx::sqlite::SqlitePoolOptions;
use tauri::Manager;

pub struct AppState {
    pub db: sqlx::SqlitePool,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:devkit.db", get_migrations())
                .build(),
        )
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_oauth::init())
        .setup(|app| {
            let app_dir = app.path().app_data_dir()
                .expect("Could not get app data dir");
            std::fs::create_dir_all(&app_dir)?;

            let db_path = app_dir.join("devkit.db");
            let db_url = format!("sqlite:{}?mode=rwc", db_path.display());

            tauri::async_runtime::block_on(async {
                // Run migrations first via tauri-plugin-sql
                // Then connect sqlx to the same file
                let pool = SqlitePoolOptions::new()
                    .max_connections(5)
                    .connect(&db_url)
                    .await
                    .expect("Failed to connect to SQLite");

                // Enable WAL mode and disable FK constraints for compatibility
                sqlx::query("PRAGMA foreign_keys = OFF")
                    .execute(&pool)
                    .await
                    .expect("Failed to set pragma");

                sqlx::query("PRAGMA journal_mode = WAL")
                    .execute(&pool)
                    .await
                    .expect("Failed to set WAL mode");

                // Run schema manually since migrations may not have fired yet
                sqlx::query(
                    "CREATE TABLE IF NOT EXISTS users (
                        id            INTEGER PRIMARY KEY AUTOINCREMENT,
                        username      TEXT UNIQUE NOT NULL,
                        password_hash TEXT NOT NULL,
                        created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
                    )"
                ).execute(&pool).await.expect("Failed to create users table");

                sqlx::query(
                    "CREATE TABLE IF NOT EXISTS dsa_questions (
                        id         INTEGER PRIMARY KEY AUTOINCREMENT,
                        title      TEXT NOT NULL,
                        topic      TEXT NOT NULL,
                        difficulty TEXT NOT NULL,
                        link       TEXT,
                        notes      TEXT,
                        companies  TEXT DEFAULT ''
                    )"
                ).execute(&pool).await.expect("Failed to create dsa_questions table");

                // Add companies column if upgrading from an older schema
                let has_companies: i64 = sqlx::query_scalar(
                    "SELECT COUNT(*) FROM pragma_table_info('dsa_questions') WHERE name = 'companies'"
                )
                .fetch_one(&pool)
                .await
                .unwrap_or(0);
                if has_companies == 0 {
                    sqlx::query("ALTER TABLE dsa_questions ADD COLUMN companies TEXT DEFAULT ''")
                        .execute(&pool)
                        .await
                        .expect("Failed to add companies column");
                }

                sqlx::query(
                    "CREATE TABLE IF NOT EXISTS dsa_progress (
                        id          INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id     INTEGER REFERENCES users(id),
                        question_id INTEGER REFERENCES dsa_questions(id),
                        status      TEXT DEFAULT 'todo',
                        user_notes  TEXT,
                        solved_at   DATETIME,
                        updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE(user_id, question_id)
                    )"
                ).execute(&pool).await.expect("Failed to create dsa_progress table");

                sqlx::query(
                    "CREATE TABLE IF NOT EXISTS prompts (
                        id           INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id      INTEGER REFERENCES users(id),
                        title        TEXT NOT NULL,
                        body         TEXT NOT NULL,
                        tags         TEXT,
                        model_target TEXT DEFAULT 'Any',
                        created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
                    )"
                ).execute(&pool).await.expect("Failed to create prompts table");

                sqlx::query(
                    "CREATE TABLE IF NOT EXISTS weekly_plans (
                        id         INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id    INTEGER REFERENCES users(id),
                        week_start DATE NOT NULL,
                        plan_json  TEXT NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )"
                ).execute(&pool).await.expect("Failed to create weekly_plans table");

                sqlx::query(
                    "CREATE TABLE IF NOT EXISTS finances (
                        id            INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id       INTEGER REFERENCES users(id) UNIQUE,
                        stipend       REAL DEFAULT 0,
                        rent          REAL DEFAULT 0,
                        food          REAL DEFAULT 0,
                        transport     REAL DEFAULT 0,
                        subscriptions REAL DEFAULT 0,
                        misc          REAL DEFAULT 0,
                        savings_goal  REAL DEFAULT 0,
                        target_date   DATE,
                        currency      TEXT DEFAULT '₹',
                        updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
                    )"
                ).execute(&pool).await.expect("Failed to create finances table");

                sqlx::query(
                    "CREATE TABLE IF NOT EXISTS finance_transactions (
                        id         INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id    INTEGER REFERENCES users(id),
                        amount     REAL NOT NULL,
                        category   TEXT NOT NULL,
                        note       TEXT DEFAULT '',
                        date       DATE NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )"
                ).execute(&pool).await.expect("Failed to create finance_transactions table");

                sqlx::query(
                    "CREATE TABLE IF NOT EXISTS finance_snapshots (
                        id                  INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id             INTEGER REFERENCES users(id),
                        month               TEXT NOT NULL,
                        total_spent         REAL DEFAULT 0,
                        total_saved         REAL DEFAULT 0,
                        actual_by_category  TEXT DEFAULT '{}',
                        created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE(user_id, month)
                    )"
                ).execute(&pool).await.expect("Failed to create finance_snapshots table");

                sqlx::query(
                    "CREATE TABLE IF NOT EXISTS planner_topics (
                        id          INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id     INTEGER REFERENCES users(id),
                        title       TEXT NOT NULL,
                        order_index INTEGER DEFAULT 0,
                        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
                    )"
                ).execute(&pool).await.expect("Failed to create planner_topics");

                sqlx::query(
                    "CREATE TABLE IF NOT EXISTS planner_subtopics (
                        id            INTEGER PRIMARY KEY AUTOINCREMENT,
                        topic_id      INTEGER REFERENCES planner_topics(id) ON DELETE CASCADE,
                        user_id       INTEGER REFERENCES users(id),
                        label         TEXT NOT NULL,
                        timestamp_raw TEXT DEFAULT '',
                        order_index   INTEGER DEFAULT 0,
                        is_done       INTEGER DEFAULT 0,
                        done_at       DATETIME,
                        created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
                    )"
                ).execute(&pool).await.expect("Failed to create planner_subtopics");

                sqlx::query(
                    "CREATE TABLE IF NOT EXISTS planner_week_plans (
                        id           INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id      INTEGER REFERENCES users(id),
                        week_start   DATE NOT NULL,
                        plan_json    TEXT NOT NULL,
                        generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE(user_id, week_start)
                    )"
                ).execute(&pool).await.expect("Failed to create planner_week_plans");

                sqlx::query(
                    "CREATE TABLE IF NOT EXISTS question_notes (
                        id          INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id     INTEGER REFERENCES users(id),
                        question_id INTEGER REFERENCES dsa_questions(id),
                        content     TEXT NOT NULL,
                        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
                    )"
                ).execute(&pool).await.expect("Failed to create question_notes");

                app.manage(AppState { db: pool });
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::auth::signup,
            commands::auth::login,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}