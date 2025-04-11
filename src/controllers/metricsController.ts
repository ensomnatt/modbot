import { Context } from "telegraf";
import { Metric, MetricsModel } from "../models/metricsModel";
import View from "../view/view";

class MetricsController {
  private metricsModel: MetricsModel;
  private intervalID: NodeJS.Timeout | null = null;

  constructor() {
    this.metricsModel = new MetricsModel();
  }

  async startWork(ctx: Context) {
    if (this.intervalID === null) {
      console.log("метрика была запущена");
      await View.updateMessage(ctx);

      this.intervalID = setInterval(async () => {
        await this.work(ctx);
      }, 20 * 1000);
    } else {
      await View.updateError(ctx);
    }
  }

  async work(ctx: Context) {
    const metrics = await this.metricsModel.getMetrics();
    if (!metrics) throw new Error("metrics is null");
    if (!metrics.length) return;

    for (const metric of metrics) {
      const chatMember = await ctx.getChatMember(metric.userID);
      const username = chatMember.user.username || "";

      if (username !== metric.username) {
        await this.metricsModel.updateUsername(metric.userID, username);
      }
    }
  }

  async saveMetric(ctx: Context) {
    try {
      const username = ctx.from?.username || "";
      const userID = ctx.from?.id;
      if (!userID) throw new Error("userID is undefined");

      const isExists = await this.metricsModel.isExists(userID);
      if (isExists === null) throw new Error("isExists is null");

      const metric: Metric = {
        userID: userID,
        username: username,
      };

      if (!isExists) await this.metricsModel.add(metric);
    } catch (error) {
      console.error(`ошибка при работе метрикс контроллера: ${error}`);
    }
  }
}

export default MetricsController;
