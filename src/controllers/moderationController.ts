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

        if (userID === undefined) throw new Error("userID is undefined");

        //причина и время бана
        const {why, period} = await ParseUtils.parseBan(text, true);
        let banPeriod;
        if (period.length !== 0) {
          banPeriod = await this.dateUtils.getDuration(period);
        } else {
          banPeriod = 0;
        }

        await this.statisticsModel.updateStatistics("bans");
        if (!await this.usersModel.checkIfUserExists(userID)) await this.usersModel.add(userID);
        await this.usersModel.ban(userID, why, banPeriod);
        await ctx.banChatMember(userID);
        await View.banMessage(ctx, username || "");
      }
    } catch (error) {
      console.error(`ошибка при вызове команды /ban: ${error}`);
    }
  }

  async unBan(ctx: Context) {
    console.log(`пользователь @${ctx.from?.username} вызвал команду /unban`);
    let replyMessage;
    if (ctx.message && "reply_to_message" in ctx.message) replyMessage = ctx.message.reply_to_message;

    if (replyMessage) {
      try {
        if (ctx.chat?.type === "supergroup" || ctx.chat?.type === "channel") {
          const userID = replyMessage.from?.id;
          const username = replyMessage.from?.username;
          if (userID === undefined) throw new Error("userID is undefined");
          
          await this.usersModel.unBan(userID);
          await ctx.unbanChatMember(userID);
          await View.unBanMessage(ctx, username || "")
        } else {
          await View.gropError(ctx);
        }
      } catch (error) {
        console.error(`ошибка при вызове команды /unban: ${error}`);
      }
    }
  }
}

export default ModerationController;
