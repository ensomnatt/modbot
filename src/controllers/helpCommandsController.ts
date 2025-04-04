import { Context } from "telegraf";
import View from "../view/view";
import { Model } from "../model/model";
import DateUtils from "../utils/dateUtils";

class HelpCommandsController {
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

  async help(ctx: Context) {
    await View.helpMessage(ctx);
  }
  
  async settings(ctx: Context) {
    try {
      const warnsMax = await this.model.getWarnsMax();
      if (warnsMax === null) throw new Error("warnsMax is null");
      const warnsPeriod = await this.model.getWarnsPeriod();
      if (warnsPeriod === null) throw new Error("warnsPeriod is null");
      let parsedWarnsPeriod: number | string = warnsPeriod;
      if (warnsPeriod === 0) parsedWarnsPeriod = "бесконечно";

      await View.settingsMessage(ctx, warnsMax, parsedWarnsPeriod);
    } catch (error) {
      console.error(`ошибка при вызове команды /settings: ${error}`);
    }
  }
}

export default HelpCommandsController;
