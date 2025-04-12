import { Context } from "telegraf";
import botMessages from "../config/texts";

class View {
  static async startMessage(ctx: Context, code: string) {
    await ctx.sendMessage(`${botMessages.start(code)}`);
  }

  static async firstMessage(ctx: Context) {
    await ctx.sendMessage(botMessages.fist);
    await ctx.sendMessage(botMessages.second);
  }

  static async helpMessage(ctx: Context) {
    await ctx.sendMessage(botMessages.help);
  }

  static async sendMessage(ctx: Context, message: string) {
    await ctx.sendMessage(message);
  }

  static async info(
    ctx: Context,
    username: string,
    userID: number,
    banned: boolean,
    bannedWhy: string | null,
    banEnd: string | null,
    muted: boolean,
    mutedWhy: string | null,
    muteEnd: string | null,
    warns: Map<string, string>,
  ) {
    let message = botMessages.infoFirst(username, userID);

    if (banned) {
      if (bannedWhy && banEnd) {
        message += botMessages.infoBan(banEnd, bannedWhy);
      } else if (bannedWhy) {
        message += botMessages.infoBanForever(bannedWhy);
      } else if (banEnd) {
        message += botMessages.infoBanWithoutReason(banEnd);
      } else {
        message += botMessages.infoBanForeverWithoutReason;
      }
    }

    if (muted) {
      if (mutedWhy && muteEnd) {
        message += botMessages.infoMute(muteEnd, mutedWhy);
      } else if (mutedWhy) {
        message += botMessages.infoMuteForever(mutedWhy);
      } else if (muteEnd) {
        message += botMessages.infoMuteWithoutReason(muteEnd);
      } else {
        message += botMessages.infoMuteForeverWithoutReason;
      }
    }

    if (warns.size > 0) {
      for (const [reason, end] of warns) {
        if (reason && end !== "навсегда") {
          message += botMessages.infoWarn(end, reason);
        } else if (reason && end === "навсегда") {
          message += botMessages.infoWarnForever(reason);
        } else if (!reason && end !== "навсегда") {
          message += botMessages.infoWarnWithoutReason(end);
        } else {
          message += botMessages.infoWarnForeverWithoutReason;
        }
      }
    }

    if (!banned && !muted && !(warns.size > 0)) {
      message += botMessages.infoDidntFound;
    }

    await ctx.sendMessage(message);
  }

  static async settingsMessage(
    ctx: Context,
    warnsMax: number,
    warnsPeriod: string,
  ) {
    await ctx.reply(botMessages.settings(warnsMax, warnsPeriod));
  }

  static async statisticsMessage(
    ctx: Context,
    bans: number,
    kicks: number,
    mutes: number,
    warns: number,
  ) {
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

  static async kickMessage(ctx: Context, username: string) {
    await ctx.sendMessage(botMessages.kick(username));
  }

  static async muteMessage(ctx: Context, username: string) {
    await ctx.sendMessage(botMessages.mute(username));
  }

  static async warnMessage(ctx: Context, username: string) {
    await ctx.sendMessage(botMessages.warn(username));
  }

  static async unBanMessage(ctx: Context, username: string) {
    await ctx.sendMessage(botMessages.unBan(username));
  }

  static async unMuteMessage(ctx: Context, username: string) {
    await ctx.sendMessage(botMessages.unMute(username));
  }

  static async unWarnMessage(ctx: Context, username: string) {
    await ctx.sendMessage(botMessages.unWarn(username));
  }

  static async updateMessage(ctx: Context) {
    await ctx.sendMessage(botMessages.update);
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

  static async userAlreadyBanned(ctx: Context, username: string) {
    await ctx.reply(botMessages.userAlreadyBanned(username));
  }

  static async kickReplyError(ctx: Context) {
    await ctx.reply(botMessages.kickReplyError);
  }

  static async kickError(ctx: Context) {
    await ctx.reply(botMessages.kickError);
  }

  static async muteReplyError(ctx: Context) {
    await ctx.reply(botMessages.muteReplyError);
  }

  static async muteError(ctx: Context) {
    await ctx.reply(botMessages.muteError);
  }

  static async warnReplyError(ctx: Context) {
    await ctx.reply(botMessages.warnReplyError);
  }

  static async warnError(ctx: Context) {
    await ctx.reply(botMessages.warnError);
  }

  static async unWarnReplyError(ctx: Context) {
    await ctx.reply(botMessages.unWarnReplyError);
  }

  static async unWarnError(ctx: Context) {
    await ctx.reply(botMessages.unWarnError);
  }

  static async incorrectWarnNumber(ctx: Context) {
    await ctx.reply(botMessages.incorrectWarnNumber);
  }

  static async userHasNoWarns(ctx: Context) {
    await ctx.reply(botMessages.userHasNoWarns);
  }

  static async unBanError(ctx: Context) {
    await ctx.reply(botMessages.unBanError);
  }

  static async unMuteError(ctx: Context) {
    await ctx.reply(botMessages.unMuteError);
  }

  static async updateError(ctx: Context) {
    await ctx.reply(botMessages.updateError);
  }

  static async userNotFound(ctx: Context) {
    await ctx.reply(botMessages.userNotFound);
  }

  static async botError(ctx: Context) {
    await ctx.reply(botMessages.botError);
  }
}

export default View;
