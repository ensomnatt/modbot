import Database from "better-sqlite3";

const db = new Database("src/database/modBot.db");

db.prepare(`CREATE TABLE IF NOT EXISTS chat (
  chat_id INTEGER DEFAULT NULL,
  warns_max INTEGER DEFAULT 3,
  warns_period INTEGER DEFAULT 0,
  time_zone TEXT DEFAULT 'Europe/Moscow',
  code TEXT DEFAULT NULL
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS users (
  user_id INTEGER NOT NULL,
  banned INTEGER DEFAULT 0,
  banned_why TEXT,
  ban_period INTEGER DEFAULT NULL,
  muted INTEGER DEFAULT 0,
  muted_why TEXT DEFAULT NULL,
  mute_period INTEGER DEFAULT NULL,
  warns INTEGER DEFAULT 0,
  warns_why TEXT DEFAULT NULL
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS statistics (
  bans INTEGER DEFAULT 0,
  kicks INTEGER DEFAULT 0,
  mutes INTEGER DEFAULT 0,
  warns INTEGER DEFAULT 0
)`).run();

console.log("инициализирована база данных");

export default db;
