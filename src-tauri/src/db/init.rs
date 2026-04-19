use tauri_plugin_sql::{Migration, MigrationKind};

pub fn get_migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create_users_table",
            sql: "
                CREATE TABLE IF NOT EXISTS users (
                    id            INTEGER PRIMARY KEY AUTOINCREMENT,
                    username      TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            ",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "create_dsa_questions_table",
            sql: "
                CREATE TABLE IF NOT EXISTS dsa_questions (
                    id         INTEGER PRIMARY KEY AUTOINCREMENT,
                    title      TEXT NOT NULL,
                    topic      TEXT NOT NULL,
                    difficulty TEXT NOT NULL,
                    link       TEXT,
                    notes      TEXT
                );
            ",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "create_dsa_progress_table",
            sql: "
                CREATE TABLE IF NOT EXISTS dsa_progress (
                    id          INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id     INTEGER REFERENCES users(id),
                    question_id INTEGER REFERENCES dsa_questions(id),
                    status      TEXT DEFAULT 'todo',
                    user_notes  TEXT,
                    solved_at   DATETIME,
                    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_id, question_id)
                );
            ",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "create_prompts_table",
            sql: "
                CREATE TABLE IF NOT EXISTS prompts (
                    id           INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id      INTEGER REFERENCES users(id),
                    title        TEXT NOT NULL,
                    body         TEXT NOT NULL,
                    tags         TEXT,
                    model_target TEXT DEFAULT 'Any',
                    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            ",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "create_weekly_plans_table",
            sql: "
                CREATE TABLE IF NOT EXISTS weekly_plans (
                    id         INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id    INTEGER REFERENCES users(id),
                    week_start DATE NOT NULL,
                    plan_json  TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            ",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 6,
            description: "create_finances_table",
            sql: "
                CREATE TABLE IF NOT EXISTS finances (
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
                    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            ",
            kind: MigrationKind::Up,
        },
    ]
}