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
  warnsPeriod: number[] | null;
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
  warns_period: string | null;
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
        warnsWhy: userRaw.warns_why?.split(",") || null,
        warnsPeriod: null
      }

      if (!userRaw.warns_period?.length) {
        user.warnsPeriod = null;
        return user;
      }

      for (const warnPeriod of userRaw.warns_period) {
        user.warnsPeriod?.push(parseInt(warnPeriod, 10));
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
          warnsWhy: userRaw.warns_why?.split(",") || null,
          warnsPeriod: null,
        }

        if (userRaw.banned) user.banned = true;
        if (userRaw.muted) user.muted = true;

        
        if (!userRaw.warns_period?.length) {
          user.warnsPeriod = null;
          continue;
        }

        for (const warnPeriod of userRaw.warns_period) {
          user.warnsPeriod?.push(parseInt(warnPeriod, 10));
        }

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

  async warn(userID: number, warnsCount: number, why?: string, period?: number) {
    try {
      const user = await this.getUser(userID);
      if (!user) throw new Error("user is null");

      if (why) {
        if (!user.warnsWhy) {
          const warnsWhy = [why]
          user.warnsWhy = warnsWhy;
        }

        user.warnsWhy[user.warnsWhy.length-1] += ",";
        user.warnsWhy.push(why);
      }

      let warnsPeriodStr: string[] = [];

      if (period) {
        if (!user.warnsPeriod) {
          const warnsPeriod = [period];
          user.warnsPeriod = warnsPeriod;
        }

        for (let warnPeriod of user.warnsPeriod) {
          let warnPeriodStr = warnPeriod.toString();
          warnPeriodStr += ",";
          warnsPeriodStr.push(warnPeriodStr);
        }

        warnsPeriodStr.push(period.toString());
      }

      if (why && period) {
        db.prepare("UPDATE users SET warns = ?, warns_why = ?, warns_period = ? WHERE user_id = ?").run(warnsCount, user.warnsWhy, warnsPeriodStr, userID);
        console.log(`выдан варн пользователю ${userID} на ${period} по причине ${why}`);
      } else if (why) {
        db.prepare("UPDATE users SET warns = ?, warns_why = ? WHERE user_id = ?").run(warnsCount, user.warnsWhy, userID);
        console.log(`выдан варн пользователю ${userID} по причине ${why}`)
      } else if (period) {
        db.prepare("UPDATE users SET warns = ?, warns_period = ? WHERE user_id = ?").run(warnsCount, warnsPeriodStr);
        console.log(`выдан варн пользователю @${userID} без причины на ${period}`);
      } else {
        db.prepare("UPDATE users SET warns = ? WHERE user_id = ?").run(warnsCount, userID);
        console.log(`выдан варн пользователю @${userID} без причины`);
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
      const user = await this.getUser(userID);
      if (!user) throw new Error("user if null");
      if (user.warnsWhy?.length) {
        const newWarnsWhy = user.warnsWhy.slice(1);
        db.prepare("UPDATE users SET warns = warns - 1, warns_why = ? WHERE user_id = ?").run(newWarnsWhy, userID);
      } else {
        db.prepare("UPDATE users SET warns = warns - 1 WHERE user_id = ?").run(userID);
      }

      console.log(`пользователю ${userID} был снят варн`);
    } catch (error) {
      console.error(`ошибка при снятии варна с пользователя: ${error}`);
    }
  }
}
