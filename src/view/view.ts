import { Context } from "telegraf";

class View {
  static async startMessage(ctx: Context, code: string) {
    await ctx.sendMessage(`привет! чтобы активировать бота, тебе нужно добавить его в группу и написать туда следующий код: ${code}`);
  }

  static async firstMessage(ctx: Context) {
    await ctx.sendMessage(`бот запомнил группу. напишете /help, чтобы получить инструкцию по его эксплуатации`);
  }
}

export default View;
