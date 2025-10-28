"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.event_chain = event_chain;
const utils_1 = require("./utils");
function event_chain(eventchain, world) {
    var _a, _b;
    const star = (0, utils_1.tobool)(eventchain.开启);
    const end = (0, utils_1.tobool)(eventchain.结束);
    const recall_time = (0, utils_1.tobool)(eventchain.琥珀事件);
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
