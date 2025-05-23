import { Context } from "telegraf";
import { ChatModel } from "../models/chatModel";
import DateUtils from "../utils/dateUtils";
import View from "../view/view";
import { nanoid } from "nanoid";
import { ParseUtils } from "../utils/parseUtils";
import { requestCounter, responseCounter, responseHistogram } from "../metrics/metrics";
import botMessages from "../config/texts";
import logger from "../logs/logs";

class SettingsController {
  private chatModel: ChatModel;
  private dateUtils: DateUtils;

  constructor() {
    this.chatModel = new ChatModel();
    this.dateUtils = new DateUtils("");
  }

  async initialize() {
    const chat = await this.chatModel.chatInfo();
    this.dateUtils = new DateUtils(chat?.timeZone || "");
  }

  async start(ctx: Context) {
    const end = responseHistogram.startTimer();
    requestCounter.inc({ command: "start" });

    logger.info(`бот был запущен впервые`);
    const code = nanoid(5);
    await this.chatModel.code(code);
    await View.startMessage(ctx, code);

    responseCounter.inc({ command: "start" });
    end({ command: "start" });
  }

  async rememberChat(ctx: Context) {
    const chatID = ctx.chat?.id || 0;
    await this.chatModel.chat(chatID);
    logger.info(`бот был добавлен в группу ${chatID}`);
    await View.sendMessage(ctx, botMessages.fist);
    await View.sendMessage(ctx, botMessages.second);
  }

  async warnsMax(ctx: Context) {
    const end = responseHistogram.startTimer();
    requestCounter.inc({ command: "warns_max" });

    let text: string = "";
    if (ctx.message && "text" in ctx.message) text = ctx.message.text;

    let maxWarnsIndex: number = 1;
    if (text.startsWith("!")) maxWarnsIndex = 2;

    const maxWarns = parseInt(text.split(" ")[maxWarnsIndex], 10);
    if (typeof maxWarns !== "number") await View.sendMessage(ctx, botMessages.warnsMaxError);

    await this.chatModel.warnsMax(maxWarns);
    await View.warnsMax(ctx, maxWarns);
    logger.info(
      `пользователь @${ctx.from?.username} изменил максимальное количество варнов`,
    );

    responseCounter.inc({ command: "warns_max" });
    end({ command: "warns_max" });
  }

  async warnsPeriod(ctx: Context) {
    requestCounter.inc({ command: "warns_period" });
    const end = responseHistogram.startTimer();

    let text: string = "";
    if (ctx.message && "text" in ctx.message) text = ctx.message.text;

    const parsedTextStr = await ParseUtils.parseDuration(text);
    const parsedText = parsedTextStr.split(" ");

    if (parsedText.includes("бесконечно")) {
      await this.chatModel.warnsPeriod(0);
      await View.sendMessage(ctx, botMessages.warnsPeriod);
      return;
    }

    if (!ParseUtils.hasTime(parsedTextStr)) {
      await View.sendMessage(ctx, botMessages.warnsPeriodError);
      return;
    }

    await this.chatModel.warnsPeriod(
      await this.dateUtils.getDuration(parsedText),
    );
    await View.sendMessage(ctx, botMessages.warnsPeriod);

    logger.info(
      `пользователь @${ctx.from?.username} изменил длительность варна`,
    );

    responseCounter.inc({ command: "warns_period" });
    end({ command: "warns_period" });
  }
}

export default SettingsController;
