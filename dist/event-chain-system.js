"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.event_chain = event_chain;
function event_chain(eventchain, world) {
    var _a;
    uninjectPrompts(["event_chain_end"]);
    injectPrompts([
        {
            id: "event_chain_end",
            content: eventchain.已完成事件,
            position: "none",
            depth: 0,
            role: "system",
            should_scan: true,
        },
    ]);
    if (eventchain.开启 == true) {
        eventchain.开启 = true;
        deleteVariable("event_chain.time", { type: 'chat' });
        insertOrAssignVariables({ event_chain: { time: world.时间 } }, { type: 'chat' });
        // 清除之前的事件链注入
        uninjectPrompts(["event_chain"]);
        uninjectPrompts(["event_chain_tips"]);
        const title = eventchain.标题;
        const step = eventchain.阶段;
        // 注入当前事件链状态
        injectPrompts([
            {
                id: "event_chain",
                content: `当前事件为${title}，当前步骤为${step}`,
                position: "none",
                depth: 0,
                role: "system",
                should_scan: true,
            },
        ]);
        // 注入事件链激活提示
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
    // 检查是否结束事件链
    if (eventchain.结束 == true) {
        eventchain.结束 = true;
        const title = eventchain.标题;
        if (eventchain.琥珀事件 == true) {
            eventchain.琥珀事件 = true;
            // 使用变量系统获取事件链时间
            const variables = getVariables({ type: 'chat' });
            const time = (_a = variables === null || variables === void 0 ? void 0 : variables.event_chain) === null || _a === void 0 ? void 0 : _a.time;
            if (time !== undefined && time !== null) {
                world.时间 = time;
            }
        }
        uninjectPrompts(["event_chain"]);
        uninjectPrompts(["event_chain_tips"]);
        eventchain.已完成事件.push(`已完成事件${title}`);
        eventchain.标题 = "";
        eventchain.阶段 = "";
        eventchain.结束 = false;
        eventchain.开启 = false;
        eventchain.琥珀事件 = false;
        deleteVariable("event_chain.time", { type: 'chat' });
    }
}
