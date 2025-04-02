import db from "../database/database";

//костыль для получения инфы о варнах
interface warnData {
  warns: number,
  warns_why: string
}

class Model {
  async chat(chatID: number) {
    try {
      db.prepare("INSERT INTO chat (chat_id) VALUES (?)").run(chatID);
      console.log(`добавлена информация о чате: ${chatID}`);
    } catch (error) {
      console.error(`ошибка при попытке добавить информацию о чате: ${chatID}`);
    }
  }

  async add(userID: number) {
    try {
      db.prepare("INSERT INTO users (user_id) VALUES (?)").run(userID);
      console.log(`добавлен новый пользователь: ${userID}`);
    } catch (error) {
      console.error(`ошибка при добавлении пользователя: ${error}`);
    }
  }

  async ban(userID: number, why?: string, period?: string) {
    try {
      if (!why && !period) {
        db.prepare("UPDATE users SET banned = 1, ban_period = 0 WHERE user_id = ?").run(userID);
        console.log(`забанен пользователь ${userID} без причины навсегда`);
      } else if (why) {
        db.prepare("UPDATE users SET banned = 1, banned_why = ?, ban_period = 0 WHERE user_id = ?").run(why, userID);
        console.log(`забанен пользователь ${userID} по причине ${why} навсегда`);
      } else if (period) {
        db.prepare("UPDATE users SET banned = 1, ban_period = ? WHERE user_id = ?").run(period, userID);
        console.log(`забанен пользователь ${userID} без причины на ${period}`);
      } else {
        db.prepare("UPDATE users SET banned = 1, banned_why = ?, ban_period = ? WHERE user_id = ?").run(why, period, userID);
        console.log(`забанен пользователь ${userID} по причине ${why} на ${period}`)
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

  async getWarns(userID: number): Promise<[number, string]> {
    try {
      const rawData = await db.prepare("SELECT (warns, warns_why) FROM users WHERE user_id = ?").get(userID) as warnData;

      console.log(`получена информация о варнах пользователя ${userID}`);
      return [rawData.warns, rawData.warns_why]
    } catch (error) {
      console.log(`ошибка при получении информации о варнах: ${error}`);
      return [0, ""];
    }
  }
} 
