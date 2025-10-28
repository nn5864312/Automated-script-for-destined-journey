import { EventChain, World } from './types';
import { tobool } from './utils';

declare function uninjectPrompts(ids: string[]): void;
declare function injectPrompts(prompts: any[]): void;
declare function getVariables(option: VariableOptionNormal): Record<string, any>;
declare function insertOrAssignVariables(variables: Record<string, any>, option: VariableOptionNormal): Record<string, any>;
declare function deleteVariable(variable_path: string, option: VariableOptionNormal): { variables: Record<string, any>; delete_occurred: boolean };
type VariableOptionNormal = {
  type: 'chat' | 'character' | 'preset' | 'global' | 'message';
  message_id?: number | 'latest';
};

export function event_chain(eventchain: EventChain, world: World): void {
  const star = tobool(eventchain.开启);
  const end = tobool(eventchain.结束);
  const recall_time = tobool(eventchain.琥珀事件);
  const title = eventchain.标题;
  const step = eventchain.阶段;
  const completed_events = eventchain.已完成事件;
  const variables = getVariables({ type: 'chat' });
  uninjectPrompts(["completed_events"]);
  insertOrAssignVariables(
    { event_chain: { completed_events: completed_events } },
    { type: 'message' });
  if (star === true) {
    if (variables?.event_chain?.time !== null) {
      insertOrAssignVariables(
        { event_chain: { time: world.时间 } },
        { type: 'chat' }
      );
    };
    insertOrAssignVariables(
      { event_chain: { cache: `当前事件为${title}，当前步骤为${step}` } },
      { type: 'message' });
  };
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
    deleteVariable("event_chain.time", { type: 'chat' });
  }
}
export function event_chain_inject() {
  const variables = getVariables({ type: 'message', message_id: -2 });
  if (variables.event_chain.completed_events !== null) {
    const completed_events = variables.event_chain.completed_events
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
    const Prompts = variables.event_chain.cache
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