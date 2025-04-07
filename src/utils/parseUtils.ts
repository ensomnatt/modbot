class ParseUtils {
  static async parseDuration(text: string): Promise<string[]> {
    const splittedText = text.split(" ");

    const allowedUnits = new Set([
      "год", "года", "лет",
      "месяц", "месяца", "месяцев",
      "день", "дня", "дней", 
      "час", "часа", "часов",
      "минута", "минуты", "минут",
      "бесконечно"
    ]);

    return splittedText.filter(word => /^\d+$/.test(word) || allowedUnits.has(word));
  }

  static async hasTime(text: string): Promise<boolean> {
    const regex = /(\d+)\s+(год|года|лет|месяц|месяца|месяцев|день|дня|дней|час|часа|часов|минута|минуты|минут)/g;
    const match = regex.exec(text);

    if (!match) {
      return false;
    } else {
      return true;
    }
  }

  static async parseCommand(text: string, isReply: boolean): Promise<{why: string, periodStr: string[]}> {
    let periodStr = await ParseUtils.parseDuration(text);
    const periodStrJoin = periodStr.join(" ");
    let why;
    if (isReply) {
      why = text.split(" ").slice(1).join(" ").replace(periodStrJoin, "").trim();
    } else {
      why = text.split(" ").slice(2).join(" ").replace(periodStrJoin, "").trim();
    }

    return {why: why, periodStr: periodStr}
  }
}

export default ParseUtils;
