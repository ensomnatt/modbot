import { Composer } from "telegraf";
import { chatAddMW } from "../middlewares/middlewares";
import SettingsController from "./settingsController";

const composer = new Composer();
const settingsController = new SettingsController();
settingsController.initialize();

composer.on("group_chat_created", chatAddMW, (ctx) => settingsController.addedToChat(ctx));

export default composer;
