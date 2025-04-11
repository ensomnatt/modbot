import db from "../database/database";

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
      console.log("статистика обновлена");
    } catch (error) {
      console.error(`ошибка при обновлении статистики: ${error}`);
    }
  }

  async getStatistics(): Promise<Statistics | null> {
    try {
      const statistics = (await db
        .prepare("SELECT * FROM statistics")
        .get()) as Statistics;
      console.log("получена статистика чата");
      return statistics;
    } catch (error) {
      console.error(`ошибка при получении статистики: ${error}`);
      return null;
    }
  }
}
