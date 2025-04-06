import { Context } from "telegraf";
import View from "../view/view";
import { ChatModel } from "../models/chatModel";
import { StatisticsModel } from "../models/statisticsModel";
import DateUtils from "../utils/dateUtils";
import { UsersModel } from "../models/usersModel";

class HelpCommandsController {
  private chatModel: ChatModel;
  private statisticsModel: StatisticsModel;
  private usersModel: UsersModel;
  private dateUtils: DateUtils;

  constructor() {
    this.chatModel = new ChatModel();
    this.statisticsModel = new StatisticsModel();
    this.usersModel = new UsersModel();
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
      console.log(`пользователь @${ctx.from?.username} вызвал команду /settings`);
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
      console.log(`пользователь ${ctx.from?.username} вызвал команду /statistics`);
      const statistics = await this.statisticsModel.getStatistics();
      if (statistics === null) throw new Error("statistics is null");

      await View.statisticsMessage(ctx, statistics.bans, statistics.kicks, statistics.mutes, statistics.warns);
    } catch (error) {
      console.error(`ошибка при вызове команды /statistics: ${error}`);
    }
  }
}

export default HelpCommandsController;
