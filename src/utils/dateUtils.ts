import { DateTime, Duration } from "luxon";

class DateUtils {
   private TIME_ZONE: string; 

  constructor(timeZone: string) {
    this.TIME_ZONE = timeZone;
  }

  async getCurrentTime(): Promise<DateTime> {
    return DateTime.now().setZone(this.TIME_ZONE);
  }

  async dateToUNIX(date: DateTime): Promise<number> {
    return date.toSeconds();
  }

  async UNIXToDate(unix: number): Promise<DateTime> {
    return DateTime.fromSeconds(unix);
  }

  async UNIXToString(unix: number): Promise<string> {
    const duration = Duration.fromMillis(unix / 1000);
    const years = duration.get("years");
    const months = duration.get("months");
    const days = duration.get("days");

    let result: string = "";
    switch (years) {
      case 1:
        result += `${years} год `;
      case 2:
        result += `${years} года `;
      default:
        result += `${years} лет `;
    } 

    switch (months) {
      case 1:
        result += `${months} месяц `;
      case 2:
        result += `${months} месяца `;
      default:
        result += `${months} месяцев `;
    }

    switch (days) {
      case 1:
        result += `${days} день`;
      case 2:
        result += `${days} дня`;
      default:
        result += `${days} дней`;
    }

    return result;
  }

  async getDuration(elements: string[]): Promise<number> {
    let duration = {years: 0, months: 0, days: 0};

    for (let i = 0; i < elements.length; i += 2) {
      const number = parseInt(elements[i], 10);
      const unit = elements[i + 1];

      if (unit === "год" || unit === "года" || unit === "лет") {
        duration.years += number;
      } else if (unit === "месяц" || unit === "месяца" || unit === "месяцев") {
        duration.months += number;
      } else if (unit === "день" || unit === "дня" || unit === "дней") {
        duration.days += number;
      }
    }

    return Duration.fromObject(duration).toMillis() / 1000;
  }
}

export default DateUtils;
