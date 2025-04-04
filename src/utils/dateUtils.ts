import { DateTime, Duration } from "luxon";

class DateUtils {
   private FORMAT: string;
   private TIME_ZONE: string; 

  constructor(timeZone: string) {
    this.FORMAT = "yyyy-MM-dd HH:mm";
    this.TIME_ZONE = timeZone;
  }

  async getCurrentTime(): Promise<DateTime> {
    return DateTime.now().setZone(this.TIME_ZONE);
  }

  async dateToUNIX(date: DateTime): Promise<number> {
    return date.toSeconds();
  }

  async stringToUNIX(string: string): Promise<number> {
    return await this.dateToUNIX(await this.stringToDate(string));
  }

  async UNIXToDate(unix: number): Promise<DateTime> {
    return DateTime.fromSeconds(unix);
  }

  async stringToDate(string: string): Promise<DateTime> {
    return DateTime.fromFormat(string, this.FORMAT);
  }

  async dateToString(date: DateTime): Promise<string> {
    return date.toFormat(this.FORMAT);
  }

  async UNIXToString(unix: number): Promise<string> {
    return await this.dateToString(await this.UNIXToDate(unix));
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
