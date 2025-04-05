import { Context } from "telegraf";

class View {
  static async startMessage(ctx: Context, code: string) {
    await ctx.sendMessage(`привет! чтобы активировать бота, тебе нужно добавить его в группу и написать туда следующий код: ${code}`);
  }

  static async firstMessage(ctx: Context) {
    await ctx.sendMessage(`бот запомнил группу. напишете /help, чтобы получить инструкцию по его эксплуатации`);
  }

  static async helpMessage(ctx: Context) {
    await ctx.sendMessage(
      "команды:\n" +
      "/help / !помощь - вывести это сообщение\n" +
      "/maxwarns [число] / !максимум варнов [число] - поставить максимальное количество варнов, при достижении которого пользователь будет забанен. к примеру: \"!максимум варнов 5\"\n" +
      "/warnsperiod [время] / !длительность варнов [время] - поставить длительность варнов по дефолту, которая будет ставится при варне без указания времени. \n" +
      "к примеру: \"!длительность варнов 1 год 1 месяц 1 день\", либо \"!длительность варнов бесконечно\" - варны никогда не будут сниматься автоматически\n" +
      "/settings / !настройки - выводит параметры бота (длительность варнов по дефолту, максимальное количество варнов)\n" +
      "/statistics / статистика - покажет различную статистику бота, к примеру, сколько всего варнов было выдано, сколько людей забанено и так далее\n" +
      "/ban [юзернейм, время, причина] / !бан [юзернейм, время, причина] - бан пользователя\n" +
      "/kick [юзернейм, причина] / !кик [юзернейм, причина] - кик пользователя\n" +
      "/mute [юзернейм, время, причина] / !мут [юзернейм, время, причина] - мут пользователя\n" +
      "/warn [юзернейм, время, причина] / !варн [юзернейм, время, причина] - выдать варн\n" +
      "/unban [юзернейм] / !разбан [юзернейм] - разбан пользователя\n" +
      "/unmute [юзернейм] / !размут [юзернейм] - размут пользователя\n" +
      "/unwarn [юзернейм] / !снять варн [юзернейм] - снять первый варн из списка варнов\n"
    );
  }

  static async settingsMessage(ctx: Context, warnsMax: number, warnsPeriod: number | string) {
    await ctx.reply(`максимальное количество варнов для бана - ${warnsMax}\nдлительность варнов по дефолту: ${warnsPeriod}`);
  }

  static async statisticsMessage(ctx: Context, bans: number, kicks: number, mutes: number, warns: number) {
    await ctx.reply(`забанено: ${bans}\nкикнуто: ${kicks}\nзамучено: ${mutes}\nвыдано варнов: ${warns}`);
  }

  static async maxWarns(ctx: Context, maxWarns: number) {
    await ctx.reply(`количество варнов изменено на ${maxWarns}`);
  }

  static async warnsPeriod(ctx: Context) {
    await ctx.reply(`длительность варнов изменена`)
  }

  static async banMessage(ctx: Context, username: string) {
    await ctx.reply(`пользователь @${username} был забанен`);
  }

  static async warnsPeriodError(ctx: Context) {
    await ctx.reply("использование: /warnsperiod 5 лет 5 месяцев 5 дней / длительность варнов 5 лет 5 месяцев 5 дней");
  }

  static async maxWarnsError(ctx: Context) {
    await ctx.reply("использование: /maxwarns 5 / максимум варнов 5");
  }

  static async banReplyError(ctx: Context) {
    await ctx.reply("использование: /ban / !бан / /ban 5 лет / !бан 5 лет / /ban нехороший / !бан нехороший / /ban 5 лет нехороший / !бан 5 лет нехороший");
  }

  static async banError(ctx: Context) {
    await ctx.reply("использование: /ban @PavelDurov / !бан @PavelDurov / /ban @PavelDurov 5 лет / !бан @PavelDurov 5 лет / /ban @PavelDurov нехороший / !бан @PavelDurov нехороший / /ban @PavelDurov 5 лет нехороший / !бан @PavelDurov 5 лет нехороший");
  }
}

export default View;
