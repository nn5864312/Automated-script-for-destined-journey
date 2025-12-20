// ============================================================
// Automated Script for Destined Journey
// 命定的异世界开发之旅自动化脚本
// ============================================================
// Version: 1.1.4
// Build Date: 2025-12-20 18:39:29
// Author: The-poem-of-destiny
// License: MIT
// Repository: git+https://github.com/The-poem-of-destiny/Automated-script-for-destined-journey.git
// ============================================================

"use strict";
(() => {
  // src/injectEventPrompts.ts
  function injectEventPrompts() {
    const variables = getVariables({ type: "message", message_id: -2 });
    const completed_events = variables?.date?.event?.completed_events;
    injectPrompts([
      {
        id: "completed_events",
        content: completed_events,
        position: "none",
        depth: 0,
        role: "system",
        should_scan: true
      }
    ]);
    if (variables?.date?.event?.cache) {
      const Prompts = variables?.date?.event?.cache;
      injectPrompts([
        {
          id: "event",
          content: Prompts,
          position: "none",
          depth: 0,
          role: "system",
          should_scan: true
        }
      ]);
      injectPrompts([
        {
          id: "event_tips",
          content: `core_system:The event chain has been activated, please note<event>`,
          position: "in_chat",
          depth: 0,
          role: "system",
          should_scan: true
        }
      ]);
    }
  }

  // src/injectGameInfo.ts
  function injectGameInfo(variables) {
    const world = variables.stat_data.世界;
    const user = variables.stat_data.角色;
    const fatesystem = variables.stat_data.命定系统;
    let redline_object_species = [];
    if (fatesystem.命定之人) {
      const redline_object = fatesystem.命定之人;
      for (const name in redline_object) {
        const current_object = redline_object[name];
        if (current_object.是否在场) {
          redline_object_species.push(current_object.种族);
        }
      }
    }
    injectPrompts([
      {
        id: "RedlineObjectSpecies",
        content: redline_object_species,
        position: "none",
        depth: 0,
        role: "system",
        should_scan: true
      }
    ]);
    injectPrompts([
      {
        id: "UserSpecies",
        content: user.种族,
        position: "none",
        depth: 0,
        role: "system",
        should_scan: true
      }
    ]);
    injectPrompts([
      {
        id: "Location",
        content: world.地点,
        position: "none",
        depth: 0,
        role: "system",
        should_scan: true
      }
    ]);
    injectPrompts([
      {
        id: "Time",
        content: world.时间,
        position: "none",
        depth: 0,
        role: "system",
        should_scan: true
      }
    ]);
  }

  // src/config.ts
  var MILESTONE_LEVELS = {
    5: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: "第二层级/中坚" },
    9: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: "第三层级/精英" },
    13: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: "第四层级/史诗" },
    17: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: "第五层级/传说" },
    21: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: "第六层级/神话" },
    25: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: "第七层级/登神" }
  };
  var LEVEL_XP_TABLE = {
    0: 0,
    1: 23,
    2: 106,
    3: 258,
    4: 689,
    5: 997,
    6: 1388,
    7: 1866,
    8: 2945,
    9: 3604,
    10: 4358,
    11: 5208,
    12: 7009,
    13: 8057,
    14: 9206,
    15: 10457,
    16: 13035,
    17: 14496,
    18: 16065,
    19: 17742,
    20: 21135,
    21: 23032,
    22: 25041,
    23: 27161,
    24: 31e3,
    25: Infinity
  };
  var GAME_CONFIG = {
    GP_TO_SP: 100,
    SP_TO_CP: 100,
    AP_Acquisition_Level: 1
  };

  // src/maintain.ts
  function maintain(variables) {
    const old_variables = getVariables({ type: "message", message_id: -2 }) || {};
    const user = variables.stat_data.角色;
    if (user.等级 < 13) {
      variables.stat_data.登神长阶.是否开启 = false;
    } else {
      variables.stat_data.登神长阶.是否开启 = true;
    }
    if (old_variables.stat_data.角色.等级 < user.等级) {
      if (old_variables.stat_data.角色.等级 !== 1) {
        user.等级 = old_variables.stat_data.角色.等级;
      }
    }
    user.升级所需经验 = LEVEL_XP_TABLE[user.等级];
    const current_level = user.等级;
    if (current_level > 0) {
      const required_xp_for_previous_level = LEVEL_XP_TABLE[current_level - 1];
      if (user.累计经验值 < required_xp_for_previous_level) {
        user.累计经验值 = required_xp_for_previous_level;
      }
    }
    const milestones = Object.keys(MILESTONE_LEVELS).map(Number).sort((a, b) => b - a);
    for (const milestone of milestones) {
      if (user.等级 >= milestone) {
        user.生命层级 = MILESTONE_LEVELS[milestone].tier;
        break;
      }
    }
  }

  // src/processCurrencyExchange.ts
  function processCurrencyExchange(variables) {
    const currency = variables.stat_data.货币;
    let GP = currency.金币;
    let SP = currency.银币;
    let CP = currency.铜币;
    function handleCurrencyExchange() {
      let currencyCleared = false;
      if (GP < 0 && !currencyCleared) {
        let gpDeficit = Math.abs(GP);
        if (SP > 0) {
          let spCanCover = Math.floor(SP / GAME_CONFIG.GP_TO_SP);
          if (spCanCover >= gpDeficit) {
            SP -= gpDeficit * GAME_CONFIG.GP_TO_SP;
            GP = 0;
            gpDeficit = 0;
          } else {
            gpDeficit -= spCanCover;
            SP = SP % GAME_CONFIG.GP_TO_SP;
          }
        }
        while (gpDeficit > 0 && CP > 0) {
          let cpNeeded = GAME_CONFIG.GP_TO_SP * GAME_CONFIG.SP_TO_CP;
          if (CP >= cpNeeded) {
            CP -= cpNeeded;
            GP += 1;
            gpDeficit -= 1;
          } else {
            SP = Math.floor(CP / GAME_CONFIG.SP_TO_CP);
            CP = CP % GAME_CONFIG.SP_TO_CP;
            let spCanCover = Math.floor(SP / GAME_CONFIG.GP_TO_SP);
            if (spCanCover >= gpDeficit) {
              SP -= gpDeficit * GAME_CONFIG.GP_TO_SP;
              GP = 0;
              gpDeficit = 0;
            } else {
              gpDeficit -= spCanCover;
              SP = SP % GAME_CONFIG.GP_TO_SP;
            }
            break;
          }
        }
        if (gpDeficit > 0) {
          CP = -(gpDeficit * GAME_CONFIG.GP_TO_SP * GAME_CONFIG.SP_TO_CP);
          GP = 0;
          currencyCleared = true;
        }
      }
      if (SP < 0 && !currencyCleared) {
        let spDeficit = Math.abs(SP);
        if (GP > 0) {
          let gpCanCover = GP * GAME_CONFIG.GP_TO_SP;
          if (gpCanCover >= spDeficit) {
            let gpNeeded = Math.ceil(spDeficit / GAME_CONFIG.GP_TO_SP);
            GP -= gpNeeded;
            SP = gpNeeded * GAME_CONFIG.GP_TO_SP - spDeficit;
            spDeficit = 0;
          } else {
            spDeficit -= gpCanCover;
            GP = 0;
          }
        }
        while (spDeficit > 0 && CP > 0) {
          let cpNeeded = GAME_CONFIG.GP_TO_SP * GAME_CONFIG.SP_TO_CP;
          if (CP >= cpNeeded) {
            CP -= cpNeeded;
            GP = 1;
            let gpCanCover = GP * GAME_CONFIG.GP_TO_SP;
            if (gpCanCover >= spDeficit) {
              let gpNeeded = Math.ceil(spDeficit / GAME_CONFIG.GP_TO_SP);
              GP -= gpNeeded;
              SP = gpNeeded * GAME_CONFIG.GP_TO_SP - spDeficit;
              spDeficit = 0;
            } else {
              spDeficit -= gpCanCover;
              GP = 0;
            }
          } else {
            break;
          }
        }
        if (spDeficit > 0) {
          CP = -(spDeficit * GAME_CONFIG.SP_TO_CP);
          SP = 0;
          currencyCleared = true;
        }
      }
      if (CP < 0 && !currencyCleared) {
        let cpDeficit = Math.abs(CP);
        if (SP > 0) {
          let spCanCover = SP * GAME_CONFIG.SP_TO_CP;
          if (spCanCover >= cpDeficit) {
            let spNeeded = Math.ceil(cpDeficit / GAME_CONFIG.SP_TO_CP);
            SP -= spNeeded;
            CP = spNeeded * GAME_CONFIG.SP_TO_CP - cpDeficit;
            cpDeficit = 0;
          } else {
            cpDeficit -= spCanCover;
            SP = 0;
          }
        }
        while (cpDeficit > 0 && GP > 0) {
          GP -= 1;
          SP = GAME_CONFIG.GP_TO_SP;
          let spCanCover = SP * GAME_CONFIG.SP_TO_CP;
          if (spCanCover >= cpDeficit) {
            let spNeeded = Math.ceil(cpDeficit / GAME_CONFIG.SP_TO_CP);
            SP -= spNeeded;
            CP = spNeeded * GAME_CONFIG.SP_TO_CP - cpDeficit;
            cpDeficit = 0;
          } else {
            cpDeficit -= spCanCover;
            SP = 0;
          }
        }
        if (cpDeficit > 0) {
          CP = -cpDeficit;
          currencyCleared = true;
        }
      }
    }
    handleCurrencyExchange();
    currency.金币 = Math.max(0, Math.floor(GP));
    currency.银币 = Math.max(0, Math.floor(SP));
    currency.铜币 = Math.floor(CP);
  }

  // src/processEvent.ts
  function processEvent(variables) {
    const world = variables.stat_data.世界;
    const event = variables.stat_data.事件链;
    const star = event.开启;
    const end = event.结束;
    const title = event.标题;
    const step = event.阶段;
    const completed_events = event.已完成事件;
    uninjectPrompts(["completed_events"]);
    insertOrAssignVariables({ date: { event: { completed_events } } }, { type: "message" });
    if (star === true) {
      if (variables?.date?.event?.time === null || variables?.date?.event?.time === void 0) {
        insertOrAssignVariables({ date: { event: { time: world.时间 } } }, { type: "message" });
      }
      insertOrAssignVariables({ date: { event: { cache: `当前事件为${title}，当前步骤为${step}` } } }, { type: "message" });
    }
    if (end === true) {
      uninjectPrompts([`event`]);
      uninjectPrompts([`event_tips`]);
      event.已完成事件.push(`已完成事件${title}`);
      event.标题 = "";
      event.阶段 = "";
      event.结束 = false;
      event.开启 = false;
      deleteVariable("event.time", { type: "message" });
      deleteVariable("event.cache", { type: "message" });
    }
  }

  // src/processExperienceAndLevel.ts
  function processExperienceAndLevel(variables) {
    const user = variables.stat_data.角色;
    const current_level = user.等级;
    let has_leveled_up = false;
    while (user.累计经验值 >= user.升级所需经验) {
      if (!LEVEL_XP_TABLE[user.等级]) {
        break;
      }
      user.等级 = user.等级 + 1;
      has_leveled_up = true;
      user.升级所需经验 = LEVEL_XP_TABLE[user.等级];
      if (user.等级 % GAME_CONFIG.AP_Acquisition_Level === 0) {
        user.属性.属性点 = user.属性.属性点 + 1;
        injectPrompts([
          {
            id: "AP+",
            position: "in_chat",
            role: "system",
            depth: 0,
            content: "core_system: The {{user}} has reached a specific level and obtained attribute points. Guide the {{user}} to use attribute points",
            should_scan: true
          }
        ]);
      }
      const milestone = MILESTONE_LEVELS[user.等级];
      if (milestone) {
        user.属性.力量 = user.属性.力量 + milestone.strength;
        user.属性.敏捷 = user.属性.敏捷 + milestone.agility;
        user.属性.体质 = user.属性.体质 + milestone.constitution;
        user.属性.智力 = user.属性.智力 + milestone.intelligence;
        user.属性.精神 = user.属性.精神 + milestone.spirit;
        user.生命层级 = milestone.tier;
      }
    }
    if (has_leveled_up) {
      injectPrompts([
        {
          id: "LV+",
          position: "in_chat",
          role: "system",
          depth: 0,
          content: `core_system: The {{user}} level increased from ${current_level} to ${user.等级}`,
          should_scan: true
        }
      ]);
    }
  }

  // src/processNPCExperienceAndLevel.ts
  function processNPCExperienceAndLevel(variables) {
    const old_variables = getVariables({ type: "message", message_id: -2 }) || {};
    uninjectPrompts(["NPC_LV+"]);
    let Prompts = [];
    let has_leveled_up = false;
    const redline_object = variables.stat_data.命定系统.命定之人;
    const date_redline_object = getVariables({ type: "message" }).date.npcs;
    let requiresContractForExp = getVariables({ type: "message" }).date.requiresContractForExp || true;
    const old_exp = old_variables?.stat_data?.角色?.累计经验值 || variables.stat_data.角色.累计经验值;
    const delta_exp = variables.stat_data.角色.累计经验值 - old_exp || 0;
    for (const name in redline_object) {
      const current_object = redline_object[name];
      insertVariables({ date: { npcs: { [name]: { level: current_object.等级, exp: 0, required_exp: 0 } } } }, { type: "message" });
    }
    for (const name in date_redline_object) {
      if (!(name in redline_object)) {
        deleteVariable(`date.npcs.${name}`, { type: "message" });
      }
    }
    for (const name in date_redline_object) {
      const current_object = date_redline_object[name];
      current_object.level = redline_object[name].等级;
      current_object.required_exp = LEVEL_XP_TABLE[current_object.level];
      if (current_object.level > 0) {
        const required_xp_for_previous_level = LEVEL_XP_TABLE[current_object.level - 1];
        if (current_object.exp < required_xp_for_previous_level) {
          current_object.exp = required_xp_for_previous_level;
        }
      }
      if (requiresContractForExp) {
        if (redline_object[name].是否在场 && delta_exp > 0 && redline_object[name].是否缔结契约) {
          current_object.exp = current_object.exp + delta_exp;
        }
      } else {
        if (redline_object[name].是否在场 && delta_exp > 0) {
          current_object.exp = current_object.exp + delta_exp;
        }
      }
      while (current_object.exp >= current_object.required_exp) {
        if (!LEVEL_XP_TABLE[current_object.level]) {
          break;
        }
        current_object.level++;
        has_leveled_up = true;
        current_object.required_exp = LEVEL_XP_TABLE[current_object.level];
      }
      if (redline_object[name].等级 < current_object.level) {
        has_leveled_up = true;
        Prompts.push(`${name}从LV${redline_object[name].等级}提升到LV${current_object.level};`);
        redline_object[name].等级 = current_object.level;
      }
      insertOrAssignVariables(
        { date: { npcs: { [name]: { level: current_object.level, exp: current_object.exp, required_exp: current_object.required_exp } } } },
        { type: "message" }
      );
    }
    if (has_leveled_up) {
      injectPrompts([
        {
          id: "NPC_LV+",
          content: `core_system: ${Prompts.join("")}`,
          position: "none",
          depth: 0,
          role: "system",
          should_scan: true
        }
      ]);
    }
  }

  // src/utils.ts
  function uninject() {
    const idsToRemove = ["AP+", "LV+", "Location", "Time", "RedlineObjectSpecies", "UserSpecies"];
    uninjectPrompts(idsToRemove);
  }

  // src/main-controller.ts
  function mainProcesses(variables) {
    if (!variables || !variables.stat_data) {
      console.error("无法获取变量数据，脚本终止。");
      return;
    }
    if (!variables.date.npcs) {
      insertVariables({ date: { npcs: {} } }, { type: "message" });
    }
    try {
      maintain(variables);
    } catch (error) {
      console.error("执行 maintain 模块时出错", error);
    }
    try {
      uninject();
    } catch (error) {
      console.error("执行 uninject 模块时出错", error);
    }
    try {
      processExperienceAndLevel(variables);
    } catch (error) {
      console.error("执行 processExperienceAndLevel 模块时出错", error);
    }
    try {
      processCurrencyExchange(variables);
    } catch (error) {
      console.error("执行 processCurrencyExchange 模块时出错", error);
    }
    try {
      injectGameInfo(variables);
    } catch (error) {
      console.error("执行 injectGameInfo 模块时出错", error);
    }
    try {
      processNPCExperienceAndLevel(variables);
    } catch (error) {
      console.error("执行 processNPCExperienceAndLevel 模块时出错", error);
    }
    try {
      processEvent(variables);
    } catch (error) {
      console.error("执行 processEvent 模块时出错", error);
    }
    try {
      injectEventPrompts();
    } catch (error) {
      console.error("执行 injectEventPrompts 模块时出错", error);
    }
  }
  (async () => {
    await waitGlobalInitialized("Mvu");
    eventOn("mag_variable_update_ended", mainProcesses);
    eventOn(tavern_events.GENERATION_AFTER_COMMANDS, injectEventPrompts);
    eventOn(tavern_events.MESSAGE_SENT, injectEventPrompts);
    eventOn(tavern_events.MESSAGE_UPDATED, injectEventPrompts);
    eventOn(getButtonEvent("重新处理变量"), mainProcesses);
  })();
})();
