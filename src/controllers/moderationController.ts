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

    const commandDetails = await ParseUtils.parseDefaultCommandDetails(ctx, "ban", this.metricsModel);
    try {
      if (!commandDetails) throw new Error("commandDetails is null");
      if (!commandDetails.text) throw new Error("text is undefined");

      let punishCommandDetails;
      if (commandDetails?.replyMessage) {
        punishCommandDetails = await ParseUtils.parsePunishCommandDetails(commandDetails?.text, true);
      } else {
        punishCommandDetails = await ParseUtils.parsePunishCommandDetails(commandDetails?.text, false);
      }

      const periodNumber = punishCommandDetails.periodStr.length ? await this.dateUtils.getDuration(punishCommandDetails.periodStr) : 0;

      await this.statisticsModel.updateStatistics(`${commandName}s`);
      if (!await this.usersModel.checkIfUserExists(commandDetails.userID)) await this.usersModel.add(commandDetails.userID);

      let end: number = 0;
      if (!periodNumber) end = await this.dateUtils.getCurrentTime() + periodNumber;

      switch (commandName) {
        case "ban":
          await this.ban(
            ctx, commandDetails.userID,
            commandDetails.username, punishCommandDetails.why, end
          );
          break;
        case "kick":
          await this.kick(ctx, commandDetails.userID, commandDetails.username);
          break;
        case "warn":
          await this.warn(
            ctx, commandDetails.userID, 
            commandDetails.username, punishCommandDetails.why, end
          );
          break;
      }
    } catch (error) {
      await this.handlePunishUserError(commandDetails?.replyMessage, commandName, error, ctx);
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
      await this.usersModel.unWarn(userID, 0, user.warns);
      return;
    }

    await this.usersModel.warn(userID, user?.warns, why, period);
    await View.warnMessage(ctx, username);
  } 

  async unBan(ctx: Context) {
    console.log(`пользователь @${ctx.from?.username} вызвал команду /unban`);

    const commandDetails = await ParseUtils.parseDefaultCommandDetails(ctx, "unban", this.metricsModel);

    try {
      if (!commandDetails) throw new Error("commandDetails is null");

      if (ctx.chat?.type === "supergroup" || ctx.chat?.type === "channel") {
        await this.usersModel.unBan(commandDetails.userID);
        await ctx.unbanChatMember(commandDetails.userID);
        await View.unBanMessage(ctx, commandDetails.username)
      } else {
        await View.gropError(ctx);
      }
    } catch (error) {
      console.error(`ошибка при вызове команды /unban: ${error}`);
      await View.unBanError(ctx);
    }
  }

  async unWarn(ctx: Context) {
    console.log(`пользователь @${ctx.from?.username} вызвал команду /unwarn`);

    const commandDetails = await ParseUtils.parseDefaultCommandDetails(ctx, "unwarn", this.metricsModel);
    try {
      if (!commandDetails) throw new Error("commandDetails is null");
      let lastWord;
      if (commandDetails.text.startsWith("/")) {
        lastWord = commandDetails.text.split(" ").slice(1)[0];
      } else {
        lastWord = commandDetails.text.split(" ").slice(2)[0];
      }

      let warnNumber: number;
      if (lastWord === "все") {
        warnNumber = 0;
      } else {
        warnNumber = parseInt(lastWord, 10);
      }

      const user = await this.usersModel.getUser(commandDetails.userID);
      if (!user) throw new Error("user is null");
      const warns = user.warns;

      await this.usersModel.unWarn(commandDetails.userID, warnNumber, warns);
      await View.unWarnMessage(ctx, commandDetails.username);
    } catch (error) {
      console.error(`ошибка при вызове команды /unwarn: ${error}`);
      if (commandDetails?.replyMessage) {
        await View.unWarnReplyError(ctx);
      } else {
        await View.unWarnError(ctx);
      }
    }
  }
}

export default ModerationController;
