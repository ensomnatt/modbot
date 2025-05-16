import db from "../database/database";
import logger from "../logs/logs";

export interface Statistics {
  bans: number;
  kicks: number;
  mutes: number;
  warns: number;
}

export class StatisticsModel {
  async updateStatistics(column: string) {
    try {
      db.prepare(`UPDATE statistics SET ${column} = ${column} + 1`).run();
      logger.info("статистика обновлена");
    } catch (error) {
      logger.error(`ошибка при обновлении статистики: ${error}`);
    }
  }

  async getStatistics(): Promise<Statistics | null> {
    try {
      const statistics = (await db
        .prepare("SELECT * FROM statistics")
        .get()) as Statistics;
      logger.info("получена статистика чата");
      return statistics;
    } catch (error) {
      logger.error(`ошибка при получении статистики: ${error}`);
      return null;
    }
  }
}
