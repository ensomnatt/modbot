import db from "../database/database";
import logger from "../logs/logs";

export interface User {
  userID: number;
  banned: boolean;
  bannedWhy: string | null;
  banEnd: number | null;
  muted: boolean;
  mutedWhy: string | null;
  muteEnd: number | null;
  warns: number;
}

interface UserData {
  user_id: number | null;
  banned: number;
  banned_why: string | null;
  ban_end: number | null;
  muted: number;
  muted_why: string | null;
  mute_end: number | null;
  warns: number;
}

export interface Warn {
  reason: string;
  end: number;
}

export class UsersModel {
  async add(userID: number) {
    try {
      db.prepare("INSERT INTO users (user_id) VALUES (?)").run(userID);
      logger.info(`добавлен новый пользователь: ${userID}`);
    } catch (error) {
      logger.error(`ошибка при добавлении пользователя: ${error}`);
    }
  }

  async getUser(userID: number): Promise<User | null> {
    try {
      const userRaw = (await db
        .prepare("SELECT * FROM users WHERE user_id = ?")
        .get(userID)) as UserData;
      if (!userRaw.user_id) throw new Error("userID is null");

      const user: User = {
        userID: userRaw.user_id,
        banned: !!userRaw.banned,
        bannedWhy: userRaw.banned_why,
        banEnd: userRaw.ban_end,
        muted: !!userRaw.muted,
        mutedWhy: userRaw.muted_why,
        muteEnd: userRaw.mute_end,
        warns: userRaw.warns,
      };

      return user;
    } catch (error) {
      logger.error(`ошибка при получении информации о пользователе: ${error}`);
      return null;
    }
  }

  async getUsers(): Promise<User[] | null> {
    try {
      const usersRaw = db.prepare("SELECT * FROM users").all() as UserData[];
      const users: User[] = [];
      for (const userRaw of usersRaw) {
        if (!userRaw.user_id) throw new Error("userID is null");

        const user: User = {
          userID: userRaw.user_id,
          banned: !!userRaw.banned,
          bannedWhy: userRaw.banned_why,
          banEnd: userRaw.ban_end,
          muted: !!userRaw.muted,
          mutedWhy: userRaw.muted_why,
          muteEnd: userRaw.mute_end,
          warns: userRaw.warns,
        };

        users.push(user);
      }

      return users;
    } catch (error) {
      logger.error(`ошибка при получении всех пользователей: ${error}`);
      return null;
    }
  }

  async getMaxWarn(): Promise<number> {
    const stmt = db.prepare(`PRAGMA table_info(users)`);
    const columns = stmt.all() as { name: string }[];

    const warnNumbers = columns
      .map((col) => col.name)
      .filter((name) => /^warn_\d+$/.test(name))
      .map((name) => parseInt(name.split("_")[1], 10));

    return warnNumbers.length > 0 ? Math.max(...warnNumbers) : 0;
  }

  async getWarns(userID: number): Promise<Warn[] | null> {
    try {
      const warnsCount = await this.getMaxWarn();
      logger.info(warnsCount);
      const warns: Warn[] = [];
      for (let i = 1; i <= warnsCount; i++) {
        const warn = (await db
          .prepare(
            `SELECT warn_${i} AS status, warn_${i}_why AS why, warn_${i}_end AS end FROM users WHERE user_id = ?`,
          )
          .get(userID)) as { status: number; why: string | null; end: number };

        if (!warn.status) continue;
        warns.push({
          reason: warn.why || "",
          end: warn.end,
        });
      }

      logger.info("получены варны пользователя");
      return warns;
    } catch (error) {
      logger.error(`ошибка при взятии варнов пользователя: ${error}`);
      return null;
    }
  }

  async checkIfUserExists(userID: number): Promise<boolean | null> {
    try {
      const result = db
        .prepare("SELECT COUNT(*) AS count FROM users WHERE user_id = ?")
        .get(userID) as { count: number };
      return result.count > 0;
    } catch (error) {
      logger.error(
        `ошибка при проверке на наличие пользователя в бд: ${error}`,
      );
      return null;
    }
  }

  async checkIfColumnExists(name: string): Promise<boolean | null> {
    try {
      const columns = db.prepare(`PRAGMA table_info(users)`).all() as {
        name: string;
      }[];

      for (const column of columns) {
        if (column.name === name) return true;
      }

      return false;
    } catch (error) {
      logger.error(`ошибка при проверке на наличие колонки: ${error}`);
      return null;
    }
  }

  async ban(userID: number, why?: string, end?: number) {
    try {
      if (why && end) {
        db.prepare(
          "UPDATE users SET banned = 1, banned_why = ?,ban_end = ? WHERE user_id = ?",
        ).run(why, end, userID);
        logger.info(
          `забанен пользователь ${userID} по причине ${why} до ${end}`,
        );
      } else if (why) {
        db.prepare(
          "UPDATE users SET banned = 1, banned_why = ?, ban_end = 0 WHERE user_id = ?",
        ).run(why, userID);
        logger.info(
          `забанен пользователь ${userID} по причине ${why} навсегда`,
        );
      } else if (end) {
        db.prepare(
          "UPDATE users SET banned = 1, ban_end = ? WHERE user_id = ?",
        ).run(end, userID);
        logger.info(`забанен пользователь ${userID} без причины до ${end}`);
      } else {
        db.prepare(
          "UPDATE users SET banned = 1, ban_end = 0 WHERE user_id = ?",
        ).run(userID);
        logger.info(`забанен пользователь ${userID} без причины навсегда`);
      }
    } catch (error) {
      logger.error(`ошибка при бане пользователя: ${error}`);
    }
  }

