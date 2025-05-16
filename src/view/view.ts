import { Context } from "telegraf";
import botMessages from "../config/texts";

class View {
  static async startMessage(ctx: Context, code: string) {
    await ctx.sendMessage(`${botMessages.start(code)}`);
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
    warns: { reason: string; end: string }[],
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

    if (warns.length > 0) {
      for (const warn of warns) {
        if (warn.reason && warn.end !== "навсегда") {
          message += botMessages.infoWarn(warn.end, warn.reason);
        } else if (warn.reason && warn.end === "навсегда") {
          message += botMessages.infoWarnForever(warn.reason);
        } else if (!warn.reason && warn.end !== "навсегда") {
          message += botMessages.infoWarnWithoutReason(warn.end);
        } else {
          message += botMessages.infoWarnForeverWithoutReason;
        }
      }
    }

    if (!banned && !muted && !(warns.length > 0)) {
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

  static async userAlreadyBanned(ctx: Context, username: string) {
    await ctx.reply(botMessages.userAlreadyBanned(username));
  }
}

export default View;
