import { Context } from "telegraf";
import { Model, Chat } from "../model/model";
import DateUtils from "../utils/dateUtils";

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

  async addedToChat(ctx: Context) {
    this.model.chat(ctx.chat?.id || 0);
  }
}

export default SettingsController;
