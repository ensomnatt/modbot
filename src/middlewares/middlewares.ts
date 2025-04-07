import { Context, MiddlewareFn } from "telegraf";
import { ChatModel } from "../models/chatModel";
import SettingsController from "../controllers/settingsController";

const chatModel = new ChatModel();
const settingsController = new SettingsController();
settingsController.initialize();

export const startMW: MiddlewareFn<Context> = async (ctx, next) => {
  console.log(`пользователь ${ctx.from?.username} запустил бота`);
  const chat = await chatModel.chatInfo();
  const chatID = chat?.chatID;

  if (ctx.chat?.type === "private") {
    if (!chatID) {
      return next();
    } else {
      await ctx.sendMessage("привет, я бот для модерации кф, и я уже добавлен в группу");
    }
  }
};

export const codeMW: MiddlewareFn<Context> = async (ctx, next) => {
  let text;
  if (ctx.message && "text" in ctx.message) text = ctx.message.text;

  const chat = await chatModel.chatInfo();
  if (chat?.code === text) {
    await settingsController.rememberChat(ctx);
    return;
  } else {
    return next();
  }
};

export const chatMW: MiddlewareFn<Context> = async (ctx, next) => {
  const botChat = await chatModel.chatInfo();
  if (botChat?.chatID === ctx.chat?.id) return next();
};

export const adminMW: MiddlewareFn<Context> = async (ctx, next) => {
  const admins = await ctx.getChatAdministrators();
  const isAdmin = admins.some(admin => admin.user.id === ctx.from?.id);

  if (isAdmin) return next();
};
