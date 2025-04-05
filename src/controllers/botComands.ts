import { Composer } from "telegraf";
import { startMW, codeMW, chatMW, adminMW } from "../middlewares/middlewares";
import SettingsController from "./settingsController";
import HelpCommandsController from "./helpCommandsController";
import ModerationController from "./moderationController";

const composer = new Composer();
const settingsController = new SettingsController();
const helpCommandsController = new HelpCommandsController();
const moderationController = new ModerationController();
settingsController.initialize();
moderationController.initialize();

composer.command("start", startMW, (ctx) => settingsController.start(ctx));
composer.command("maxwarns", chatMW, adminMW, (ctx) => settingsController.maxWarns(ctx));
composer.hears(/!максимум варнов/, chatMW, adminMW, (ctx) => settingsController.maxWarns(ctx));
composer.command("warnsperiod", chatMW, adminMW, (ctx) => settingsController.warnsPeriod(ctx));
composer.hears(/!длительность варнов/, chatMW, adminMW, (ctx) => settingsController.warnsPeriod(ctx));
composer.command("help", chatMW, (ctx) => helpCommandsController.help(ctx));
composer.hears(/!помощь/, chatMW, (ctx) => helpCommandsController.help(ctx));
composer.command("settings", chatMW, (ctx) => helpCommandsController.settings(ctx));
composer.hears(/!настройки/, chatMW, (ctx) => helpCommandsController.settings(ctx));
composer.command("statistics", chatMW, (ctx) => helpCommandsController.statistics(ctx));
composer.hears(/!статистика/, chatMW, (ctx) => helpCommandsController.statistics(ctx));
composer.command("ban", chatMW, adminMW, (ctx) => moderationController.ban(ctx));
composer.hears(/!бан/, chatMW, adminMW, (ctx) => moderationController.ban(ctx));

composer.on("message", codeMW, (ctx) => settingsController.rememberChat(ctx));

export default composer;
