import { injectEventPrompts } from "./injectEventPrompts";
import { injectGameInfo } from "./injectGameInfo";
import { maintain } from "./maintain";
import { processCurrencyExchange } from "./processCurrencyExchange";
import { processEvent } from "./processEvent";
import { processExperienceAndLevel } from "./processExperienceAndLevel";
import { Variables } from "./types";
import { uninject } from "./utils";

function mainProcesses() {
  const variables = getVariables({ type: "message" }) as Variables;
  const old_variables = (getVariables({ type: "message", message_id: -2 }) as Variables) || {};
  if (!variables || !variables.stat_data) {
    console.error("无法获取变量数据，脚本终止。");
    return;
  }

  try {
    maintain(variables, old_variables);
  } catch (error) {
    console.error("执行 maintain 模块时出错", error);
  }
  try {
    uninject();
  } catch (error) {
    console.error("执行 uninject 模块时出错", error);
  }
  try {
    processExperienceAndLevel(variables, old_variables);
  } catch (error) {
    console.error("执行 processExperienceAndLevel 模块时出错", error);
  }
  try {
    processCurrencyExchange(variables, old_variables);
  } catch (error) {
    console.error("执行 processCurrencyExchange 模块时出错", error);
  }
  try {
    injectGameInfo(variables, old_variables);
  } catch (error) {
    console.error("执行 injectGameInfo 模块时出错", error);
  }
  try {
    processEvent(variables, old_variables);
  } catch (error) {
    console.error("执行 processEvent 模块时出错", error);
  }
  try {
    injectEventPrompts();
  } catch (error) {
    console.error("执行 injectEventPrompts 模块时出错", error);
  }
}

// ============================ [事件监听] ============================
eventOn("mag_variable_update_ended", mainProcesses);
eventOn(tavern_events.GENERATION_AFTER_COMMANDS, injectEventPrompts);
eventOn(tavern_events.MESSAGE_SENT, injectEventPrompts);
eventOn(tavern_events.MESSAGE_UPDATED, injectEventPrompts);
eventOnButton("重新处理变量", mainProcesses);
