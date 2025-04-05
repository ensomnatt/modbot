import { ChatModel } from "../models/chatModel";
import { StatisticsModel } from "../models/statisticsModel";
import { UsersModel } from "../models/usersModel";
import { Context } from "telegraf";
import ParseUtils from "../utils/parseUtils";
import DateUtils from "../utils/dateUtils";
import View from "../view/view";

class ModerationController {
  private chatModel: ChatModel;
  private usersModel: UsersModel;
  private statisticsModel: StatisticsModel;
  private dateUtils: DateUtils;

  constructor() {
    this.chatModel = new ChatModel();
    this.usersModel = new UsersModel();
    this.statisticsModel = new StatisticsModel();
    this.dateUtils = new DateUtils("");
  }

  async initialize() {
    const chat = await this.chatModel.chatInfo();
    this.dateUtils = new DateUtils(chat?.timeZone || "");
  }

  async ban(ctx: Context) {
    try {
      console.log(`пользователь @${ctx.from?.username} вызвал команду /ban`);
      let replyMessage;
      let text;
      if (ctx.message) {
        if ("reply_to_message" in ctx.message) replyMessage = ctx.message.reply_to_message;
        if ("text" in ctx.message) text = ctx.message.text;
      }

      if (text === undefined) throw new Error("text is undefined");
      
      if (replyMessage) {
        const username = replyMessage.from?.username;
        const userID = replyMessage.from?.id;

        if (username === undefined) throw new Error("username is undefined");
        if (userID === undefined) throw new Error("userID is undefined");

        let period = await ParseUtils.parseDuration(text);
        const periodStr = period.join(" ");
        const why = text.split(" ").slice(1).join(" ").replace(periodStr, "").trim();
        let banPeriod;
        if (period.length !== 0) {
          banPeriod = await this.dateUtils.getDuration(period)
        } else {
          banPeriod = 0;
        }

        await this.statisticsModel.updateStatistics("bans");
        if (why && banPeriod) {
          await this.usersModel.ban(userID, why, banPeriod);
          await View.banMessage(ctx, username);
        } else if (why) {
          await this.usersModel.ban(userID, why, undefined);
          await View.banMessage(ctx, username);
        } else if (banPeriod) {
          await this.usersModel.ban(userID, undefined, banPeriod);
          await View.banMessage(ctx, username);
        } else {
          await this.usersModel.ban(userID, undefined, undefined);
          await View.banMessage(ctx, username);
        }
      }
    } catch (error) {
      console.error(`ошибка при вызове команды /ban: ${error}`);
    }
  }
}

export default ModerationController;
