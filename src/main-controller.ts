import { Variables } from './types';
import { uninject } from './utils';
import { experiencegrowth } from './experience-level';
import { CurrencySystem } from './currency-system';
import { inforead } from './info-injection';
import { event_chain } from './event-chain-system';
import { maintain } from './maintain';

declare function eventOn(event: string, callback: (variables: Variables) => void): void;
declare function eventOnButton(button: string, callback: (variables: Variables) => void): void;

function Main_processes(variables: Variables) {
  const user = variables.stat_data.角色;
  const property = variables.stat_data.财产;
  const world = variables.stat_data.世界;
  const eventchain = variables.stat_data.事件链;
  const fatesystem = variables.stat_data.命运系统;
  const fatesystemold = variables.display_data?.命运系统 || {};

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
eventOnButton('重新处理变量', Main_processes);