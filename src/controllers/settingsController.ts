import { Context } from "telegraf";
import { Model } from "../model/model";
import DateUtils from "../utils/dateUtils";
import View from "../view/view";
import { nanoid } from "nanoid";
import ParseUtils from "../utils/parseUtils";

class SettingsController {
  private model: Model;
  private dateUtils: DateUtils;

  constructor() {
    this.model = new Model();
    this.dateUtils = new DateUtils("");
  }

  async initialize() {
    const chat = await this.model.chatInfo();
    this.dateUtils = new DateUtils(chat?.timeZone || "");
  }

  async start(ctx: Context) {
    console.log(`бот был запущен впервые`);
    const code = nanoid(5);
    await this.model.code(code);
    await View.startMessage(ctx, code);
  }

  async rememberChat(ctx: Context) {
    const chatID = ctx.chat?.id || 0;
    await this.model.chat(chatID);
    console.log(`бот был добавлен в группу ${chatID}`);
    await View.firstMessage(ctx);
  }

  async maxWarns(ctx: Context) {
    let text: string = "";
    if (ctx.message && "text" in ctx.message) text = ctx.message.text;

    let maxWarnsIndex: number = 1;
    if (text.startsWith("максимум")) maxWarnsIndex = 2;

    const maxWarns = parseInt(text.split(" ")[maxWarnsIndex], 10);
    if (typeof maxWarns !== "number") await View.maxWarnsError(ctx);

    await this.model.maxWarns(maxWarns);
    await View.maxWarns(ctx, maxWarns);
    console.log(`пользователь @${ctx.from?.username} изменил максимальное количество варнов`);
  }

  async warnsPeriod(ctx: Context) {
    let text: string = "";
    if (ctx.message && "text" in ctx.message) text = ctx.message.text;

    const parsedText = await ParseUtils.parseDuration(text);

    const time = parsedText.join(" ");
    if (time.includes("бесконечно")) {
      await this.model.warnsPeriod(0);
      await View.warnsPeriod(ctx);
      return;
    }

    const regex = /(\d+)\s+(год|года|лет|месяц|месяца|месяцев|день|дня|дней)/g;
    const foundUnits = new Set<string>();

    let match;
    while((match = regex.exec(time)) !== null) {
      const [, , unit] = match;
      if (foundUnits.has(unit)) {
        await View.warnsPeriodError(ctx);
        return;
      }
      foundUnits.add(unit);
    }

    if (foundUnits.size === 0) {
      await View.warnsPeriodError(ctx);
      return;
    }

    await this.model.warnsPeriod(await this.dateUtils.getDuration(parsedText));
    await View.warnsPeriod(ctx);

    console.log(`пользователь @${ctx.from?.username} изменил длительность варна`);
  }
}

export default SettingsController;
