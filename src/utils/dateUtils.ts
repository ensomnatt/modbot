import { DateTime } from "luxon";

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
}

export default DateUtils;
