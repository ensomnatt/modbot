import Database from "better-sqlite3";

const db = new Database("src/database/modBot.db");

db.prepare(`CREATE TABLE IF NOT EXISTS chat (
  chat_id INTEGER,
  warns_max INTEGER,
  warns_period INTEGER,
  time_zone TEXT,
  code TEXT
)`).run();

db.prepare("INSERT INTO chat (chat_id, warns_max, warns_period, time_zone) VALUES (0, 3, 0, ?)").run("Europe/Moscow");

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

db.prepare(`CREATE TABLE IF NOT EXISTS statistics (
  bans INTEGER,
  kicks INTEGER,
  mutes INTEGER,
  warns INTEGER
)`).run();

db.prepare("INSERT INTO statistics (bans, kicks, mutes, warns) VALUES (0, 0, 0, 0)").run();

console.log("инициализирована база данных");

export default db;
