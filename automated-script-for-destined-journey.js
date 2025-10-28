/**
 * Automated Script for Destined Journey
 * 命定之旅自动化脚本
 * 
 * @version 1.0.4
 * @date 2025-10-28
 * @license MIT
 * 
 * 这是一个自动生成的合并文件，包含以下模块：
 * - utils.js
- config.js
- maintain.js
- experience-level.js
- currency-system.js
- info-injection.js
- event-chain-system-current.js
- event-chain-system-inject.js
- main-controller.js
 */

(function() {
  'use strict';

// ============================================================
// utils.js
// ============================================================
/**
 * 安全的浮点数解析函数
 * @param {*} value - 要解析的值
 * @returns {number} - 解析后的数值，如果解析失败则返回0
 */
function safeParseFloat(value) {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
}
/**
 * 解除注入的提示信息
 * @param {Array<string>} idsToRemove - 要移除的ID数组
 */
function uninject() {
    const idsToRemove = ["AP+", "Location", "Time", "LV+"];
    uninjectPrompts(idsToRemove);
}
function tobool(value) {
    if (typeof value === 'boolean') {
        return value;
    }
    if (typeof value === 'string') {
        return value.toLowerCase() === 'true';
    }
    return Boolean(value);
}

// ============================================================
// config.js
// ============================================================
// 里程碑等级配置
const MILESTONE_LEVELS = {
    5: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: '第二层级/中坚' },
    9: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: '第三层级/精英' },
    13: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: '第四层级/史诗' },
    17: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: '第五层级/传说' },
    21: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: '第六层级/神话' },
    25: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: '第七层级/登神' }
};
// 职业等级经验表
const JOB_LEVEL_XP_TABLE = {
    0: 0, 1: 15, 2: 55, 3: 130, 4: 290, 5: 640, 6: 1120, 7: 1750, 8: 2710, 9: 3385,
    10: 4225, 11: 5215, 12: 6475, 13: 7515, 14: 8747, 15: 10187, 16: 11979, 17: 12574, 18: 13294, 19: 14149,
    20: 15349, 21: 15601, 22: 15865, 23: 16279, 24: 17500, 25: 1145141919810
};
// 核心游戏配置
const GAME_CONFIG = {
    GP_TO_SP: 100,
    SP_TO_CP: 100,
    AP_Acquisition_Level: 1,
};

