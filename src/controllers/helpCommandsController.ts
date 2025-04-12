import { Context } from "telegraf";
import View from "../view/view";
import { ChatModel } from "../models/chatModel";
import { StatisticsModel } from "../models/statisticsModel";
import DateUtils from "../utils/dateUtils";
import { UsersModel } from "../models/usersModel";
import { MetricsModel } from "../models/metricsModel";

class HelpCommandsController {
  private chatModel: ChatModel;
  private statisticsModel: StatisticsModel;
  private usersModel: UsersModel;
  private metricsModel: MetricsModel;
  private dateUtils: DateUtils;

  constructor() {
    this.chatModel = new ChatModel();
    this.statisticsModel = new StatisticsModel();
    this.usersModel = new UsersModel();
    this.metricsModel = new MetricsModel();
    this.dateUtils = new DateUtils("");
  }

  async initialize() {
    const chat = await this.chatModel.chatInfo();
    this.dateUtils = new DateUtils(chat?.timeZone || "");
  }

  async help(ctx: Context) {
    await View.helpMessage(ctx);
  }

  async settings(ctx: Context) {
    try {
      console.log(
        `пользователь @${ctx.from?.username} вызвал команду /settings`,
      );
      const chat = await this.chatModel.chatInfo();
      if (chat === null) throw new Error("chat is null");
      if (chat.warnsMax === null) throw new Error("warnsMax is null");
      if (chat.warnsPeriod === null) throw new Error("warnsPeriod is null");
      let parsedWarnsPeriod: string = chat.warnsPeriod.toString();
      if (chat.warnsPeriod === 0) {
        parsedWarnsPeriod = "бесконечно";
      } else {
        parsedWarnsPeriod = await this.dateUtils.UNIXToString(chat.warnsPeriod);
      }

      await View.settingsMessage(ctx, chat.warnsMax, parsedWarnsPeriod);
    } catch (error) {
      console.error(`ошибка при вызове команды /settings: ${error}`);
    }
  }

  async statistics(ctx: Context) {
    try {
      console.log(
        `пользователь ${ctx.from?.username} вызвал команду /statistics`,
      );
      const statistics = await this.statisticsModel.getStatistics();
      if (statistics === null) throw new Error("statistics is null");

      await View.statisticsMessage(
        ctx,
        statistics.bans,
        statistics.kicks,
        statistics.mutes,
        statistics.warns,
      );
    } catch (error) {
      console.error(`ошибка при вызове команды /statistics: ${error}`);
    }
  }

  async bans(ctx: Context) {
    try {
      console.log(`пользователь ${ctx.from?.username} ввел команду /bans`);
      const users = await this.usersModel.getUsers();
      if (!users) throw new Error("users is null");

      let message = "";
      for (const user of users) {
        if (!user.banned) continue;
        if (user.banEnd === null) throw new Error("user's banEnd is null"); 
        
        let bannedWhy: string | null = user.bannedWhy;
        let banEnd: string | number = user.banEnd;
        if (user.banEnd === 0) {
          banEnd = "навсегда";
        } else {
          banEnd = await this.dateUtils.UNIXToDate(banEnd);
        }
        if (user.bannedWhy === null) bannedWhy = "без причины";

        let username: string | null = "@" + await this.metricsModel.getUsername(user.userID);
        if (!username || username === "@") username = user.userID.toString();

        message += `${username} | ${bannedWhy} | ${banEnd}\n`;
      }

      if (!message) message = "не найдено незабаненных пользователей";

      await View.bans(ctx, message);
    } catch (error) {
      console.error(`ошибка при вызове команды /bans: ${error}`);
    }
  }
}

export default HelpCommandsController;
