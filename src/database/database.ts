import Database from "better-sqlite3";

const db = new Database("src/database/modBot.db");

db.prepare(`CREATE TABLE IF NOT EXISTS chat (
  chat_id INTEGER,
  warns_max INTEGER DEFAULT 3,
  warns_period
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS users (
  user_id INTEGER NOT NULL,
  banned INTEGER DEFAULT 0,
  banned_why TEXT,
  ban_period INTEGER,
  muted INTEGER DEFAULT 0,
  muted_why TEXT,
  mute_period INTEGER,
  warns INTEGER DEFAULT 0,
  warns_why TEXT
)`).run();

console.log("инициализирована база данных");

export default db;
