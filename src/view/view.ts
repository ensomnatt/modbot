import { Context } from "telegraf";

class View {
  static async startMessage(ctx: Context, code: string) {
    await ctx.sendMessage(`привет! чтобы активировать бота, тебе нужно добавить его в группу и написать туда следующий код: ${code}`);
  }

  static async firstMessage(ctx: Context) {
    await ctx.sendMessage(`бот запомнил группу. напишете /help, чтобы получить инструкцию по его эксплуатации`);
  }

  static async maxWarns(ctx: Context, maxWarns: number) {
    await ctx.reply(`количество варнов изменено на ${maxWarns}`);
  }

  static async warnsPeriod(ctx: Context) {
    await ctx.reply(`длительность варнов изменена`)
  }

  static async warnsPeriodError(ctx: Context) {
    await ctx.reply("использование: /warnsperiod 5 лет 5 месяцев 5 дней / длительность варнов 5 лет 5 месяцев 5 дней");
  }

  static async maxWarnsError(ctx: Context) {
    await ctx.reply("использование: /maxwarns 5 / максимум варнов 5");
  }
}

export default View;
