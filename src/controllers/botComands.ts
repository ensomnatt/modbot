import { Composer } from "telegraf";
import { startMW, codeMW, chatMW, adminMW } from "../middlewares/middlewares";
import SettingsController from "./settingsController";
import HelpCommandsController from "./helpCommandsController";
import ModerationController from "./moderationController";
import MetricsController from "./metricsController";

const composer = new Composer();
const settingsController = new SettingsController();
const helpCommandsController = new HelpCommandsController();
const moderationController = new ModerationController();
const metricsController = new MetricsController();
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

composer.command("bans", chatMW, adminMW, (ctx) => helpCommandsController.bans(ctx));
composer.hears(/!баны/, chatMW, adminMW, (ctx) => helpCommandsController.bans(ctx));

composer.command("ban", chatMW, adminMW, (ctx) => moderationController.punishUser(ctx, "ban"));
composer.hears(/!бан/, chatMW, adminMW, (ctx) => moderationController.punishUser(ctx, "ban"));

composer.command("kick", chatMW, adminMW, (ctx) => moderationController.punishUser(ctx, "kick"));
composer.hears(/!кик/, chatMW, adminMW, (ctx) => moderationController.punishUser(ctx, "kick"));

composer.command("warn", chatMW, adminMW, (ctx) => moderationController.punishUser(ctx, "warn"));
composer.hears(/!варн/, chatMW, adminMW, (ctx) => moderationController.punishUser(ctx, "warn"));

composer.command("unban", chatMW, adminMW, (ctx) => moderationController.unBan(ctx));
composer.hears(/!разбан/, chatMW, adminMW, (ctx) => moderationController.unBan(ctx));

composer.command("unwarn", chatMW, adminMW, (ctx) => moderationController.unWarn(ctx));
composer.hears(/!снять варн/, chatMW, adminMW, (ctx) => moderationController.unWarn(ctx));

composer.on("message", codeMW, (ctx) => settingsController.rememberChat(ctx));

composer.command("update", chatMW, (ctx) => metricsController.startWork(ctx));

export default composer;
