import { Context } from "telegraf";
import { MetricsModel } from "../models/metricsModel";
import View from "../view/view";

class ParseUtils {
  static async parseDuration(text: string): Promise<string[]> {
    const splittedText = text.split(" ");

    const allowedUnits = new Set([
      "год", "года", "лет",
      "месяц", "месяца", "месяцев",
      "день", "дня", "дней", 
      "час", "часа", "часов",
      "минута", "минуты", "минут",
      "бесконечно"
    ]);

    return splittedText.filter(word => /^\d+$/.test(word) || allowedUnits.has(word));
  }

  static async hasTime(text: string): Promise<boolean> {
    const regex = /(\d+)\s+(год|года|лет|месяц|месяца|месяцев|день|дня|дней|час|часа|часов|минута|минуты|минут)/g;
    const match = regex.exec(text);

    if (!match) {
      return false;
    } else {
      return true;
    }
  }

  static async parsePunishCommandDetails(text: string, isReply: boolean): Promise<{why: string, periodStr: string[]}> {
    let periodStr = await ParseUtils.parseDuration(text);
    const periodStrJoin = periodStr.join(" ");
    let why;
    if (isReply) {
      why = text.split(" ").slice(1).join(" ").replace(periodStrJoin, "").trim();
    } else {
      why = text.split(" ").slice(2).join(" ").replace(periodStrJoin, "").trim();
    }

    return {why: why, periodStr: periodStr}
  }

  static async parseDefaultCommandDetails(
    ctx: Context,
    commandName: string,
    metricsModel: MetricsModel,
    isLongUnwarn?: boolean
  ): Promise<{replyMessage: any, text: string, username: string, userID: number} | null> 
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
        if (isLongUnwarn) {
          username = text.split(" ")[2].slice(2);
        } else {
          username = text.split(" ")[1].slice(1);
        }
        userID = await metricsModel.getUserID(username);
      }

      if (userID === 0) {
        await View.userNotFound(ctx);
        return null;
      } else if (!userID) throw new Error("userID is undefined or null");

      return {replyMessage: replyMessage, text: text, username: username, userID: userID};
    } catch (error) {
      console.error(`ошибка при вызове команды /${commandName}: ${error}`);
      return null;
    }
  }
}

export default ParseUtils;
