import { DateTime } from "luxon";

class DateUtils {
  static FORMAT: string;
  static TIME_ZONE: string; 

  constructor(TIME_ZONE: string) {
    DateUtils.FORMAT = "yyyy-MM-dd HH:mm";
    TIME_ZONE = TIME_ZONE;
  }

  static async getCurrentTime(): Promise<DateTime> {
    return DateTime.now().setZone(this.TIME_ZONE);
  }

  static async dateToUNIX(date: DateTime): Promise<number> {
    return date.toSeconds();
  }

  static async stringToUNIX(string: string): Promise<number> {
    return await this.dateToUNIX(await this.stringToDate(string));
  }

  static async UNIXToDate(unix: number): Promise<DateTime> {
    return DateTime.fromSeconds(unix);
  }

  static async stringToDate(string: string): Promise<DateTime> {
    return DateTime.fromFormat(string, this.FORMAT);
  }

  static async dateToString(date: DateTime): Promise<string> {
    return date.toFormat(this.FORMAT);
  }

  static async UNIXToString(unix: number): Promise<string> {
    return await this.dateToString(await this.UNIXToDate(unix));
  }
}

export default DateUtils;
