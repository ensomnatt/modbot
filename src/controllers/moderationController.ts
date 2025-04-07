import { ChatModel } from "../models/chatModel";
import { StatisticsModel } from "../models/statisticsModel";
import { UsersModel } from "../models/usersModel";
import { Context } from "telegraf";
import ParseUtils from "../utils/parseUtils";
import DateUtils from "../utils/dateUtils";
import View from "../view/view";
import { MetricsModel } from "../models/metricsModel";

class ModerationController {
  private chatModel: ChatModel;
  private usersModel: UsersModel;
  private statisticsModel: StatisticsModel;
  private metricsModel: MetricsModel;
  private dateUtils: DateUtils;

  constructor() {
    this.chatModel = new ChatModel();
    this.usersModel = new UsersModel();
    this.statisticsModel = new StatisticsModel();
    this.metricsModel = new MetricsModel();
    this.dateUtils = new DateUtils("");
  }

  async initialize() {
    const chat = await this.chatModel.chatInfo();
    this.dateUtils = new DateUtils(chat?.timeZone || "");
  }

  async punishUser(ctx: Context, commandName: string) {
    console.log(`пользователь @${ctx.from?.username} вызвал команду /${commandName}`);
    let replyMessage, text, userID, username;
    if (ctx.message) {
      if ("reply_to_message" in ctx.message) replyMessage = ctx.message.reply_to_message;
      if ("text" in ctx.message) text = ctx.message.text;
    }

    try {
      if (!text) throw new Error("text is undefined");

      let commandDetails: {why: string, periodStr: string[]};
      if (replyMessage) {
        username = replyMessage.from?.username || "";
        userID = replyMessage.from?.id;

        commandDetails = await ParseUtils.parseCommand(text, true);
      } else {
        username = text.split(" ")[1]; 
        userID = await this.metricsModel.getUserID(username);

        commandDetails = await ParseUtils.parseCommand(text, false);
      }

      if (userID === 0) {
        await View.userNotFound(ctx);
        return;
      } else if (!userID) throw new Error("userID is undefined or null");

      const periodNumber = commandDetails.periodStr.length ? await this.dateUtils.getDuration(commandDetails.periodStr) : 0;

      await this.statisticsModel.updateStatistics(`${commandName}s`);
      if (!await this.usersModel.checkIfUserExists(userID)) await this.usersModel.add(userID);

      let end: number = 0;
      if (!periodNumber) end = await this.dateUtils.getCurrentTime() + periodNumber;

      switch (commandName) {
        case "ban":
          await this.ban(ctx, userID, username, commandDetails.why, end);
          break;
        case "kick":
          await this.kick(ctx, userID, username);
          break;
        case "warn":
          await this.warn(ctx, userID, username, commandDetails.why, end);
          break;
      }
    } catch (error) {
      await this.handlePunishUserError(replyMessage, commandName, error, ctx);
    }
  }

  async handlePunishUserError(replyMessage: any, commandName: string, error: unknown, ctx: Context) {
    console.error(`ошибка при вызове команды /${commandName}: ${error}`);
    if (replyMessage) {
      switch (commandName) {
        case "ban":
          await View.banReplyError(ctx);
          break;
        case "kick":
          await View.kickReplyError(ctx);
          break;
        case "mute":
          await View.muteReplyError(ctx);
          break;
        case "warn":
          await View.warnReplyError(ctx);
          break;
      }
    } else {
      switch (commandName) {
        case "ban":
          await View.banError(ctx);
          break;
        case "kick":
          await View.kickError(ctx);
          break;
        case "mute":
          await View.muteError(ctx);
          break;
        case "warn":
          await View.warnError(ctx);
          break;
      }
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

  async unWarn(ctx: Context) {
    console.log(`пользователь @${ctx.from?.username} вызвал команду /unwarn`);
    let replyMessage;
    let text;
    if (ctx.message) {
      if ("reply_to_message" in ctx.message) replyMessage = ctx.message.reply_to_message;
      if ("text" in ctx.message) text = ctx.message.text;
    }

    if (!text) throw new Error("text is undefined");

    if (replyMessage) {
      try {
        const username = replyMessage?.from?.username || "";
        const userID = replyMessage.from?.id;

        if (!userID) throw new Error("userID is undefined");

        let lastWord;
        if (text.startsWith("/")) {
          lastWord = text.split(" ").slice(1)[0];
        } else {
          lastWord = text.split(" ").slice(2)[0];
        }

        let warnNumber: number;
        if (lastWord === "все") {
          warnNumber = 0;
        } else {
          warnNumber = parseInt(lastWord, 10);
        }

        const user = await this.usersModel.getUser(userID);
        if (!user) throw new Error("user is null");
        const warns = user.warns;

        await this.usersModel.unWarn(userID, warnNumber, warns);
        await View.unWarnMessage(ctx, username);
      } catch (error) {
        console.error(`ошибка при вызове команды /unwarn: ${error}`);
        if (replyMessage) {
          await View.unWarnReplyError(ctx);
        } else {
          await View.unWarnError(ctx);
        }
      } 
    }
  }
}

export default ModerationController;
