import { Context, MiddlewareFn } from "telegraf";
import { Model } from "../model/model";

const model = new Model();

export const startMW: MiddlewareFn<Context> = async (ctx, next) => {
  console.log(`пользователь ${ctx.from?.username} запустил бота`);
  const chat = await model.chatInfo();
  const chatID = chat?.chatID;

  if (ctx.chat?.type === "private") {
    if (chatID === 0) {
      return next();
    } else {
      await ctx.sendMessage("привет, я бот для модерации кф, и я уже добавлен в группу");
    }
  }
};

export const codeMW: MiddlewareFn<Context> = async (ctx, next) => {
  let text;
  if (ctx.message && "text" in ctx.message) text = ctx.message.text;

  const chat = await model.chatInfo();
  if (chat?.code === text) return next();
};

export const chatMW: MiddlewareFn<Context> = async (ctx, next) => {
  const botChat = await model.chatInfo();
  const botChatID = botChat?.chatID;

  if (botChatID === ctx.chat?.id) return next();
};

export const adminMW: MiddlewareFn<Context> = async (ctx, next) => {
  const admins = await ctx.getChatAdministrators();
  const isAdmin = admins.some(admin => admin.user.id === ctx.from?.id);

  if (isAdmin) return next();
};
