import { Context } from "telegraf";
import View from "../view/view";

class HelpCommandsController {
  async help(ctx: Context) {
    await View.helpMessage(ctx);
  }
}

export default HelpCommandsController;
