"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const experience_level_1 = require("./experience-level");
const currency_system_1 = require("./currency-system");
const info_injection_1 = require("./info-injection");
const event_chain_system_current_1 = require("./event-chain-system-current");
const event_chain_system_inject_1 = require("./event-chain-system-inject");
const maintain_1 = require("./maintain");
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
    (0, maintain_1.maintain)(user, fatesystem, fatesystemold);
    (0, utils_1.uninject)();
    (0, experience_level_1.experiencegrowth)(user);
    (0, currency_system_1.CurrencySystem)(property);
    (0, info_injection_1.inforead)(world);
    (0, event_chain_system_current_1.event_chain)(eventchain, world);
}
// ============================ [事件监听] ============================
eventOn('mag_variable_update_ended', Main_processes);
eventOn(tavern_events.GENERATION_AFTER_COMMANDS, event_chain_system_inject_1.event_chain_inject);
eventOnButton('重新处理变量', Main_processes);
