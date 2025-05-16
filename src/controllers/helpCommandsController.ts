import { Context } from "telegraf";
import View from "../view/view";
import { ChatModel } from "../models/chatModel";
import { StatisticsModel } from "../models/statisticsModel";
import DateUtils from "../utils/dateUtils";
import { UsersModel } from "../models/usersModel";
import { MetricsModel } from "../models/metricsModel";
import { ParseUtils } from "../utils/parseUtils";
import { requestCounter, responseCounter, responseHistogram } from "../metrics/metrics";
import botMessages from "../config/texts";
import logger from "../logs/logs";

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
    requestCounter.inc({ command: "help" });
    const end = responseHistogram.startTimer();

    await View.sendMessage(ctx, botMessages.help);

    responseCounter.inc({ command: "help" });
    end({ command: "help" });
  }

  async settings(ctx: Context) {
    requestCounter.inc({ command: "settings" });
    const end = responseHistogram.startTimer();

    try {
      logger.info(
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

      responseCounter.inc({ command: "settings" });
      end({ command: "settings" });
    } catch (error) {
      logger.error(`ошибка при вызове команды /settings: ${error}`);
    }
  }

  async statistics(ctx: Context) {
    requestCounter.inc({ command: "statistics" });
    const end = responseHistogram.startTimer();

    try {
      logger.info(
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

      responseCounter.inc({ command: "statistics" });
      end({ command: "statistics" });
    } catch (error) {
      logger.error(`ошибка при вызове команды /statistics: ${error}`);
    }
  }

  async bans(ctx: Context) {
    requestCounter.inc({ command: "bans" });
    const end = responseHistogram.startTimer();

    try {
      logger.info(`пользователь ${ctx.from?.username} ввел команду /bans`);
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

        let username: string | null =
          "@" + (await this.metricsModel.getUsername(user.userID));
        if (!username || username === "@") username = user.userID.toString();

        message += `${username} | ${bannedWhy} | ${banEnd}\n`;
      }

      if (!message) message = "не найдено забаненных пользователей";

      await View.sendMessage(ctx, message);

      responseCounter.inc({ command: "bans" });
      end({ command: "bans" });
    } catch (error) {
      logger.error(`ошибка при вызове команды /bans: ${error}`);
    }
  }

  async mutes(ctx: Context) {
    requestCounter.inc({ command: "mutes" });
    const end = responseHistogram.startTimer();

    try {
      logger.info(`пользователь ${ctx.from?.username} ввел команду /mutes`);
      const users = await this.usersModel.getUsers();
      if (!users) throw new Error("users is null");

      let message = "";
      for (const user of users) {
        if (!user.muted) continue;
        if (user.muteEnd === null) throw new Error("user's muteEnd is null");

        let mutedWhy: string | null = user.mutedWhy;
        let muteEnd: string | number = user.muteEnd;
        if (user.muteEnd === 0) {
          muteEnd = "навсегда";
        } else {
          muteEnd = await this.dateUtils.UNIXToDate(muteEnd);
        }
        if (user.mutedWhy === null) mutedWhy = "без причины";

        let username: string | null =
          "@" + (await this.metricsModel.getUsername(user.userID));
        if (!username || username === "@") username = user.userID.toString();

        message += `${username} | ${mutedWhy} | ${muteEnd}\n`;
      }

      if (!message) message = "не найдено замученных пользователей";

      await View.sendMessage(ctx, message);

      responseCounter.inc({ command: "mutes" });
      end({ command: "mutes" });
    } catch (error) {
      logger.error(`ошибка при вызове команды /mutes: ${error}`);
    }
  }

  async info(ctx: Context) {
    requestCounter.inc({ command: "info" });
    const end = responseHistogram.startTimer();

    try {
      const commandDetails = await ParseUtils.parseDefaultCommandDetails(
        ctx,
        "info",
        this.metricsModel,
      );
      if (!commandDetails) throw new Error("commandDetails is null");

      if (!(await this.usersModel.checkIfUserExists(commandDetails.userID))) {
        await this.usersModel.add(commandDetails.userID);
      }

      const user = await this.usersModel.getUser(commandDetails.userID);
      if (!user) throw new Error("user is null");

      let banEnd: string | null = null;
      let muteEnd: string | null = null;
      if (user.banEnd) banEnd = await this.dateUtils.UNIXToDate(user.banEnd);
      if (user.muteEnd) muteEnd = await this.dateUtils.UNIXToDate(user.muteEnd);

      const warns = await this.usersModel.getWarns(user.userID);
      if (!warns) throw new Error("warns is null");

      const formattedWarns: { reason: string; end: string }[] = [];

      for (const warn of warns) {
        const endFormatted = warn.end
          ? await this.dateUtils.UNIXToDate(warn.end)
          : "навсегда";

        formattedWarns.push({
          reason: warn.reason,
          end: endFormatted,
        });
      }

      await View.info(
        ctx,
        commandDetails.username,
        commandDetails.userID,
        user.banned,
        user.bannedWhy,
        banEnd,
        user.muted,
        user.mutedWhy,
        muteEnd,
        formattedWarns,
      );

      responseCounter.inc({ command: "info" });
      end({ command: "info" });
    } catch (error) {
      logger.error(`ошибка при выполнении команды /info: ${error}`);
      await View.sendMessage(ctx, botMessages.infoError);
    }
  }
}

export default HelpCommandsController;
