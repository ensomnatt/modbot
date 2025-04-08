import { Context } from "telegraf";
import { MetricsModel } from "../models/metricsModel";
import View from "../view/view";
import DateUtils from "./dateUtils";

export interface DefaultCommandDetails {
  replyMessage: any;
  text: string;
  username: string;
  userID: number;
}

export interface PunishCommandDetails {
  why: string;
  end: number;
}

export class ParseUtils {
  static async parseDuration(text: string): Promise<string> {
    const splittedText = text.split(" ");

    const allowedUnits = new Set([
      "год", "года", "лет",
      "месяц", "месяца", "месяцев",
      "день", "дня", "дней", 
      "час", "часа", "часов",
      "минута", "минуты", "минут",
      "бесконечно"
    ]);

    return splittedText.filter(word => /^\d+$/.test(word) || allowedUnits.has(word)).join(" ");
  }

  static async parsePunishCommandDetails(defaultCommandDetails: DefaultCommandDetails, dateUtils: DateUtils): Promise<PunishCommandDetails> {
    const periodStr = await this.parseDuration(defaultCommandDetails.text);
    let why;
    why = defaultCommandDetails.text.split(" ").slice(1).join(" ").replace(defaultCommandDetails.username, "").replace(periodStr, "");

    const periodArr = periodStr.split(" ");
    const period = periodArr.length ? await dateUtils.getDuration(periodArr) : 0;
    const end = period ? await dateUtils.getCurrentTime() + period : 0;

    const punishCommandDetails: PunishCommandDetails = {
      why: why,
      end: end
    }
    return punishCommandDetails;
  }

  static async parseDefaultCommandDetails(
    ctx: Context,
    commandName: string,
    metricsModel: MetricsModel,
    isLongCommand?: boolean
  ): Promise<DefaultCommandDetails | null> 
  {
    let replyMessage, text, userID, username;
    if (ctx.message) {
      if ("reply_to_message" in ctx.message) replyMessage = ctx.message.reply_to_message;
      if ("text" in ctx.message) text = ctx.message.text;
    }

    try {
      if (!text) throw new Error("text is undefined");

      if (replyMessage) {
        username = replyMessage.from?.username || "";
        userID = replyMessage.from?.id;
      } else {
        if (isLongCommand) {
          username = text.split(" ").slice(2)[0];
        } else {
          username = text.split(" ").slice(1)[0];
        }
        userID = await metricsModel.getUserID(username);
      }

      if (!username.startsWith("@")) throw new Error("incorrect username");
      if (userID === 0) {
        await View.userNotFound(ctx);
        return null;
      } else if (!userID) throw new Error("userID is undefined or null");


      const commandDetails: DefaultCommandDetails = {
        replyMessage: replyMessage,
        text: text,
        username: username,
        userID: userID
      }
      return commandDetails;
    } catch (error) {
      console.error(`ошибка при вызове команды /${commandName}: ${error}`);
      return null;
    }
  }
}
