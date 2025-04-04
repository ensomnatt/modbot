class ParseUtils {
  static async parseDuration(text: string): Promise<string[]> {
    const splittedText = text.split(" ");

    const allowedUnits = new Set([
      "год", "года", "лет",
      "месяц", "месяца", "месяцев",
      "день", "дня", "дней", "бесконечно"
    ]);

    return splittedText.filter(word => /^\d+$/.test(word) || allowedUnits.has(word));
  }

  static async hasTime(text: string): Promise<boolean> {
    const regex = /(\d+)\s+(год|года|лет|месяц|месяца|месяцев|день|дня|дней)/g;
    const match = regex.exec(text);

    if (!match) {
      return false;
    } else {
      return true;
    }
  }
}

export default ParseUtils;
