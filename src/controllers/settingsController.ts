import { Context } from "telegraf";
import { ChatModel } from "../models/chatModel";
import DateUtils from "../utils/dateUtils";
import View from "../view/view";
import { nanoid } from "nanoid";
import ParseUtils from "../utils/parseUtils";

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
    console.log(`бот был запущен впервые`);
    const code = nanoid(5);
    await this.chatModel.code(code);
    await View.startMessage(ctx, code);
  }

  async rememberChat(ctx: Context) {
    const chatID = ctx.chat?.id || 0;
    await this.chatModel.chat(chatID);
    console.log(`бот был добавлен в группу ${chatID}`);
    await View.firstMessage(ctx);
  }

  async maxWarns(ctx: Context) {
    let text: string = "";
    if (ctx.message && "text" in ctx.message) text = ctx.message.text;

    let maxWarnsIndex: number = 1;
    if (text.startsWith("максимум")) maxWarnsIndex = 2;

    const maxWarns = parseInt(text.split(" ")[maxWarnsIndex], 10);
    if (typeof maxWarns !== "number") await View.warnsMaxError(ctx);

    await this.chatModel.warnsMax(maxWarns);
    await View.warnsMax(ctx, maxWarns);
    console.log(`пользователь @${ctx.from?.username} изменил максимальное количество варнов`);
  }

  async warnsPeriod(ctx: Context) {
    let text: string = "";
    if (ctx.message && "text" in ctx.message) text = ctx.message.text;

    const parsedText = await ParseUtils.parseDuration(text);

    if (parsedText.includes("бесконечно")) {
      await this.chatModel.warnsPeriod(0);
      await View.warnsPeriod(ctx);
      return;
    }

    if (!ParseUtils.hasTime(parsedText.join(" "))) {
      await View.warnsPeriodError(ctx);
      return;
    }

    await this.chatModel.warnsPeriod(await this.dateUtils.getDuration(parsedText));
    await View.warnsPeriod(ctx);

    console.log(`пользователь @${ctx.from?.username} изменил длительность варна`);
  }
}

export default SettingsController;
