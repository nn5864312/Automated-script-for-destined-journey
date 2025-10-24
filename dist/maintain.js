"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maintain = maintain;
const utils_1 = require("./utils");
const config_1 = require("./config");
function maintain(user, fatesystem, fatesystemold) {
    user.资源.生命值 = Math.min(Math.max((0, utils_1.safeParseFloat)(user.资源.生命值), 0), (0, utils_1.safeParseFloat)(user.资源.生命值上限));
    user.资源.法力值 = Math.min(Math.max((0, utils_1.safeParseFloat)(user.资源.法力值), 0), (0, utils_1.safeParseFloat)(user.资源.法力值上限));
    user.资源.体力值 = Math.min(Math.max((0, utils_1.safeParseFloat)(user.资源.体力值), 0), (0, utils_1.safeParseFloat)(user.资源.体力值上限));
    user.属性.力量 = Math.min(Math.max((0, utils_1.safeParseFloat)(user.属性.力量), 0), 20);
    user.属性.敏捷 = Math.min(Math.max((0, utils_1.safeParseFloat)(user.属性.敏捷), 0), 20);
    user.属性.体质 = Math.min(Math.max((0, utils_1.safeParseFloat)(user.属性.体质), 0), 20);
    user.属性.智力 = Math.min(Math.max((0, utils_1.safeParseFloat)(user.属性.智力), 0), 20);
    user.属性.精神 = Math.min(Math.max((0, utils_1.safeParseFloat)(user.属性.精神), 0), 20);
    const RedlineObject = fatesystem.红线对象;
    const RedlineObjectold = fatesystemold.红线对象;
    for (const name in RedlineObject) {
        const CurrentObject = RedlineObject[name];
        const CurrentFavorability = (0, utils_1.safeParseFloat)(CurrentObject.好感度);
        const OldObject = RedlineObjectold[name];
        if (OldObject) {
            const OldFavorability = (0, utils_1.safeParseFloat)(OldObject.好感度);
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
    user.状态.升级所需经验 = config_1.JOB_LEVEL_XP_TABLE[user.状态.等级];
    const currentLevel = user.状态.等级;
    if (currentLevel > 0) {
        const requiredXpForPreviousLevel = config_1.JOB_LEVEL_XP_TABLE[currentLevel - 1];
        if ((0, utils_1.safeParseFloat)(user.状态.累计经验值) < requiredXpForPreviousLevel) {
            user.状态.累计经验值 = requiredXpForPreviousLevel;
        }
    }
}
