import { Context } from "telegraf";
import botMessages from "../config/texts";

class View {
  static async startMessage(ctx: Context, code: string) {
    await ctx.sendMessage(`${botMessages.start(code)}`);
  }

  static async firstMessage(ctx: Context) {
    await ctx.sendMessage(botMessages.fist);
  }

  static async helpMessage(ctx: Context) {
    await ctx.sendMessage(botMessages.help);
  }

  static async settingsMessage(ctx: Context, warnsMax: number, warnsPeriod: string) {
    await ctx.reply(botMessages.settings(warnsMax, warnsPeriod));
  }

  static async statisticsMessage(ctx: Context, bans: number, kicks: number, mutes: number, warns: number) {
    await ctx.reply(botMessages.statistics(bans, kicks, mutes, warns));
  }

  static async warnsMax(ctx: Context, warnsMax: number) {
    await ctx.reply(botMessages.warnsMax(warnsMax));
  }

  static async warnsPeriod(ctx: Context) {
    await ctx.reply(botMessages.warnsPeriod);
  }

  static async banMessage(ctx: Context, username: string) {
    await ctx.reply(botMessages.ban(username));
  }

  static async unBanMessage(ctx: Context, username: string) {
    await ctx.sendMessage(botMessages.unBan(username));
  }

  static async gropError(ctx: Context) {
    await ctx.reply(botMessages.gropError);
  }

  static async warnsPeriodError(ctx: Context) {
    await ctx.reply(botMessages.warnsPeriodError);
  }

  static async warnsMaxError(ctx: Context) {
    await ctx.reply(botMessages.warnsMaxError);
  }

  static async banReplyError(ctx: Context) {
    await ctx.reply(botMessages.banError);
  }

  static async banError(ctx: Context) {
    await ctx.reply(botMessages.banError);
  }
}

export default View;
