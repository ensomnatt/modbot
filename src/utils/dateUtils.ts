import { DateTime, Duration } from "luxon";

class DateUtils {
   private TIME_ZONE: string; 

  constructor(timeZone: string) {
    this.TIME_ZONE = timeZone;
  }

  async getCurrentTime(): Promise<number> {
    return DateTime.now().setZone(this.TIME_ZONE).toSeconds();
  }

  async UNIXToString(unix: number): Promise<string> {
    let seconds = unix;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    const years = Math.floor(days / 365);
    const remainingDaysAfterYears = days % 365;
    const months = Math.floor(remainingDaysAfterYears / 30);
    const remainingDays = remainingDaysAfterYears % 30;

    let result: string = "";

    if (years > 0) {
      result += `${years} ${await this.getYearString(years)} `;
    }
    if (months > 0) {
      result += `${months} ${await this.getMonthString(months)} `;
    }
    if (remainingDays > 0) {
      result += `${remainingDays} ${await this.getDayString(remainingDays)} `;
    }
    if (remainingHours > 0) {
      result += `${remainingHours} ${await this.getHourString(remainingHours)} `;
    }
    if (remainingMinutes > 0) {
      result += `${remainingMinutes} ${await this.getMinuteString(remainingMinutes)}`;
    }

    if (result === "") result = "меньше минуты";

    return result;
  }

  async getYearString(years: number): Promise<string> {
    if (years === 1) return "год";
    if (years >= 2 && years <= 4) return "года";
    return "лет";
  }

  async getDayString(days: number): Promise<string> {
    if (days === 1) return "день";
    if (days >= 2 && days <= 4) return "дня";
    return "дней";
  }

  async getMonthString(months: number): Promise<string> {
    if (months === 1) return "месяц";
    if (months >= 2 && months <= 4) return "месяца";
    return "месяцев";
  }

  async getHourString(hours: number): Promise<string> {
    if (hours === 1) return "час";
    if (hours >= 2 && hours <= 4) return "часа";
    return "часов";
  }

  async getMinuteString(minutes: number): Promise<string> {
    if (minutes === 1) return "минута";
    if (minutes >= 2 && minutes <= 4) return "минуты";
    return "минут";
  }

  async getDuration(elements: string[]): Promise<number> {
    let duration = {years: 0, months: 0, days: 0, hours: 0, minutes: 0};

    for (let i = 0; i < elements.length; i += 2) {
      const number = parseInt(elements[i], 10);
      const unit = elements[i + 1];

      if (unit === "год" || unit === "года" || unit === "лет") {
        duration.years += number;
      } else if (unit === "месяц" || unit === "месяца" || unit === "месяцев") {
        duration.months += number;
      } else if (unit === "день" || unit === "дня" || unit === "дней") {
        duration.days += number;
      } else if (unit === "час" || unit === "часа" || unit === "часов") {
        duration.hours += number;
      } else if (unit === "минута" || unit === "минуты" || unit === "минут") {
        duration.minutes += number;
      }
    }

    return Duration.fromObject(duration).toMillis() / 1000;
  }
}

export default DateUtils;
