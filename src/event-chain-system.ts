/**
 * 事件链处理模块
 * @param {Object} eventchain - 事件链对象
 * @param {Object} world - 世界对象
 */
import { EventChain, World } from './types';
import { tobool } from './utils';

declare function uninjectPrompts(ids: string[]): void;
declare function injectPrompts(prompts: any[]): void;
declare function getVariables(option: { type: 'chat' | 'character' | 'preset' | 'global' }): Record<string, any>;
declare function insertOrAssignVariables(variables: Record<string, any>, option: { type: 'chat' | 'character' | 'preset' | 'global' }): Record<string, any>;
declare function deleteVariable(variable_path: string, option: { type: 'chat' | 'character' | 'preset' | 'global' }): { variables: Record<string, any>; delete_occurred: boolean };

export function event_chain(eventchain: EventChain, world: World): void {
  const star = tobool(eventchain.开启);
  const end = tobool(eventchain.结束);
  const recall_time = tobool(eventchain.琥珀事件);
  const variables = getVariables({ type: 'chat' });
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
  if (star === true) {
    if(!variables?.event_chain?.time){
    insertOrAssignVariables(
      { event_chain: { time: world.时间 } },
      { type: 'chat' }
    );};
    if(!variables?.event_chain?.counter){
    insertOrAssignVariables(
      { event_chain: { counter: 1 } },
      { type: 'chat' }
    );};
    let counter = variables?.event_chain?.counter;
    const title = eventchain.标题;
    const step = eventchain.阶段;
    // 注入当前事件链状态
    injectPrompts([
      {
        id: `event_chain${counter}`,
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
    counter++;
    insertOrAssignVariables(
      { event_chain: { counter: counter } },
      { type: 'chat' }
    );
  };
  // 检查是否结束事件链
  if (end === true) {
    const title = eventchain.标题;
    if (recall_time === true) {
      // 使用变量系统获取事件链时间
      const time = variables?.event_chain?.time;
      if (time !== null) {
        world.时间 = time;
      }
    }
    // 获取当前 counter 值以移除对应的 prompts
    const counter = variables?.event_chain?.counter;
    if (counter !== null) {
      for (let i = 1; i < counter; i++) {
        uninjectPrompts([`event_chain${i}`]);
        uninjectPrompts([`event_chain_tips${i}`]);
      }
    }
    eventchain.已完成事件.push(`已完成事件${title}`);
    eventchain.标题 = "";
    eventchain.阶段 = "";
    eventchain.结束 = false;
    eventchain.开启 = false;
    eventchain.琥珀事件 = false;
    deleteVariable("event_chain.time", { type: 'chat' });
    deleteVariable("event_chain.counter", { type: 'chat' });
  }
}
