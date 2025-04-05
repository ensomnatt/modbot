import db from "../database/database";

export interface Chat {
  chatID: number | null;
  warnsMax: number;
  warnsPeriod: number;
  timeZone: string;
  code: string | null;
}

interface ChatData {
  chat_id: number | null;
  warns_max: number;
  warns_period: number;
  time_zone: string;
  code: string | null;
}

export class ChatModel {
  async warnsMax(maxWarns: number) {
    try {
      db.prepare("UPDATE chat SET warns_max = ?").run(maxWarns);
      console.log(`изменено максимальное количество варнов на ${maxWarns}`);
    } catch (error) {
      console.error(`ошибка при изменении максимального количества варнов: ${error}`);
    }
  }

  async warnsPeriod(period: number) {
    try {
      db.prepare("UPDATE chat SET warns_period = ?").run(period);
      console.log(`изменено время варнов на ${period}`);
    } catch (error) {
      console.error(`ошибка при изменении времени варнов: ${error}`);
    }
  }

  async chat(chatID: number) {
    try {
      db.prepare("UPDATE chat SET chat_id = ?").run(chatID);
      console.log(`добавлена информация о чате: ${chatID}`);
    } catch (error) {
      console.error(`ошибка при попытке добавить информацию о чате: ${chatID}`);
    }
  }
  
  async timeZone(timeZone: string) {
    try {
      db.prepare("UPDATE chat SET time_zone = ?").run(timeZone);
      console.log(`изменен часовой пояс на ${timeZone}`);
    } catch (error) {
      console.error(`ошибка при изменении часового пояса: ${error}`);
    }
  }

  async code(code: string) {
    try {
      db.prepare("UPDATE chat SET code = ?").run(code);
      console.log(`код добавлен в базу данных: ${code}`);
    } catch (error) {
      console.error(`ошибка при добавлении кода: ${error}`);
    }
  }

  async chatInfo(): Promise<Chat | null> {
    try {
      const chatRaw = await db.prepare("SELECT * FROM chat").get() as ChatData;
      const chat: Chat = {
        chatID: chatRaw.chat_id,
        warnsMax: chatRaw.warns_max,
        warnsPeriod: chatRaw.warns_period,
        timeZone: chatRaw.time_zone,
        code: chatRaw.code
      }

      return chat;
    } catch (error) {
      console.error(`ошибка при взятии информации о чате: ${error}`);
      return null;
    }
  }
}
