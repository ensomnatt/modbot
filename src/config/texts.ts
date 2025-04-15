const botMessages = {
  start: (code: string) =>
    `привет! чтобы активировать бота, тебе нужно добавить его в группу и написать туда следующий код: ${code}`,
  fist: "бот запомнил группу, напишите. напишете /help или !помощь, чтобы получить инструкцию по его эксплуатации",
  second: "для начала работы бота вам необходимо написать /update",
  help: `команды:
  /help / !помощь - вывести это сообщение\n 
  /maxwarns [число] / !максимум варнов [число] - поставить максимальное количество варнов, при достижении которого пользователь будет забанен. к примеру: \"!максимум варнов 5\"\n 
  /warnsperiod [время] / !длительность варнов [время] - поставить длительность варнов по дефолту,  которая будет ставится при варне без указания времени. 
  к примеру: \"!длительность варнов 1 год 1 месяц 1 день\, либо \"!длительность варнов бесконечно\" - варны никогда не будут сниматься автоматически\n" 
  /settings / !настройки - выводит параметры бота (длительность варнов по дефолту, максимальное количество варнов)\n 
  /statistics / статистика - покажет различную статистику бота, к примеру, сколько всего варнов было выдано, сколько людей забанено и так далее\n 
  /ban [юзернейм, время, причина] / !бан [юзернейм, время, причина] - бан пользователя\n 
  /kick [юзернейм] / !кик [юзернейм, причина] - кик пользователя\n 
  /mute [юзернейм, время, причина] / !мут [юзернейм, время, причина] - мут пользователя\n 
  /warn [юзернейм, время, причина] / !варн [юзернейм, время, причина] - выдать варн\n 
  /unban [юзернейм] / !разбан [юзернейм] - разбан пользователя\n 
  /unmute [юзернейм] / !размут [юзернейм] - размут пользователя\n 
  /unwarn [юзернейм, номер варна] / !снять варн [юзернейм, номер варна] - снять варн\n
  /info [юзернейм] / !инфо [юзернейм] - получить информацию о пользователе`,
  settings: (warnsMax: number, warnsPeriod: string) =>
    `максимальное количество варнов для бана: ${warnsMax}\nдлительность варнов по дефолту: ${warnsPeriod}`,
  statistics: (bans: number, kicks: number, mutes: number, warns: number) =>
    `забанено: ${bans}\nкикнуто: ${kicks}\nзамучено: ${mutes}\nвыдано варнов: ${warns}`,
  warnsMax: (warnsMax: number) => `количество варнов изменено на ${warnsMax}`,
  warnsPeriod: "длительность варнов изменена",
  ban: (username: string) => `пользователь ${username} был забанен`,
  kick: (username: string) => `пользователь ${username} был кикнут из группы`,
  mute: (username: string) => `пользователь ${username} был замучен`,
  warn: (username: string) => `пользователю ${username} был выдан варн`,
  unBan: (username: string) => `пользователь ${username} был разбанен`,
  unMute: (username: string) => `пользователь ${username} был размучен`,
  unWarn: (username: string) => `с пользователя ${username} был снят варн`,
  infoFirst: (username: string, userID: number) =>
    `информация о пользователе ${username} (${userID}):\n\n`,
  infoBanForeverWithoutReason: `забанен навсегда без причины\n`,
  infoBanWithoutReason: (date: string) => `забанен до ${date} без причины\n`,
  infoBanForever: (reason: string) =>
    `забанен навсегда по причине "${reason}"\n`,
  infoBan: (date: string, reason: string) =>
    `забанен до ${date} по причине "${reason}"\n`,
  infoMuteForeverWithoutReason: `замучен навсегда без причины\n`,
  infoMuteWithoutReason: (date: string) => `замучен до ${date} без причины\n`,
  infoMuteForever: (reason: string) =>
    `замучен навсегда по причине "${reason}"\n`,
  infoMute: (date: string, reason: string) =>
    `замучен до ${date} по причине "${reason}"\n`,
  infoWarns: `варны:\n`,
  infoWarnForeverWithoutReason: `выдан варн навсегда без причины\n`,
  infoWarnForever: (reason: string) =>
    `выдан варн навсегда по причине "${reason}"\n`,
  infoWarnWithoutReason: (date: string) =>
    `выдан варн до ${date} без причины\n`,
  infoWarn: (date: string, reason: string) =>
    `выдан варн до ${date} по причине "${reason}"\n`,
  infoDidntFound: `не забанен, не замучен, нет варнов`,
  update: "бот готов к работе",
  warnsPeriodError:
    "использование: /warnsperiod 5 лет 5 месяцев 5 дней / длительность варнов 5 лет 5 месяцев 5 дней",
  warnsMaxError: "использование: /maxwarns 5 / максимум варнов 5",
  banReplyError:
    "использование: /ban / !бан / /ban 5 лет / !бан 5 лет / /ban нехороший / !бан нехороший / /ban 5 лет нехороший / !бан 5 лет нехороший",
  banError:
    "использование: /ban @PavelDurov / !бан @PavelDurov / /ban @PavelDurov 5 лет / !бан @PavelDurov 5 лет / /ban @PavelDurov нехороший / !бан @PavelDurov нехороший / /ban @PavelDurov 5 лет нехороший / !бан @PavelDurov 5 лет нехороший",
  userAlreadyBanned: (username: string) =>
    `пользователь ${username} уже забанен`,
  kickReplyError: "использование: /kick / !кик",
  kickError: "использование: /kick @PavelDurov / !кик @PavelDurov",
  muteReplyError:
    "использование: /mute / !мут / /mute 5 лет / !мут 5 лет / /mute нехороший / !мут нехороший / /mute 5 лет нехороший / !мут 5 лет нехороший",
  muteError:
    "использование: /mute @PavelDurov / !мут @PavelDurov / /mute @PavelDurov 5 лет / !мут @PavelDurov 5 лет / /mute @PavelDurov нехороший / !мут @PavelDurov нехороший / /mute @PavelDurov 5 лет нехороший / !мут @PavelDurov 5 лет нехороший",
  warnReplyError:
    "использование: /warn / !варн / /warn 5 лет / !варн 5 лет / /warn нехороший / !варн нехороший / /warn 5 лет нехороший / !варн 5 лет нехороший",
  warnError:
    "использование: /warn @PavelDurov / !варн @PavelDurov / /warn @PavelDurov 5 лет / !варн @PavelDurov 5 лет / /warn @PavelDurov нехороший / !варн @PavelDurov нехороший / /warn @PavelDurov 5 лет нехороший / !варн @PavelDurov 5 лет нехороший",
  unWarnReplyError:
    "использование: /unwarn 1 / !снять варн 1 / /unwarn все / !снять варн все",
  unWarnError:
    "использование: /unwarn @shushmyr 1 / !снять варн @shushmyr 1 / /unwarn @shushmyr все / !снять варн @shushmyr все",
  gropError:
    "разбанить пользователя можно только в супергруппе или обсуждении канала",
  updateError: "команда уже была запущена",
  userNotFound: `причины, почему бот не может выполнить команду:
  1. пользователь не писал ничего в чат после появления бота
  2. пользователя нет в чате`,
  unBanError: "использование: /unban @shushmyr / !разбан @shushmyr",
  unMuteError: "использование: /unmute @shushmyr / !размут @shushmyr",
  userHasNoWarns: "у пользователя нет варнов",
  incorrectWarnNumber: "некорректный номер варна",
  botError: "бот не может взаимодействовать с другим ботом",
  infoError: "использование: /info @shushmyr / !инфо @shushmyr",
};

export default botMessages;
