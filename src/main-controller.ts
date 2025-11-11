import { CurrencySystem } from './currency-system';
import { event_chain } from './event-chain-system-current';
import { event_chain_inject } from './event-chain-system-inject';
import { experiencegrowth } from './experience-level';
import { inforead } from './info-injection';
import { maintain } from './maintain';
import { Variables } from './types';
import { uninject } from './utils';
declare function eventOn(event: string, callback: (variables: Variables) => void): void;
declare function eventOnButton(button: string, callback: (variables: Variables) => void): void;
declare const tavern_events: {
  GENERATION_AFTER_COMMANDS: 'GENERATION_AFTER_COMMANDS';
  MESSAGE_SENT: 'message_sent';
  MESSAGE_UPDATED: 'message_updated';
};
function Main_processes(variables: Variables) {
  const user = variables.stat_data.角色;
  const property = variables.stat_data.财产;
  const world = variables.stat_data.世界;
  const eventchain = variables.stat_data.事件链;
  const fatesystem = variables.stat_data.命定系统;

  if (!user || !property || !world || !eventchain || !fatesystem) {
    console.error('Core data missing, script terminated');
    return;
  }
  // 按照顺序执行模块
  maintain(user, fatesystem);
  uninject();
  experiencegrowth(user);
  CurrencySystem(property);
  inforead(world, fatesystem, user);
  event_chain(eventchain, world);
  event_chain_inject();
}

// ============================ [事件监听] ============================
eventOn('mag_variable_update_ended', Main_processes);
eventOn(tavern_events.GENERATION_AFTER_COMMANDS, event_chain_inject);
eventOn(tavern_events.MESSAGE_SENT, event_chain_inject);
eventOn(tavern_events.MESSAGE_UPDATED, event_chain_inject);
eventOnButton('重新处理变量', Main_processes);
