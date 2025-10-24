"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.experiencegrowth = experiencegrowth;
const config_1 = require("./config");
const utils_1 = require("./utils");
function experiencegrowth(user) {
    const currentLevel = user.状态.等级;
    let hasLeveledUp = false;
    // 升级处理循环
    while ((0, utils_1.safeParseFloat)(user.状态.累计经验值) >=
        (0, utils_1.safeParseFloat)(user.状态.升级所需经验)) {
        if (!config_1.JOB_LEVEL_XP_TABLE[user.状态.等级] || (0, utils_1.safeParseFloat)(user.状态.累计经验值) >= 1145141919810) {
            break;
        }
        user.状态.等级 = (0, utils_1.safeParseFloat)(user.状态.等级) + 1;
        hasLeveledUp = true;
        user.状态.升级所需经验 = config_1.JOB_LEVEL_XP_TABLE[user.状态.等级];
        // 检查是否获得属性点
        if (user.状态.等级 % config_1.GAME_CONFIG.AP_Acquisition_Level === 0) {
            user.属性.属性点 = (0, utils_1.safeParseFloat)(user.属性.属性点) + 1;
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
        const milestone = config_1.MILESTONE_LEVELS[user.状态.等级];
        if (milestone) {
            user.属性.力量 = (0, utils_1.safeParseFloat)(user.属性.力量) + milestone.strength;
            user.属性.敏捷 = (0, utils_1.safeParseFloat)(user.属性.敏捷) + milestone.agility;
            user.属性.体质 = (0, utils_1.safeParseFloat)(user.属性.体质) + milestone.constitution;
            user.属性.智力 = (0, utils_1.safeParseFloat)(user.属性.智力) + milestone.intelligence;
            user.属性.精神 = (0, utils_1.safeParseFloat)(user.属性.精神) + milestone.spirit;
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
