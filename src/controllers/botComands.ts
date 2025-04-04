import { Composer } from "telegraf";
import { startMW, codeMW } from "../middlewares/middlewares";
import SettingsController from "./settingsController";

const composer = new Composer();
const settingsController = new SettingsController();
settingsController.initialize();

composer.command("start", startMW, (ctx) => settingsController.start(ctx));
composer.on("message", codeMW, (ctx) => settingsController.rememberChat(ctx));

export default composer;
