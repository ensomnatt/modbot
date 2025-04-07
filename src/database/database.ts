import Database from "better-sqlite3";

const db = new Database("src/database/modBot.db");

db.prepare(`CREATE TABLE IF NOT EXISTS chat (
  chat_id INTEGER,
  warns_max INTEGER,
  warns_period INTEGER,
  time_zone TEXT,
  code TEXT
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS users (
  user_id INTEGER NOT NULL,
  banned INTEGER DEFAULT 0,
  banned_why TEXT,
  ban_end INTEGER DEFAULT NULL,
  muted INTEGER DEFAULT 0,
  muted_why TEXT DEFAULT NULL,
  mute_end INTEGER DEFAULT NULL,
  warns INTEGER DEFAULT 0
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS statistics (
  bans INTEGER,
  kicks INTEGER,
  mutes INTEGER,
  warns INTEGER
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS metrics (
  user_id INTEGER NOT NULL,
  username TEXT NOT NULL
)`).run();

let result
result = db.prepare("SELECT COUNT(*) AS count FROM chat").get() as { count: number };
if (!result.count) {
  db.prepare("INSERT INTO chat (chat_id, warns_max, warns_end, time_zone, code) VALUES (NULL, 3, 0, 'Europe/Moscow', NULL)").run();
}

result = db.prepare("SELECT COUNT(*) AS count FROM statistics").get() as { count: number };
if (!result.count) {
  db.prepare("INSERT INTO statistics (bans, kicks, mutes, warns) VALUES (0, 0, 0, 0)").run();
}

console.log("инициализирована база данных");

export default db;
