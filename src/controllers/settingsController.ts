import { Context } from "telegraf";
import { Model } from "../model/model";
import DateUtils from "../utils/dateUtils";
import View from "../view/view";
import { nanoid } from "nanoid";

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
}

export default SettingsController;
