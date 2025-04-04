import { Composer } from "telegraf";
import { startMW, codeMW, chatMW, adminMW } from "../middlewares/middlewares";
import SettingsController from "./settingsController";

const composer = new Composer();
const settingsController = new SettingsController();
settingsController.initialize();

composer.command("start", startMW, (ctx) => settingsController.start(ctx));
composer.command("maxwarns", chatMW, adminMW, (ctx) => settingsController.maxWarns(ctx));
composer.hears(/максимум варнов/, chatMW, adminMW, (ctx) => settingsController.maxWarns(ctx));
composer.command("warnsperiod", chatMW, adminMW, (ctx) => settingsController.warnsPeriod(ctx));
composer.hears(/длительность варнов/, chatMW, adminMW, (ctx) => settingsController.warnsPeriod(ctx));
composer.on("message", codeMW, (ctx) => settingsController.rememberChat(ctx));

export default composer;