  async mute(userID: number, why?: string, end?: number) {
    try {
      if (why && end) {
        db.prepare(
          "UPDATE users SET muted = 1, muted_why = ?, mute_end = ? WHERE user_id = ?",
        ).run(why, end, userID);
        logger.info(
          `замучен пользователь ${userID} по причине ${why} до ${end}`,
        );
      } else if (why) {
        db.prepare(
          "UPDATE users SET muted = 1, muted_why = ?, mute_end = 0 WHERE user_id = ?",
        ).run(why, userID);
        logger.info(
          `замучен пользователь ${userID} по причине ${why} навсегда`,
        );
      } else if (end) {
        db.prepare(
          "UPDATE users SET muted = 1, mute_end = ? WHERE user_id = ?",
        ).run(end, userID);
        logger.info(`замучен пользователь ${userID} без причины до ${end}`);
      } else {
        db.prepare(
          "UPDATE users SET muted = 1, mute_end = 0 WHERE user_id = ?",
        ).run(userID);
        logger.info(`замучен пользователь ${userID} без причины навсегда`);
      }
    } catch (error) {
      logger.error(`ошибка при муте пользователя: ${error}`);
    }
  }

  async warn(userID: number, warns: number, why?: string, end?: number) {
    try {
      db.prepare("UPDATE users SET warns = ? WHERE user_id = ?").run(
        warns,
        userID,
      );

      if (!(await this.checkIfColumnExists(`warn_${warns}`))) {
        db.prepare(`ALTER TABLE users ADD COLUMN warn_${warns} INTEGER`).run();
        db.prepare(`ALTER TABLE users ADD COLUMN warn_${warns}_why TEXT`).run();
        db.prepare(
          `ALTER TABLE users ADD COLUMN warn_${warns}_end INTEGER`,
        ).run();
      }

      if (await this.checkIfWarnTrue(userID, warns)) {
        for (let i = warns; i > 0; i--) {
          if (!(await this.checkIfWarnTrue(userID, i))) {
            warns = i;
            break;
          }
        }
      }

      db.prepare(`UPDATE users SET warn_${warns} = 1`).run();

      if (why) {
        db.prepare(
          `UPDATE users SET warn_${warns}_why = ?, warn_${warns}_end = ? WHERE user_id = ?`,
        ).run(why, end, userID);
        if (!end) {
          logger.info(
            `пользователю ${userID} был выдан варн по причине ${why} навсегда`,
          );
        } else {
          logger.info(
            `пользователю ${userID} был выдан варн по причине ${why} до ${end}`,
          );
        }
      } else {
        db.prepare(
          `UPDATE users SET warn_${warns}_end = ? WHERE user_id = ?`,
        ).run(end, userID);
        if (!end) {
          logger.info(
            `пользователю ${userID} был выдан варн без причины навсегда`,
          );
        } else {
          logger.info(
            `пользователю ${userID} был выдан варн без причины до ${end}`,
          );
        }
      }
    } catch (error) {
      logger.error(`ошибка при выдаче варна: ${error}`);
    }
  }

  async checkIfWarnTrue(
    userID: number,
    warnNumber: number,
  ): Promise<boolean | null> {
    try {
      const columnName = `warn_${warnNumber}`;
      const warn = (await db
        .prepare(`SELECT ${columnName} FROM users WHERE user_id = ?`)
        .get(userID)) as { [key: string]: number } | undefined;

      if (!warn) return null;

      return warn[columnName] === 1;
    } catch (error) {
      logger.error(`ошибка при проверке статуса варна: ${error}`);
      return null;
    }
  }

  async unBan(userID: number) {
    try {
      db.prepare(
        "UPDATE users SET banned = 0, banned_why = NULL, ban_end = NULL WHERE user_id = ?",
      ).run(userID);
      logger.info(`пользователь ${userID} был разбанен`);
    } catch (error) {
      logger.error(`ошибка при разбане пользователя: ${error}`);
    }
  }

  async unMute(userID: number) {
    try {
      db.prepare(
        "UPDATE users SET muted = 0, muted_why = NULL, mute_end = NULL WHERE user_id = ?",
      ).run(userID);
      logger.info(`пользователь ${userID} был размучен`);
    } catch (error) {
      logger.error(`ошибка при размуте пользователя: ${error}`);
    }
  }

  async unWarn(userID: number, warnNumber: number, warns: number) {
    try {
      if (!warnNumber) {
        const warnsCount = await this.getMaxWarn();
        for (let i = 1; i <= warnsCount; i++) {
          db.prepare(
            `UPDATE users SET warn_${i} = 0, warn_${i}_why = NULL, warn_${i}_end = NULL WHERE user_id = ?`,
          ).run(userID);
        }

        db.prepare("UPDATE users SET warns = 0 WHERE user_id = ?").run(userID);

        logger.info(`с пользователя ${userID} были сняты все варны`);
      } else {
        db.prepare(
          `UPDATE users SET warns = ?, warn_${warnNumber} = 0, warn_${warnNumber}_why = NULL, warn_${warnNumber}_end = NULL WHERE user_id = ?`,
        ).run(warns, userID);

        logger.info(
          `с пользователя ${userID} был снят варн под номером ${warnNumber}`,
        );
      }
    } catch (error) {
      logger.error(`ошибка при снятии варна: ${error}`);
    }
  }
}
