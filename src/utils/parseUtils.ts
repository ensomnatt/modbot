class ParseUtils {
  static async parseDuration(text: string): Promise<string[]> {
    const splittedText = text.split(" ");

    const allowedUnits = new Set([
      "год", "года", "лет",
      "месяц", "месяца", "месяцев",
      "день", "дня", "дней"
    ]);

    return splittedText.filter(word => /^\d+$/.test(word) || allowedUnits.has(word));
  }
}

export default ParseUtils;
