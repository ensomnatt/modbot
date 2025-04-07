import db from "../database/database";

export interface User {
  userID: number;
  banned: boolean;
  bannedWhy: string | null;
  banPeriod: number | null;
  muted: boolean;
  mutedWhy: string | null;
  mutePeriod: number | null;
  warns: number;
}

interface UserData {
  user_id: number | null;
  banned: number;
  banned_why: string | null;
  ban_period: number | null;
  muted: number;
  muted_why: string | null;
  mute_period: number | null;
  warns: number;
}

export class UsersModel {
  async add(userID: number) {
    try {
      db.prepare("INSERT INTO users (user_id) VALUES (?)").run(userID);
      console.log(`добавлен новый пользователь: ${userID}`);
    } catch (error) {
      console.error(`ошибка при добавлении пользователя: ${error}`);
    }
  }

  async getUser(userID: number): Promise<User | null> {
    try {
      const userRaw = await db.prepare("SELECT * FROM users WHERE user_id = ?").get(userID) as UserData;
      if (!userRaw.user_id) throw new Error("userID is null");

      let user: User = {
        userID: userRaw.user_id,
        banned: false,
        bannedWhy: userRaw.banned_why,
        banPeriod: userRaw.ban_period,
        muted: false,
        mutedWhy: userRaw.muted_why,
        mutePeriod: userRaw.mute_period,
        warns: userRaw.warns,
      }

      return user;
    } catch (error) {
      console.error(`ошибка при получении информации о пользователе: ${error}`);
      return null;
    }
  }

  async getUsers(): Promise<User[] | null> {
    try {
      const usersRaw = db.prepare("SELECT * FROM users").all() as UserData[];
      let users: User[] = [];
      for (const userRaw of usersRaw) {
        if (!userRaw.user_id) throw new Error("userID is null");

        let user: User = {
          userID: userRaw.user_id,
          banned: false,
          bannedWhy: userRaw.banned_why,
          banPeriod: userRaw.ban_period,
          muted: false,
          mutedWhy: userRaw.muted_why,
          mutePeriod: userRaw.mute_period,
          warns: userRaw.warns,
        }

        if (userRaw.banned) user.banned = true;
        if (userRaw.muted) user.muted = true;
        
        users.push(user);
      }

      return users;
    } catch (error) {
      console.error(`ошибка при получении всех пользователей: ${error}`);
      return null;
    }
  }

  async checkIfUserExists(userID: number): Promise<boolean | null> {
    try {
      const result = db.prepare("SELECT COUNT(*) AS count FROM users WHERE user_id = ?").get(userID) as { count: number };
      return result.count > 0;
    } catch (error) {
      console.error(`ошибка при проверке на наличие пользователя в бд: ${error}`);
      return null;
    }
  }

  async ban(userID: number, why?: string, end?: number) {
    try {
      if (why && end) {
        db.prepare("UPDATE users SET banned = 1, banned_why = ?,ban_end = ? WHERE user_id = ?").run(why, end, userID);
        console.log(`забанен пользователь ${userID} по причине ${why} до ${end}`);
      } else if (why) {
        db.prepare("UPDATE users SET banned = 1, banned_why = ?, ban_end = 0 WHERE user_id = ?").run(why, userID);
        console.log(`забанен пользователь ${userID} по причине ${why} навсегда`);
      } else if (end) {
        db.prepare("UPDATE users SET banned = 1, ban_end = ? WHERE user_id = ?").run(end, userID);
        console.log(`забанен пользователь ${userID} без причины до ${end}`);
      } else {
        db.prepare("UPDATE users SET banned = 1, ban_end = 0 WHERE user_id = ?").run(userID);
        console.log(`забанен пользователь ${userID} без причины навсегда`)
      }
    } catch (error) {
      console.error(`ошибка при бане пользователя: ${error}`);
    }
  }

  async mute(userID: number, why?: string, end?: string) {
    try {
      if (why && end) {
        db.prepare("UPDATE users SET muted = 1, muted_why = ?, mute_end = ? WHERE user_id = ?").run(why, end, userID);
        console.log(`замучен пользователь ${userID} по причине ${why} до ${end}`);
      } else if (why) {
        db.prepare("UPDATE users SET muted = 1, muted_why = ?, mute_end = 0 WHERE user_id = ?").run(why, userID);
        console.log(`замучен пользователь ${userID} по причине ${why} навсегда`);
      } else if (end) {
        db.prepare("UPDATE users SET muted = 1, mute_end = ? WHERE user_id = ?").run(end, userID);
        console.log(`замучен пользователь ${userID} без причины до ${end}`);
      } else {
        db.prepare("UPDATE users SET muted = 1, mute_end = 0 WHERE user_id = ?").run(userID);
        console.log(`замучен пользователь ${userID} без причины навсегда`);
      }
    } catch (error) {
      console.error(`ошибка при муте пользователя: ${error}`);
    }
  }

  async warn(userID: number, warns: number, why?: string, end?: number) {
    db.prepare("UPDATE users SET warns = ? WHERE user_id = ?").run(warns, userID);

    db.prepare(`ALTER TABLE users ADD COLUMN warn_${warns} INTEGER`).run();
    db.prepare(`ALTER TABLE users ADD COLUMN warn_${warns}_why TEXT`).run();
    db.prepare(`ALTER TABLE users ADD COLUMN warn_${warns}_end INTEGER`).run();

    db.prepare(`UPDATE users SET warn_${warns} = 1`).run();

    if (why) {
      db.prepare(`UPDATE users SET warn_${warns}_why = ?, warn_${warns}_end = ? WHERE user_id = ?`).run(why, end, userID);
      if (!end) {
        console.log(`пользователю ${userID} был выдан варн по причине ${why} навсегда`);
      } else {
        console.log(`пользователю ${userID} был выдан варн по причине ${why} до ${end}`);
      }
    } else {
      db.prepare(`UPDATE users SET warn_${warns}_end = ? WHERE user_id = ?`).run(end, userID);
      if (!end) {
        console.log(`пользователю ${userID} был выдан варн без причины навсегда`);
      } else {
        console.log(`пользователю ${userID} был выдан варн без причины до ${end}`);
      }
    }
  }

  async unBan(userID: number) {
    try {
      db.prepare("UPDATE users SET banned = 0, banned_why = NULL, ban_period = NULL WHERE user_id = ?").run(userID);
      console.log(`пользователь ${userID} был разбанен`);
    } catch (error) {
      console.error(`ошибка при разбане пользователя: ${error}`);
    }
  }

  async unMute(userID: number) {
    try {
      db.prepare("UPDATE users SET muted = 0, muted_why = NULL, mute_period = NULL WHERE user_id = ?").run(userID);
      console.log(`пользователь ${userID} был размучен`);
    } catch (error) {
      console.error(`ошибка при размуте пользователя: ${error}`);
    }
  }

  async unWarn(userID: number, warnNumber: number, warns: number) {
    try {
      if (!warnNumber) {
        for (let i = 1; i <= warns; i++) {
          db.prepare(`UPDATE users SET warn_${i} = 0, warn_${i}_why = NULL, warn_${i}_period = NULL WHERE user_id = ?`).run(userID);
        }

        console.log(`с пользователя ${userID} были сняты все варны`);
      } else {
        db.prepare(`UPDATE users SET warn_${warns} = 0, warn_${warns}_why = NULL, warn_${warns}_period = NULL WHERE user_id = ?`).run(userID);
        
        console.log(`с пользователя ${userID} был снят варн под номером ${warns}`);
      }
    } catch (error) {
      console.error(`ошибка при снятии варна: ${error}`);
    }
  }
}
