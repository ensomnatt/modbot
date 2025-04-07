import db from "../database/database";

export interface Metric {
  userID: number;
  username: string;
}

interface MetricData {
  user_id: number;
  username: string;
}

export class MetricsModel {
  async add(metric: Metric) {
    try {
      db.prepare("INSERT INTO metrics (user_id, username) VALUES (?, ?)").run(metric.userID, metric.username);
      console.log(`добавлена новая метрика: ${metric.userID} ${metric.username}`);
    } catch (error) {
      console.error(`ошибка при добавлении новой метрики: ${error}`);
    }
  }

  async isExists(userID: number): Promise<boolean | null> {
    try {
      const result = await db.prepare("SELECT COUNT(*) AS count FROM metrics WHERE user_id = ?").get(userID) as {count: number};
      return result.count > 0;
    } catch (error) {
      console.error(`ошибка при проверке на наличие метрики: ${error}`);
      return null;
    }
  }

  async getMetrics(): Promise<Metric[] | null> {
    try {
      const metricsRaw = db.prepare("SELECT * FROM metrics").all() as MetricData[];
      let metrics: Metric[] = [];

      for (const metricRaw of metricsRaw) {
        const metric: Metric = {
          userID: metricRaw.user_id,
          username: metricRaw.username
        }

        metrics.push(metric);
      }

      return metrics;
    } catch (error) {
      console.error(`ошибка при получении всех метрик: ${error}`);
      return null;
    }
  }

  async getUserID(username: string): Promise<number | null> {
    try {
      const result = await db.prepare("SELECT user_id FROM metrics WHERE username = ?").get(username) as {user_id: number};

      if (result) {
        console.log(`получен айди по юзернейму: ${result.user_id}, ${username}`);
        return result.user_id;
      } else {
        console.log(`не найдено айди по юзернейму ${username}`);
        return 0;
      }
    } catch (error) {
      console.error(`ошибка при получении айди по юзернейму: ${error}`);
      return null;
    }
  }

  async updateUsername(userID: number, newUsername: string) {
    try {
      db.prepare("UPDATE metrics SET username = ? WHERE user_id = ?").run(newUsername, userID);
      console.log(`юзернейм пользователя ${userID} был изменен на ${newUsername}`);
    } catch (error) {
      console.error(`ошибка при обновлении юзернейма пользователя: ${error}`);
    }
  }
}
