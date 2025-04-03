import { Context, MiddlewareFn } from "telegraf";
import { Model } from "../model/model";

const model = new Model();

export const chatAddMW: MiddlewareFn<Context> = async (ctx, next) => {
  if (!ctx.message || !ctx.chat || !ctx.from) return;

  try {
    const chat = await model.chatInfo();
    if (chat?.chatID === 0) {
      return next();
    } else {
      await ctx.sendMessage("я уже добавлен в группу!");
    }
  } catch (error) {
    console.error(`ошибка в chatMiddleware: ${error}`);
  }
}
