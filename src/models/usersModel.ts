import db from "../database/database";

//костыль для получения инфы о варнах
interface WarnData {
  warns: number;
  warns_why: string;
}

export interface User {
  userID: number;
  banned: boolean;
  bannedWhy: string | null;
  banPeriod: number | null;
  muted: boolean;
  mutedWhy: string | null;
  mutePeriod: number | null;
  warns: number;
  warnsWhy: string[] | null;
  warnsPeriod: number | null;
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
  warns_why: string | null;
  warns_period: number | null;
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

  async getUsers(): Promise<User[] | null> {
    try {
      const usersRaw = db.prepare("SELECT * FROM users").all() as UserData[];
      let users: User[] = [];
      for (const userRaw of usersRaw) {
        if (userRaw.user_id === null) throw new Error("userID is null");

        let user: User = {
          userID: userRaw.user_id,
          banned: false,
          bannedWhy: userRaw.banned_why,
          banPeriod: userRaw.ban_period,
          muted: false,
          mutedWhy: userRaw.muted_why,
          mutePeriod: userRaw.mute_period,
          warns: userRaw.warns,
          warnsPeriod: userRaw.warns_period,
          warnsWhy: userRaw.warns_why?.split(",") || null,
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

  async ban(userID: number, why?: string, period?: number) {
    try {
      if (why && period) {
        db.prepare("UPDATE users SET banned = 1, banned_why = ?,ban_period = ? WHERE user_id = ?").run(why, period, userID);
        console.log(`забанен пользователь ${userID} по причине ${why} на ${period}`);
      } else if (why) {
        db.prepare("UPDATE users SET banned = 1, banned_why = ?, ban_period = 0 WHERE user_id = ?").run(why, userID);
        console.log(`забанен пользователь ${userID} по причине ${why} навсегда`);
      } else if (period) {
        db.prepare("UPDATE users SET banned = 1, ban_period = ? WHERE user_id = ?").run(period, userID);
        console.log(`забанен пользователь ${userID} без причины на ${period}`);
      } else {
        db.prepare("UPDATE users SET banned = 1, ban_period = 0 WHERE user_id = ?").run(userID);
        console.log(`забанен пользователь ${userID} без причины навсегда`)
      }
    } catch (error) {
      console.error(`ошибка при бане пользователя: ${error}`);
    }
  }

  async mute(userID: number, why?: string, period?: string) {
    try {
      if (!why && !period) {
        db.prepare("UPDATE users SET muted = 1, mute_period = 0 WHERE user_id = ?").run(userID);
        console.log(`замучен пользователь ${userID} без причины навсегда`);
      } else if (why) {
        db.prepare("UPDATE users SET muted = 1, muted_why = ?, mute_period = 0 WHERE user_id = ?").run(why, userID);
        console.log(`замучен пользователь ${userID} по причине ${why} навсегда`);
      } else if (period) {
        db.prepare("UPDATE users SET muted = 1, mute_period = ? WHERE user_id = ?").run(period, userID);
        console.log(`замучен пользователь ${userID} без причины на ${period}`);
      } else {
        db.prepare("UPDATE users SET muted = 1, muted_why = ?, mute_period = ? WHERE user_id = ?").run(why, period, userID);
        console.log(`замучен пользователь ${userID} по причине ${why} на ${period}`)
      }
    } catch (error) {
      console.error(`ошибка при муте пользователя: ${error}`);
    }
  }

  async warn(userID: number, warn_count: number, why?: string) {
    try {
      if (!why) {
        db.prepare("UPDATE users SET warns = ? WHERE user_id = ?").run(warn_count, userID);
        console.log(`выдан варн пользователю ${userID} без причины`);
      } else {
        why += ","
        db.prepare("UPDATE users SET warns = ?, warns_why = ? WHERE user_id = ?").run(why, userID);
        console.log(`выдан варн пользователю ${userID} по причине ${why}`)
      }
    } catch (error) {
      console.error(`ошибка при муте пользователя: ${error}`);
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

  async unWarn(userID: number) {
    try {
      const [_warns, warnsWhy] = await this.getWarns(userID);
      if (warnsWhy === null) throw new Error("warnsWhy is null");
      if (warnsWhy !== "") {
        const newWarnsWhy = warnsWhy.split(",").slice(1).join(",");
        db.prepare("UPDATE users SET warns = warns - 1, warns_why = ? WHERE user_id = ?").run(newWarnsWhy, userID);
      } else {
        db.prepare("UPDATE users SET warns = warns - 1 WHERE user_id = ?").run(userID);
      }

      console.log(`пользователю ${userID} был снят варн`);
    } catch (error) {
      console.error(`ошибка при снятии варна с пользователя: ${error}`);
    }
  }

  async getWarns(userID: number): Promise<[number | null, string | null]> {
    try {
      const rawData = await db.prepare("SELECT (warns, warns_why) FROM users WHERE user_id = ?").get(userID) as WarnData;

      console.log(`получена информация о варнах пользователя ${userID}`);
      return [rawData.warns, rawData.warns_why]
    } catch (error) {
      console.log(`ошибка при получении информации о варнах: ${error}`);
      return [null, null];
    }
  }
}
