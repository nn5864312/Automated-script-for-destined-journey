// ============================================================
// Automated Script for Destined Journey
// 命定的异世界开发之旅自动化脚本
// ============================================================
// Version: 1.1.4
// Build Date: 2025-10-31 15:59:55
// Author: The-poem-of-destiny
// License: MIT
// Repository: git+https://github.com/The-poem-of-destiny/Automated-script-for-destined-journey.git
// ============================================================

"use strict";
(() => {
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

  // src/config.ts
  var MILESTONE_LEVELS = {
    5: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: "\u7B2C\u4E8C\u5C42\u7EA7/\u4E2D\u575A" },
    9: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: "\u7B2C\u4E09\u5C42\u7EA7/\u7CBE\u82F1" },
    13: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: "\u7B2C\u56DB\u5C42\u7EA7/\u53F2\u8BD7" },
    17: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: "\u7B2C\u4E94\u5C42\u7EA7/\u4F20\u8BF4" },
    21: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: "\u7B2C\u516D\u5C42\u7EA7/\u795E\u8BDD" },
    25: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: "\u7B2C\u4E03\u5C42\u7EA7/\u767B\u795E" }
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

  // src/experience-level.ts
  function experiencegrowth(user) {
    const currentLevel = user.\u72B6\u6001.\u7B49\u7EA7;
    let hasLeveledUp = false;
    while (safeParseFloat(user.\u72B6\u6001.\u7D2F\u8BA1\u7ECF\u9A8C\u503C) >= safeParseFloat(user.\u72B6\u6001.\u5347\u7EA7\u6240\u9700\u7ECF\u9A8C)) {
      if (!JOB_LEVEL_XP_TABLE[user.\u72B6\u6001.\u7B49\u7EA7] || safeParseFloat(user.\u72B6\u6001.\u7D2F\u8BA1\u7ECF\u9A8C\u503C) >= 1145141919810) {
        break;
      }
      user.\u72B6\u6001.\u7B49\u7EA7 = safeParseFloat(user.\u72B6\u6001.\u7B49\u7EA7) + 1;
      hasLeveledUp = true;
      user.\u72B6\u6001.\u5347\u7EA7\u6240\u9700\u7ECF\u9A8C = JOB_LEVEL_XP_TABLE[user.\u72B6\u6001.\u7B49\u7EA7];
      if (user.\u72B6\u6001.\u7B49\u7EA7 % GAME_CONFIG.AP_Acquisition_Level === 0) {
        user.\u5C5E\u6027.\u5C5E\u6027\u70B9 = safeParseFloat(user.\u5C5E\u6027.\u5C5E\u6027\u70B9) + 1;
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
      const milestone = MILESTONE_LEVELS[user.\u72B6\u6001.\u7B49\u7EA7];
      if (milestone) {
        user.\u5C5E\u6027.\u529B\u91CF = safeParseFloat(user.\u5C5E\u6027.\u529B\u91CF) + milestone.strength;
        user.\u5C5E\u6027.\u654F\u6377 = safeParseFloat(user.\u5C5E\u6027.\u654F\u6377) + milestone.agility;
        user.\u5C5E\u6027.\u4F53\u8D28 = safeParseFloat(user.\u5C5E\u6027.\u4F53\u8D28) + milestone.constitution;
        user.\u5C5E\u6027.\u667A\u529B = safeParseFloat(user.\u5C5E\u6027.\u667A\u529B) + milestone.intelligence;
        user.\u5C5E\u6027.\u7CBE\u795E = safeParseFloat(user.\u5C5E\u6027.\u7CBE\u795E) + milestone.spirit;
        user.\u72B6\u6001.\u751F\u547D\u5C42\u7EA7 = milestone.tier;
      }
    }
    if (hasLeveledUp) {
      injectPrompts([
        {
          id: "LV+",
          position: "in_chat",
          role: "system",
          depth: 0,
          content: `core_system: The {{user}} level increased from ${currentLevel} to ${user.\u72B6\u6001.\u7B49\u7EA7}`,
          should_scan: true
        }
      ]);
    }
  }

  // src/currency-system.ts
  function CurrencySystem(property) {
    let GP = safeParseFloat(property.\u8D27\u5E01.\u91D1\u5E01);
    let SP = safeParseFloat(property.\u8D27\u5E01.\u94F6\u5E01);
    let CP = safeParseFloat(property.\u8D27\u5E01.\u94DC\u5E01);
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
    property.\u8D27\u5E01.\u91D1\u5E01 = Math.max(0, Math.floor(GP));
    property.\u8D27\u5E01.\u94F6\u5E01 = Math.max(0, Math.floor(SP));
    property.\u8D27\u5E01.\u94DC\u5E01 = Math.floor(CP);
  }

  // src/info-injection.ts
  function inforead(world, fatesystem, user) {
    let RedlineObjectSpecies = [];
    if (fatesystem.\u547D\u5B9A\u4E4B\u4EBA) {
      const RedlineObject = fatesystem.\u547D\u5B9A\u4E4B\u4EBA;
      for (const name in RedlineObject) {
        const CurrentObject = RedlineObject[name];
        RedlineObjectSpecies.push(CurrentObject.\u79CD\u65CF);
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
        content: user.\u79CD\u65CF,
        position: "none",
        depth: 0,
        role: "system",
        should_scan: true
      }
    ]);
    injectPrompts([
      {
        id: "Location",
        content: world.\u5730\u70B9,
        position: "none",
        depth: 0,
        role: "system",
        should_scan: true
      }
    ]);
    injectPrompts([
      {
        id: "Time",
        content: world.\u65F6\u95F4,
        position: "none",
        depth: 0,
        role: "system",
        should_scan: true
      }
    ]);
  }

  // src/event-chain-system-current.ts
  function event_chain(eventchain, world) {
    const star = tobool(eventchain.\u5F00\u542F);
    const end = tobool(eventchain.\u7ED3\u675F);
    const recall_time = tobool(eventchain.\u7425\u73C0\u4E8B\u4EF6);
    const title = eventchain.\u6807\u9898;
    const step = eventchain.\u9636\u6BB5;
    const completed_events = eventchain.\u5DF2\u5B8C\u6210\u4E8B\u4EF6;
    const variables = getVariables({ type: "chat" });
    uninjectPrompts(["completed_events"]);
    insertOrAssignVariables(
      { event_chain: { completed_events } },
      { type: "message" }
    );
    if (star === true) {
      if (variables?.event_chain?.time !== null) {
        insertOrAssignVariables(
          { event_chain: { time: world.\u65F6\u95F4 } },
          { type: "chat" }
        );
      }
      ;
      insertOrAssignVariables(
        { event_chain: { cache: `\u5F53\u524D\u4E8B\u4EF6\u4E3A${title}\uFF0C\u5F53\u524D\u6B65\u9AA4\u4E3A${step}` } },
        { type: "message" }
      );
    }
    ;
    if (end === true) {
      if (recall_time === true) {
        const time = variables?.event_chain?.time;
        if (time !== null) {
          world.\u65F6\u95F4 = time;
        }
      }
      uninjectPrompts([`event_chain`]);
      uninjectPrompts([`event_chain_tips`]);
      eventchain.\u5DF2\u5B8C\u6210\u4E8B\u4EF6.push(`\u5DF2\u5B8C\u6210\u4E8B\u4EF6${title}`);
      eventchain.\u6807\u9898 = "";
      eventchain.\u9636\u6BB5 = "";
      eventchain.\u7ED3\u675F = false;
      eventchain.\u5F00\u542F = false;
      eventchain.\u7425\u73C0\u4E8B\u4EF6 = false;
      deleteVariable("event_chain.time", { type: "chat" });
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

  // src/maintain.ts
  function maintain(user, fatesystem, fatesystemold) {
    user.\u8D44\u6E90.\u751F\u547D\u503C = Math.min(Math.max(safeParseFloat(user.\u8D44\u6E90.\u751F\u547D\u503C), 0), safeParseFloat(user.\u8D44\u6E90.\u751F\u547D\u503C\u4E0A\u9650));
    user.\u8D44\u6E90.\u6CD5\u529B\u503C = Math.min(Math.max(safeParseFloat(user.\u8D44\u6E90.\u6CD5\u529B\u503C), 0), safeParseFloat(user.\u8D44\u6E90.\u6CD5\u529B\u503C\u4E0A\u9650));
    user.\u8D44\u6E90.\u4F53\u529B\u503C = Math.min(Math.max(safeParseFloat(user.\u8D44\u6E90.\u4F53\u529B\u503C), 0), safeParseFloat(user.\u8D44\u6E90.\u4F53\u529B\u503C\u4E0A\u9650));
    user.\u5C5E\u6027.\u529B\u91CF = Math.min(Math.max(safeParseFloat(user.\u5C5E\u6027.\u529B\u91CF), 0), 20);
    user.\u5C5E\u6027.\u654F\u6377 = Math.min(Math.max(safeParseFloat(user.\u5C5E\u6027.\u654F\u6377), 0), 20);
    user.\u5C5E\u6027.\u4F53\u8D28 = Math.min(Math.max(safeParseFloat(user.\u5C5E\u6027.\u4F53\u8D28), 0), 20);
    user.\u5C5E\u6027.\u667A\u529B = Math.min(Math.max(safeParseFloat(user.\u5C5E\u6027.\u667A\u529B), 0), 20);
    user.\u5C5E\u6027.\u7CBE\u795E = Math.min(Math.max(safeParseFloat(user.\u5C5E\u6027.\u7CBE\u795E), 0), 20);
    const RedlineObject = fatesystem.\u547D\u5B9A\u4E4B\u4EBA;
    const RedlineObjectold = fatesystemold.\u547D\u5B9A\u4E4B\u4EBA;
    for (const name in RedlineObject) {
      const CurrentObject = RedlineObject[name];
      const CurrentFavorability = safeParseFloat(CurrentObject.\u597D\u611F\u5EA6);
      const OldObject = RedlineObjectold[name];
      if (OldObject) {
        const OldFavorability = safeParseFloat(OldObject.\u597D\u611F\u5EA6);
        let diff = CurrentFavorability - OldFavorability;
        if (diff > 5) {
          CurrentObject.\u597D\u611F\u5EA6 = OldFavorability + 5;
        } else if (diff < -5) {
          CurrentObject.\u597D\u611F\u5EA6 = OldFavorability - 5;
        }
      }
      CurrentObject.\u597D\u611F\u5EA6 = Math.max(-100, Math.min(CurrentObject.\u597D\u611F\u5EA6, 100));
    }
    user.\u72B6\u6001.\u7B49\u7EA7 = Math.max(0, Math.min(user.\u72B6\u6001.\u7B49\u7EA7, 25));
    user.\u72B6\u6001.\u5347\u7EA7\u6240\u9700\u7ECF\u9A8C = JOB_LEVEL_XP_TABLE[user.\u72B6\u6001.\u7B49\u7EA7];
    const currentLevel = user.\u72B6\u6001.\u7B49\u7EA7;
    if (currentLevel > 0) {
      const requiredXpForPreviousLevel = JOB_LEVEL_XP_TABLE[currentLevel - 1];
      if (safeParseFloat(user.\u72B6\u6001.\u7D2F\u8BA1\u7ECF\u9A8C\u503C) < requiredXpForPreviousLevel) {
        user.\u72B6\u6001.\u7D2F\u8BA1\u7ECF\u9A8C\u503C = requiredXpForPreviousLevel;
      }
    }
  }

  // src/main-controller.ts
  function Main_processes(variables) {
    const user = variables.stat_data.\u89D2\u8272;
    const property = variables.stat_data.\u8D22\u4EA7;
    const world = variables.stat_data.\u4E16\u754C;
    const eventchain = variables.stat_data.\u4E8B\u4EF6\u94FE;
    const fatesystem = variables.stat_data.\u547D\u5B9A\u7CFB\u7EDF;
    const fatesystemold = variables.display_data?.\u547D\u5B9A\u7CFB\u7EDF || {};
    if (!user || !property || !world || !eventchain || !fatesystem) {
      console.error("Core data missing, script terminated");
      return;
    }
    maintain(user, fatesystem, fatesystemold);
    uninject();
    experiencegrowth(user);
    CurrencySystem(property);
    inforead(world, fatesystem, user);
    event_chain(eventchain, world);
  }
  eventOn("mag_variable_update_ended", Main_processes);
  eventOn(tavern_events.GENERATION_AFTER_COMMANDS, event_chain_inject);
  eventOnButton("\u91CD\u65B0\u5904\u7406\u53D8\u91CF", Main_processes);
})();
