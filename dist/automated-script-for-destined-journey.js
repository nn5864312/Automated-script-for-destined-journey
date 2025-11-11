// ============================================================
// Automated Script for Destined Journey
// 命定的异世界开发之旅自动化脚本
// ============================================================
// Version: 1.1.4
// Build Date: 2025-11-11 16:32:07
// Author: The-poem-of-destiny
// License: MIT
// Repository: git+https://github.com/The-poem-of-destiny/Automated-script-for-destined-journey.git
// ============================================================

"use strict";
(() => {
  // src/config.ts
  var MILESTONE_LEVELS = {
    5: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: "第二层级/中坚" },
    9: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: "第三层级/精英" },
    13: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: "第四层级/史诗" },
    17: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: "第五层级/传说" },
    21: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: "第六层级/神话" },
    25: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: "第七层级/登神" }
  };
  var JOB_LEVEL_XP_TABLE = {
    0: 0,
    1: 15,
    2: 55,
    3: 130,
    4: 290,
    5: 640,
    6: 1120,
    7: 1750,
    8: 2710,
    9: 3385,
    10: 4225,
    11: 5215,
    12: 6475,
    13: 7515,
    14: 8747,
    15: 10187,
    16: 11979,
    17: 12574,
    18: 13294,
    19: 14149,
    20: 15349,
    21: 15601,
    22: 15865,
    23: 16279,
    24: 17500,
    25: 1145141919810
  };
  var GAME_CONFIG = {
    GP_TO_SP: 100,
    SP_TO_CP: 100,
    AP_Acquisition_Level: 1
  };

  // src/utils.ts
  function safeParseFloat(value) {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }
  function uninject() {
    const idsToRemove = ["AP+", "Location", "Time", "LV+", "RedlineObjectSpecies", "UserSpecies"];
    uninjectPrompts(idsToRemove);
  }
  function tobool(value) {
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "string") {
      return value.toLowerCase() === "true";
    }
    return Boolean(value);
  }

  // src/currency-system.ts
  function CurrencySystem(property) {
    let GP = safeParseFloat(property.货币.金币);
    let SP = safeParseFloat(property.货币.银币);
    let CP = safeParseFloat(property.货币.铜币);
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
    property.货币.金币 = Math.max(0, Math.floor(GP));
    property.货币.银币 = Math.max(0, Math.floor(SP));
    property.货币.铜币 = Math.floor(CP);
  }

  // src/event-chain-system-current.ts
  function event_chain(eventchain, world) {
    const star = tobool(eventchain.开启);
    const end = tobool(eventchain.结束);
    const recall_time = tobool(eventchain.琥珀事件);
    const title = eventchain.标题;
    const step = eventchain.阶段;
    const completed_events = eventchain.已完成事件;
    const variables = getVariables({ type: "chat" });
    uninjectPrompts(["completed_events"]);
    insertOrAssignVariables(
      { event_chain: { completed_events } },
      { type: "message" }
    );
    if (star === true) {
      if (variables?.event_chain?.time !== null) {
        insertOrAssignVariables(
          { event_chain: { time: world.时间 } },
          { type: "chat" }
        );
      }
      ;
      insertOrAssignVariables(
        { event_chain: { cache: `当前事件为${title}，当前步骤为${step}` } },
        { type: "message" }
      );
    }
    ;
    if (end === true) {
      if (recall_time === true) {
        const time = variables?.event_chain?.time;
        if (time !== null) {
          world.时间 = time;
        }
      }
      uninjectPrompts([`event_chain`]);
      uninjectPrompts([`event_chain_tips`]);
      eventchain.已完成事件.push(`已完成事件${title}`);
      eventchain.标题 = "";
      eventchain.阶段 = "";
      eventchain.结束 = false;
      eventchain.开启 = false;
      eventchain.琥珀事件 = false;
      deleteVariable("event_chain.time", { type: "chat" });
      deleteVariable("event_chain.cache", { type: "message" });
    }
  }

  // src/event-chain-system-inject.ts
  function event_chain_inject() {
    const variables = getVariables({ type: "message", message_id: -2 });
    if (variables.event_chain.completed_events) {
      const completed_events = variables.event_chain.completed_events;
      injectPrompts([
        {
          id: "event_chain_end",
          content: completed_events,
          position: "none",
          depth: 0,
          role: "system",
          should_scan: true
        }
      ]);
    }
    if (variables.event_chain.cache) {
      const Prompts = variables.event_chain.cache;
      injectPrompts([
        {
          id: "completed_events",
          content: Prompts,
          position: "none",
          depth: 0,
          role: "system",
          should_scan: true
        }
      ]);
      injectPrompts([
        {
          id: "event_chain_tips",
          content: `core_system:The event chain has been activated, please note<event_chain>`,
          position: "in_chat",
          depth: 0,
          role: "system",
          should_scan: true
        }
      ]);
    }
  }

  // src/experience-level.ts
  function experiencegrowth(user) {
    const currentLevel = user.状态.等级;
    let hasLeveledUp = false;
    while (safeParseFloat(user.状态.累计经验值) >= safeParseFloat(user.状态.升级所需经验)) {
      if (!JOB_LEVEL_XP_TABLE[user.状态.等级] || safeParseFloat(user.状态.累计经验值) >= 1145141919810) {
        break;
      }
      user.状态.等级 = safeParseFloat(user.状态.等级) + 1;
      hasLeveledUp = true;
      user.状态.升级所需经验 = JOB_LEVEL_XP_TABLE[user.状态.等级];
      if (user.状态.等级 % GAME_CONFIG.AP_Acquisition_Level === 0) {
        user.属性.属性点 = safeParseFloat(user.属性.属性点) + 1;
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
      const milestone = MILESTONE_LEVELS[user.状态.等级];
      if (milestone) {
        user.属性.力量 = safeParseFloat(user.属性.力量) + milestone.strength;
        user.属性.敏捷 = safeParseFloat(user.属性.敏捷) + milestone.agility;
        user.属性.体质 = safeParseFloat(user.属性.体质) + milestone.constitution;
        user.属性.智力 = safeParseFloat(user.属性.智力) + milestone.intelligence;
        user.属性.精神 = safeParseFloat(user.属性.精神) + milestone.spirit;
        user.状态.生命层级 = milestone.tier;
      }
    }
    if (hasLeveledUp) {
      injectPrompts([
        {
          id: "LV+",
          position: "in_chat",
          role: "system",
          depth: 0,
          content: `core_system: The {{user}} level increased from ${currentLevel} to ${user.状态.等级}`,
          should_scan: true
        }
      ]);
    }
  }

  // src/info-injection.ts
  function inforead(world, fatesystem, user) {
    let RedlineObjectSpecies = [];
    if (fatesystem.命定之人) {
      const RedlineObject = fatesystem.命定之人;
      for (const name in RedlineObject) {
        const CurrentObject = RedlineObject[name];
        RedlineObjectSpecies.push(CurrentObject.种族);
      }
    }
    injectPrompts([
      {
        id: "RedlineObjectSpecies",
        content: RedlineObjectSpecies,
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

  // src/maintain.ts
  function maintain(user, fatesystem) {
    user.资源.生命值 = Math.min(Math.max(safeParseFloat(user.资源.生命值), 0), safeParseFloat(user.资源.生命值上限));
    user.资源.法力值 = Math.min(Math.max(safeParseFloat(user.资源.法力值), 0), safeParseFloat(user.资源.法力值上限));
    user.资源.体力值 = Math.min(Math.max(safeParseFloat(user.资源.体力值), 0), safeParseFloat(user.资源.体力值上限));
    user.属性.力量 = Math.min(Math.max(safeParseFloat(user.属性.力量), 0), 20);
    user.属性.敏捷 = Math.min(Math.max(safeParseFloat(user.属性.敏捷), 0), 20);
    user.属性.体质 = Math.min(Math.max(safeParseFloat(user.属性.体质), 0), 20);
    user.属性.智力 = Math.min(Math.max(safeParseFloat(user.属性.智力), 0), 20);
    user.属性.精神 = Math.min(Math.max(safeParseFloat(user.属性.精神), 0), 20);
    const RedlineObject = fatesystem.命定之人;
    for (const name in RedlineObject) {
      const CurrentObject = RedlineObject[name];
      CurrentObject.好感度 = Math.max(-100, Math.min(CurrentObject.好感度, 100));
    }
    user.状态.等级 = Math.max(0, Math.min(user.状态.等级, 25));
    user.状态.升级所需经验 = JOB_LEVEL_XP_TABLE[user.状态.等级];
    const currentLevel = user.状态.等级;
    if (currentLevel > 0) {
      const requiredXpForPreviousLevel = JOB_LEVEL_XP_TABLE[currentLevel - 1];
      if (safeParseFloat(user.状态.累计经验值) < requiredXpForPreviousLevel) {
        user.状态.累计经验值 = requiredXpForPreviousLevel;
      }
    }
  }

  // src/main-controller.ts
  function Main_processes(variables) {
    const user = variables.stat_data.角色;
    const property = variables.stat_data.财产;
    const world = variables.stat_data.世界;
    const eventchain = variables.stat_data.事件链;
    const fatesystem = variables.stat_data.命定系统;
    if (!user || !property || !world || !eventchain || !fatesystem) {
      console.error("Core data missing, script terminated");
      return;
    }
    maintain(user, fatesystem);
    uninject();
    experiencegrowth(user);
    CurrencySystem(property);
    inforead(world, fatesystem, user);
    event_chain(eventchain, world);
    event_chain_inject();
  }
  eventOn("mag_variable_update_ended", Main_processes);
  eventOn(tavern_events.GENERATION_AFTER_COMMANDS, event_chain_inject);
  eventOn(tavern_events.MESSAGE_SENT, event_chain_inject);
  eventOn(tavern_events.MESSAGE_UPDATED, event_chain_inject);
  eventOnButton("重新处理变量", Main_processes);
})();
