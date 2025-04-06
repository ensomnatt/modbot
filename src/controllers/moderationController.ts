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

  async command(ctx: Context, commandName: string) {
    if (commandName !== "ban" && commandName !== "kick" && commandName !== "mute" && commandName !== "warn") throw new Error("неизвестная команда");

    console.log(`пользователь @${ctx.from?.username} вызвал команду /${commandName}`);
    let replyMessage;
    let text;
    if (ctx.message) {
      if ("reply_to_message" in ctx.message) replyMessage = ctx.message.reply_to_message;
      if ("text" in ctx.message) text = ctx.message.text;
    }

    try {
      if (!text) throw new Error("text is undefined");
      
      if (replyMessage) {
        const username = replyMessage.from?.username || "";
        const userID = replyMessage.from?.id;

        if (!userID) throw new Error("userID is undefined");

        //причина и время команды
        const {why, period} = await ParseUtils.parseCommand(text, true);
        const commandPeriod = period.length ? await this.dateUtils.getDuration(period) : 0;

        await this.statisticsModel.updateStatistics(`${commandName}s`);
        if (!await this.usersModel.checkIfUserExists(userID)) await this.usersModel.add(userID);

        switch (commandName) {
          case "ban":
            await this.ban(ctx, userID, username, why, commandPeriod);
            break;
          case "kick":
            await this.kick(ctx, userID, username);
            break;
          case "warn":
            await this.warn(ctx, userID, username, why, commandPeriod);
            break;
        }
      }
    } catch (error) {
      console.error(`ошибка при вызове команды /${commandName}: ${error}`);
    }
  }

  async ban(ctx: Context, userID: number, username: string, why: string, period: number) {
    await this.usersModel.ban(userID, why, period);
    await ctx.banChatMember(userID);
    await View.banMessage(ctx, username);
  }

  async kick(ctx: Context, userID: number, username: string) {
    await ctx.banChatMember(userID);
    if (ctx.chat?.type !== "group") ctx.unbanChatMember(userID);
    await View.kickMessage(ctx, username);
  }

  async warn(ctx: Context, userID: number, username: string, why: string, period: number) {
    const user = await this.usersModel.getUser(userID);

    const chat = await this.chatModel.chatInfo();
    if (!user) throw new Error("user is null");
    user.warns += 1;
    if (user.warns === chat?.warnsMax) {
      await this.ban(ctx, userID, username, why, period);
      return;
    }

    await this.usersModel.warn(userID, user?.warns, why, period);
    await View.warnMessage(ctx, username);
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
          if (!userID) throw new Error("userID is undefined");
          
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
