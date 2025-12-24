/**
 * 命定之诗 - 脚本主入口
 *
 * 监听 MVU 变量框架的 VARIABLE_UPDATE_ENDED 事件，
 * 在变量更新完成后执行各种处理逻辑
 */

import type { MessageVariables } from './types';

// Services
import { processCurrencyExchange } from './services/currency';
import { processEvent } from './services/event';
import { processExperienceAndLevel } from './services/experience';
import { maintainCharacterData } from './services/maintain';
import { processNPCExperienceAndLevel } from './services/npc-experience';

// Injection
import { injectEventPrompts } from './injection/event-prompts';
import { injectGameInfo } from './injection/game-info';

// Utils
import { deepClone, errorCatched, uninject } from './utils';

// Schema
import { Schema } from './zod_schema/schema';

/** date 数据默认值 */
const DefaultDate: MessageVariables['date'] = {
  event: { cache: '', completed_events: [] },
  npcs: {},
  requiresContractForExp: true,
};

/**
 * 变量更新处理函数
 */
const handleVariableUpdate = (data: Mvu.MvuData, data_before_update: Mvu.MvuData): void => {
  // 使用 insertVariables 确保 date 数据存在（仅插入不存在的字段）
  insertVariables({ date: DefaultDate }, { type: 'message' });

  // 在处理前使用 Schema.parse 验证并规范化 stat_data（使用 deepClone 保护原数据）
  data.stat_data = Schema.parse(deepClone(data.stat_data));

  // 获取当前 date 数据
  const currentDate = _.get(data, 'date', DefaultDate) as MessageVariables['date'];
  const oldDate = _.get(data_before_update, 'date', DefaultDate) as MessageVariables['date'];

  // 构造变量引用
  const current: MessageVariables = {
    stat_data: data.stat_data as MessageVariables['stat_data'],
    date: currentDate,
  };
  const old: MessageVariables = {
    stat_data: data_before_update.stat_data as MessageVariables['stat_data'],
    date: oldDate,
  };

  uninject();
  maintainCharacterData(current, old);
  processExperienceAndLevel(current, old);
  processNPCExperienceAndLevel(current, old);
  processCurrencyExchange(current);
  processEvent(current);
  injectGameInfo(current);
  injectEventPrompts(current, old);
};

/**
 * 初始化脚本
 */
const init = async (): Promise<void> => {
  // 等待 MVU 初始化完成
  await waitGlobalInitialized('Mvu');

  // 监听变量更新结束事件
  eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, errorCatched(handleVariableUpdate));
  
  console.log('[命定之诗] 脚本已加载 ฅ\'ω\'ฅ');
  toastr.success('[命定之诗] 脚本已加载 ฅ\'ω\'ฅ');
  eventEmit("[命定之诗] 脚本已加载");
};

// 使用 jQuery 的 ready 事件启动
$(() => {
  errorCatched(init)();
});