// ============================================================
// maintain.js
// ============================================================
function maintain(user, fatesystem, fatesystemold) {
    user.资源.生命值 = Math.min(Math.max(safeParseFloat(user.资源.生命值), 0), safeParseFloat(user.资源.生命值上限));
    user.资源.法力值 = Math.min(Math.max(safeParseFloat(user.资源.法力值), 0), safeParseFloat(user.资源.法力值上限));
    user.资源.体力值 = Math.min(Math.max(safeParseFloat(user.资源.体力值), 0), safeParseFloat(user.资源.体力值上限));
    user.属性.力量 = Math.min(Math.max(safeParseFloat(user.属性.力量), 0), 20);
    user.属性.敏捷 = Math.min(Math.max(safeParseFloat(user.属性.敏捷), 0), 20);
    user.属性.体质 = Math.min(Math.max(safeParseFloat(user.属性.体质), 0), 20);
    user.属性.智力 = Math.min(Math.max(safeParseFloat(user.属性.智力), 0), 20);
    user.属性.精神 = Math.min(Math.max(safeParseFloat(user.属性.精神), 0), 20);
    const RedlineObject = fatesystem.命定之人;
    const RedlineObjectold = fatesystemold.命定之人;
    for (const name in RedlineObject) {
        const CurrentObject = RedlineObject[name];
        const CurrentFavorability = safeParseFloat(CurrentObject.好感度);
        const OldObject = RedlineObjectold[name];
        if (OldObject) {
            const OldFavorability = safeParseFloat(OldObject.好感度);
            let diff = CurrentFavorability - OldFavorability;
            if (diff > 5) {
                CurrentObject.好感度 = OldFavorability + 5;
            }
            else if (diff < -5) {
                CurrentObject.好感度 = OldFavorability - 5;
            }
        }
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

// ============================================================
// experience-level.js
// ============================================================
function experiencegrowth(user) {
    const currentLevel = user.状态.等级;
    let hasLeveledUp = false;
    // 升级处理循环
    while (safeParseFloat(user.状态.累计经验值) >=
        safeParseFloat(user.状态.升级所需经验)) {
        if (!JOB_LEVEL_XP_TABLE[user.状态.等级] || safeParseFloat(user.状态.累计经验值) >= 1145141919810) {
            break;
        }
        user.状态.等级 = safeParseFloat(user.状态.等级) + 1;
        hasLeveledUp = true;
        user.状态.升级所需经验 = JOB_LEVEL_XP_TABLE[user.状态.等级];
        // 检查是否获得属性点
        if (user.状态.等级 % GAME_CONFIG.AP_Acquisition_Level === 0) {
            user.属性.属性点 = safeParseFloat(user.属性.属性点) + 1;
            injectPrompts([
                {
                    id: "AP+",
                    position: "in_chat",
                    role: "system",
                    depth: 0,
                    content: "core_system: The {{user}} has reached a specific level and obtained attribute points. Guide the {{user}} to use attribute points",
                    should_scan: true,
                },
            ]);
        }
        // 检查里程碑等级
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
    // 如果升级了，注入升级提示
    if (hasLeveledUp) {
        injectPrompts([
            {
                id: "LV+",
                position: "in_chat",
                role: "system",
                depth: 0,
                content: `core_system: The {{user}} level increased from ${currentLevel} to ${user.状态.等级}`,
                should_scan: true,
            },
        ]);
    }
}

// ============================================================
// currency-system.js
// ============================================================
/**
 * 货币系统模块
 * 当某种货币被扣成负数时，自动从更高层级的货币中换算抵扣
 * 如果所有货币都不足，则产生欠债（负CP）
 *
 * @param {Object} property - 财产对象，包含货币信息
 */
function CurrencySystem(property) {
    let GP = safeParseFloat(property.货币.金币);
    let SP = safeParseFloat(property.货币.银币);
    let CP = safeParseFloat(property.货币.铜币);
    function handleCurrencyExchange() {
        let currencyCleared = false;
        // GP购买处理：GP被扣成负时的换算逻辑
        // 逻辑：优先用SP抵扣 → CP转SP循环
        if (GP < 0 && !currencyCleared) {
            let gpDeficit = Math.abs(GP);
            // 阶段1：优先用SP抵扣 (1GP = 100SP)
            if (SP > 0) {
                let spCanCover = Math.floor(SP / GAME_CONFIG.GP_TO_SP);
                if (spCanCover >= gpDeficit) {
                    // SP足够抵扣
                    SP -= gpDeficit * GAME_CONFIG.GP_TO_SP;
                    GP = 0;
                    gpDeficit = 0;
                }
                else {
                    // SP不足，用完所有SP
                    gpDeficit -= spCanCover;
                    SP = SP % GAME_CONFIG.GP_TO_SP;
                }
            }
            // 阶段2：SP不足时，将CP转换为SP循环抵扣
            while (gpDeficit > 0 && CP > 0) {
                // 计算需要多少CP来换1GP (1GP = 100SP * 100CP = 10000CP)
                let cpNeeded = GAME_CONFIG.GP_TO_SP * GAME_CONFIG.SP_TO_CP;
                if (CP >= cpNeeded) {
                    // 将CP转换为GP
                    CP -= cpNeeded;
                    GP += 1;
                    gpDeficit -= 1;
                }
                else {
                    // CP不足以换1GP，将剩余CP转换为SP
                    SP = Math.floor(CP / GAME_CONFIG.SP_TO_CP);
                    CP = CP % GAME_CONFIG.SP_TO_CP;
                    // 用新获得的SP抵扣GP
                    let spCanCover = Math.floor(SP / GAME_CONFIG.GP_TO_SP);
                    if (spCanCover >= gpDeficit) {
                        SP -= gpDeficit * GAME_CONFIG.GP_TO_SP;
                        GP = 0;
                        gpDeficit = 0;
                    }
                    else {
                        gpDeficit -= spCanCover;
                        SP = SP % GAME_CONFIG.GP_TO_SP;
                    }
                    break; // CP已用完，退出循环
                }
            }
            // 阶段3：所有货币都耗尽，将GP债务转换为CP债务
            if (gpDeficit > 0) {
                CP = -(gpDeficit * GAME_CONFIG.GP_TO_SP * GAME_CONFIG.SP_TO_CP);
                GP = 0;
                currencyCleared = true;
            }
        }
        // SP购买处理：SP被扣成负时的换算逻辑
        // 逻辑：优先用GP抵扣 → CP转GP循环
        if (SP < 0 && !currencyCleared) {
            let spDeficit = Math.abs(SP);
            // 阶段1：优先用GP抵扣 (1GP = 100SP)
            if (GP > 0) {
                let gpCanCover = GP * GAME_CONFIG.GP_TO_SP;
                if (gpCanCover >= spDeficit) {
                    // GP足够抵扣
                    let gpNeeded = Math.ceil(spDeficit / GAME_CONFIG.GP_TO_SP);
                    GP -= gpNeeded;
                    SP = gpNeeded * GAME_CONFIG.GP_TO_SP - spDeficit;
                    spDeficit = 0;
                }
                else {
                    // GP不足，用完所有GP
                    spDeficit -= gpCanCover;
                    GP = 0;
                }
            }
            // 阶段2：GP不足时，将CP转换为GP循环抵扣
            while (spDeficit > 0 && CP > 0) {
                // 计算需要多少CP来换1GP (1GP = 100SP * 100CP = 10000CP)
                let cpNeeded = GAME_CONFIG.GP_TO_SP * GAME_CONFIG.SP_TO_CP;
                if (CP >= cpNeeded) {
                    // 将CP转换为GP
                    CP -= cpNeeded;
                    GP = 1;
                    // 用新获得的GP抵扣SP
                    let gpCanCover = GP * GAME_CONFIG.GP_TO_SP;
                    if (gpCanCover >= spDeficit) {
                        let gpNeeded = Math.ceil(spDeficit / GAME_CONFIG.GP_TO_SP);
                        GP -= gpNeeded;
                        SP = gpNeeded * GAME_CONFIG.GP_TO_SP - spDeficit;
                        spDeficit = 0;
                    }
                    else {
                        spDeficit -= gpCanCover;
                        GP = 0;
                    }
                }
                else {
                    // CP不足以换1GP，退出循环
                    break;
                }
            }
            // 阶段3：所有货币都耗尽，将SP债务转换为CP债务
            if (spDeficit > 0) {
                CP = -(spDeficit * GAME_CONFIG.SP_TO_CP);
                SP = 0;
                currencyCleared = true;
            }
        }
        // CP购买处理：CP被扣成负时的换算逻辑
        // 逻辑：优先用SP抵扣 → GP转SP循环
        if (CP < 0 && !currencyCleared) {
            let cpDeficit = Math.abs(CP);
            // 阶段1：优先用SP抵扣 (1SP = 100CP)
            if (SP > 0) {
                let spCanCover = SP * GAME_CONFIG.SP_TO_CP;
                if (spCanCover >= cpDeficit) {
                    // SP足够抵扣
                    let spNeeded = Math.ceil(cpDeficit / GAME_CONFIG.SP_TO_CP);
                    SP -= spNeeded;
                    CP = spNeeded * GAME_CONFIG.SP_TO_CP - cpDeficit;
                    cpDeficit = 0;
                }
                else {
                    // SP不足，用完所有SP
                    cpDeficit -= spCanCover;
                    SP = 0;
                }
            }
            // 阶段2：SP不足时，将GP转换为SP循环抵扣
            while (cpDeficit > 0 && GP > 0) {
                // 将1GP转换为100SP
                GP -= 1;
                SP = GAME_CONFIG.GP_TO_SP;
                // 用新获得的SP抵扣CP
                let spCanCover = SP * GAME_CONFIG.SP_TO_CP;
                if (spCanCover >= cpDeficit) {
                    // 新获得的SP足够抵扣剩余债务
                    let spNeeded = Math.ceil(cpDeficit / GAME_CONFIG.SP_TO_CP);
                    SP -= spNeeded;
                    CP = spNeeded * GAME_CONFIG.SP_TO_CP - cpDeficit;
                    cpDeficit = 0;
                }
                else {
                    // 新获得的SP仍不足，用完后继续循环
                    cpDeficit -= spCanCover;
                    SP = 0;
                }
            }
            // 阶段3：所有货币都耗尽，CP保持负值表示欠债
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

// ============================================================
// info-injection.js
// ============================================================
/**
 * 信息读取与注入模块
 * @param {Object} world - 世界对象
 */
function inforead(world) {
    // 注入地点信息
    injectPrompts([
        {
            id: "Location",
            content: world.地点,
            position: "none",
            depth: 0,
            role: "system",
            should_scan: true,
        },
    ]);
    // 注入时间信息
    injectPrompts([
        {
            id: "Time",
            content: world.时间,
            position: "none",
            depth: 0,
            role: "system",
            should_scan: true,
        },
    ]);
}

// ============================================================
// event-chain-system-current.js
// ============================================================
function event_chain(eventchain, world) {
    var _a, _b;
    const star = tobool(eventchain.开启);
    const end = tobool(eventchain.结束);
    const recall_time = tobool(eventchain.琥珀事件);
    const title = eventchain.标题;
    const step = eventchain.阶段;
    const completed_events = eventchain.已完成事件;
    const variables = getVariables({ type: 'chat' });
    uninjectPrompts(["completed_events"]);
    insertOrAssignVariables({ event_chain: { completed_events: completed_events } }, { type: 'message' });
    if (star === true) {
        if (((_a = variables === null || variables === void 0 ? void 0 : variables.event_chain) === null || _a === void 0 ? void 0 : _a.time) !== null) {
            insertOrAssignVariables({ event_chain: { time: world.时间 } }, { type: 'chat' });
        }
        ;
        insertOrAssignVariables({ event_chain: { cache: `当前事件为${title}，当前步骤为${step}` } }, { type: 'message' });
    }
    ;
    if (end === true) {
        if (recall_time === true) {
            const time = (_b = variables === null || variables === void 0 ? void 0 : variables.event_chain) === null || _b === void 0 ? void 0 : _b.time;
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
        deleteVariable("event_chain.time", { type: 'chat' });
    }
}

// ============================================================
// event-chain-system-inject.js
// ============================================================
function event_chain_inject() {
    const variables = getVariables({ type: 'message', message_id: -2 });
    if (variables.event_chain.completed_events !== null) {
        const completed_events = variables.event_chain.completed_events;
        injectPrompts([
            {
                id: "event_chain_end",
                content: completed_events,
                position: "none",
                depth: 0,
                role: "system",
                should_scan: true,
            },
        ]);
    }
    if (variables.event_chain.cache !== null) {
        const Prompts = variables.event_chain.cache;
        injectPrompts([
            {
                id: "completed_events",
                content: Prompts,
                position: "none",
                depth: 0,
                role: "system",
                should_scan: true,
            },
        ]);
        injectPrompts([
            {
                id: "event_chain_tips",
                content: `core_system:The event chain has been activated, please note<event_chain>`,
                position: "in_chat",
                depth: 0,
                role: "system",
                should_scan: true,
            },
        ]);
    }
}

// ============================================================
// main-controller.js
// ============================================================
function Main_processes(variables) {
    var _a;
    const user = variables.stat_data.角色;
    const property = variables.stat_data.财产;
    const world = variables.stat_data.世界;
    const eventchain = variables.stat_data.事件链;
    const fatesystem = variables.stat_data.命定系统;
    const fatesystemold = ((_a = variables.display_data) === null || _a === void 0 ? void 0 : _a.命定系统) || {};
    if (!user || !property || !world || !eventchain || !fatesystem) {
        console.error("Core data missing, script terminated");
        return;
    }
    // 按照顺序执行模块
    maintain(user, fatesystem, fatesystemold);
    uninject();
    experiencegrowth(user);
    CurrencySystem(property);
    inforead(world);
    event_chain(eventchain, world);
}
// ============================ [事件监听] ============================
eventOn('mag_variable_update_ended', Main_processes);
eventOn(tavern_events.GENERATION_AFTER_COMMANDS, event_chain_inject);
eventOnButton('重新处理变量', Main_processes);


})();