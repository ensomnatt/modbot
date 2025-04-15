import { ChatModel } from "../models/chatModel";
import { StatisticsModel } from "../models/statisticsModel";
import { UsersModel } from "../models/usersModel";
import { Context } from "telegraf";
import {
  ParseUtils,
  DefaultCommandDetails,
  PunishCommandDetails,
} from "../utils/parseUtils";
import DateUtils from "../utils/dateUtils";
import View from "../view/view";
import { MetricsModel } from "../models/metricsModel";

interface CommandDetails extends PunishCommandDetails, DefaultCommandDetails {}

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
    console.log(
      `пользователь @${ctx.from?.username} вызвал команду /${commandName}`,
    );

    if (ctx.from?.is_bot) {
      await View.botError(ctx);
      return;
    }

    let commandDetails: CommandDetails | null = null;
    let defaultCommandDetails, punishCommandDetails;

    try {
      defaultCommandDetails = await ParseUtils.parseDefaultCommandDetails(
        ctx,
        commandName,
        this.metricsModel,
      );

      if (defaultCommandDetails?.userID === 0) {
        await View.userNotFound(ctx);
        return;
      }
      if (!defaultCommandDetails)
        throw new Error("defaulCommandDetails is null");

      punishCommandDetails = await ParseUtils.parsePunishCommandDetails(
        defaultCommandDetails,
        this.dateUtils,
      );

      commandDetails = {
        replyMessage: defaultCommandDetails.replyMessage,
        text: defaultCommandDetails.text,
        username: defaultCommandDetails.username,
        userID: defaultCommandDetails.userID,
        why: punishCommandDetails.why,
        end: punishCommandDetails.end,
      };

      if (!commandDetails) throw new Error("commandDetails is null");

      const chatMember = await ctx.getChatMember(commandDetails.userID);
      switch (chatMember.status) {
        case "kicked":
        case "left":
          await View.userNotFound(ctx);
          return;
      }

      await this.statisticsModel.updateStatistics(`${commandName}s`);
      if (!(await this.usersModel.checkIfUserExists(commandDetails.userID)))
        await this.usersModel.add(commandDetails.userID);

      switch (commandName) {
        case "ban":
          await this.ban(ctx, commandDetails);
          break;
        case "kick":
          await this.kick(ctx, commandDetails);
          break;
        case "mute":
          await this.mute(ctx, commandDetails);
          break;
        case "warn":
          await this.warn(ctx, commandDetails);
          break;
      }
    } catch (error) {
      await this.handlePunishUserError(
        commandDetails?.replyMessage,
        commandName,
        error,
        ctx,
      );
    }
  }

  async handlePunishUserError(
    replyMessage: any,
    commandName: string,
    error: unknown,
    ctx: Context,
  ) {
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

  async ban(ctx: Context, commandDetails: CommandDetails) {
    try {
      const user = await this.usersModel.getUser(commandDetails.userID);
      if (user?.banned) {
        await View.userAlreadyBanned(ctx, commandDetails.username);
        return;
      }
      await this.usersModel.ban(
        commandDetails.userID,
        commandDetails.why,
        commandDetails.end,
      );
      await ctx.banChatMember(commandDetails.userID);
      await View.banMessage(ctx, commandDetails.username);
    } catch (error) {
      console.error(`ошибка при вызове команды /ban: ${error}`);
    }
  }

  async kick(ctx: Context, commandDetails: CommandDetails) {
    try {
      await ctx.banChatMember(commandDetails.userID);
      if (ctx.chat?.type !== "group") {
        ctx.unbanChatMember(commandDetails.userID);
      }
      await View.kickMessage(ctx, commandDetails.username);
    } catch (error) {
      console.error(`ошибка при вызове команды /kick: ${error}`);
    }
  }

  async mute(ctx: Context, commandDetails: CommandDetails) {
    try {
      await ctx.restrictChatMember(commandDetails.userID, {
        permissions: {
          can_send_messages: false,
          can_send_audios: false,
          can_send_documents: false,
          can_send_other_messages: false,
          can_send_photos: false,
          can_send_video_notes: false,
          can_send_videos: false,
          can_send_voice_notes: false,
          can_send_polls: false,
        },
      });

      await this.usersModel.mute(
        commandDetails.userID,
        commandDetails.why,
        commandDetails.end,
      );

      await View.muteMessage(ctx, commandDetails.username);
    } catch (error) {
      console.error(`ошибка при выполнение команды /mute: ${error}`);
    }
  }

  async warn(ctx: Context, commandDetails: CommandDetails) {
    try {
      const user = await this.usersModel.getUser(commandDetails.userID);

      const chat = await this.chatModel.chatInfo();
      if (!chat) throw new Error("chat is undefined");

      if (commandDetails.end !== undefined && commandDetails.end === 0)
        commandDetails.end =
          (await this.dateUtils.getCurrentTime()) + chat?.warnsPeriod;

      if (!user) throw new Error("user is null");
      user.warns += 1;
      if (user.warns === chat?.warnsMax) {
        user.warns -= 1;
        await this.ban(ctx, commandDetails);
        await this.usersModel.unWarn(commandDetails.userID, 0, user.warns);
        return;
      }

      if (commandDetails.text.includes("навсегда")) {
        commandDetails.end = 0;
      }

      await this.usersModel.warn(
        commandDetails.userID,
        user?.warns,
        commandDetails.why,
        commandDetails.end,
      );
      await View.warnMessage(ctx, commandDetails.username);
    } catch (error) {
      console.log(`ошибка при вызове команды /warn: ${error}`);
    }
  }

  async unBan(ctx: Context) {
    console.log(`пользователь @${ctx.from?.username} вызвал команду /unban`);
    if (ctx.from?.is_bot) {
      await View.botError(ctx);
      return;
    }

    try {
      const commandDetails = await ParseUtils.parseDefaultCommandDetails(
        ctx,
        "unban",
        this.metricsModel,
      );

      if (commandDetails?.userID === 0) {
        await View.userNotFound(ctx);
        return;
      }
      if (!commandDetails) throw new Error("commandDetails is null");

      await this.usersModel.unBan(commandDetails.userID);
      await View.unBanMessage(ctx, commandDetails.username);
    } catch (error) {
      console.error(`ошибка при вызове команды /unban: ${error}`);
      await View.unBanError(ctx);
    }
  }

  async unMute(ctx: Context) {
    console.log(`пользователь @${ctx.from?.username} вызвал команду /unmute`);
    if (ctx.from?.is_bot) {
      await View.botError(ctx);
      return;
    }

    try {
      const commandDetails = await ParseUtils.parseDefaultCommandDetails(
        ctx,
        "unmute",
        this.metricsModel,
      );

      if (!commandDetails) throw new Error("commandDetails is null");

      await ctx.restrictChatMember(commandDetails.userID, {
        permissions: {
          can_send_voice_notes: true,
          can_send_videos: true,
          can_send_video_notes: true,
          can_send_photos: true,
          can_send_other_messages: true,
          can_send_documents: true,
          can_send_audios: true,
          can_send_messages: true,
          can_send_polls: true,
        },
      });

      await this.usersModel.unMute(commandDetails.userID);
      await View.unMuteMessage(ctx, commandDetails.username);
    } catch (error) {
      console.error(`ошибка при выполнении команды /unmute: ${error}`);
    }
  }

  async unWarn(ctx: Context) {
    console.log(`пользователь @${ctx.from?.username} вызвал команду /unwarn`);
    if (ctx.from?.is_bot) {
      await View.botError(ctx);
      return;
    }

    try {
      const commandDetails = await ParseUtils.parseDefaultCommandDetails(
        ctx,
        "unwarn",
        this.metricsModel,
      );

      if (commandDetails?.userID === 0) {
        await View.userNotFound(ctx);
        return;
      }
      if (!commandDetails) throw new Error("commandDetails is null");

      const splittedText = commandDetails.text.split(" ");
      const lastWord = splittedText[splittedText.length - 1];

      let warnNumber: number | null = null;
      if (lastWord === "все") {
        warnNumber = 0;
      } else if (!isNaN(parseInt(lastWord, 10)) && lastWord.trim() !== "") {
        warnNumber = parseInt(lastWord, 10);
      }

      const user = await this.usersModel.getUser(commandDetails.userID);
      if (!user) throw new Error("user is null");

      if (!user.warns) {
        await View.userHasNoWarns(ctx);
        return;
      }

      if (warnNumber === null) warnNumber = user.warns;
      if (warnNumber !== 0) user.warns -= 1;

      if (warnNumber !== 0) {
        if (
          !(await this.usersModel.checkIfColumnExists(`warn_${warnNumber}`)) ||
          !(await this.usersModel.checkIfWarnTrue(
            commandDetails.userID,
            warnNumber,
          ))
        ) {
          await View.incorrectWarnNumber(ctx);
          return;
        }
      }

      await this.usersModel.unWarn(
        commandDetails.userID,
        warnNumber,
        user.warns,
      );
      await View.unWarnMessage(ctx, commandDetails.username);
    } catch (error) {
      console.error(`ошибка при вызове команды /unwarn: ${error}`);
      await View.unWarnError(ctx);
    }
  }
}

export default ModerationController;
