import { Context } from "telegraf";
import { Model, Chat } from "../model/model";
import DateUtils from "../utils/dateUtils";

class SettingsController {
  private model: Model;
  private dateUtils: DateUtils;

  async initialize() {
    this.model = new Model();
    const chat = await this.model.chatInfo();
    this.dateUtils = new DateUtils(chat?.timeZone || "");
  }

  async addedToChat(ctx: Context) {
    this.model.chat(ctx.chat?.id || 0);
  }
}

export default SettingsController;
