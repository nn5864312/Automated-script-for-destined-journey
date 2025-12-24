/**
 * 命定之诗 - 脚本主入口
 *
 * 监听 MVU 变量框架的 VARIABLE_UPDATE_ENDED 事件，
 * 在变量更新完成后执行各种处理逻辑
 */

import type { MessageVariables } from './types';
import { Schema } from './zod_schema/schema';

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

/**
 * 变量更新处理函数
 * 在 MVU 变量更新结束后调用
 *
 * @param data - 更新后的 MVU 数据
 * @param data_before_update - 更新前的 MVU 数据
 */
const handleVariableUpdate = (data: Mvu.MvuData, data_before_update: Mvu.MvuData): void => {
  // 构造 MessageVariables 类型（使用深拷贝创建独立副本）
  const currentVariables: MessageVariables = {
    stat_data: deepClone(data.stat_data) as MessageVariables['stat_data'],
    date: deepClone((data as unknown as { date: MessageVariables['date'] }).date) ?? {
      event: { cache: '', completed_events: [] },
      npcs: {},
      requiresContractForExp: true,
    },
  };

  const oldVariables: MessageVariables = {
    stat_data: data_before_update.stat_data as MessageVariables['stat_data'],
    date: (data_before_update as unknown as { date: MessageVariables['date'] }).date ?? {
      event: { cache: '', completed_events: [] },
      npcs: {},
      requiresContractForExp: true,
    },
  };

  // 清理旧的注入
  uninject();

  // 数据维护
  maintainCharacterData(currentVariables, oldVariables);

  // 经验与升级处理
  processExperienceAndLevel(currentVariables, oldVariables);
  processNPCExperienceAndLevel(currentVariables, oldVariables);

  // 货币兑换
  processCurrencyExchange(currentVariables);

  // 事件处理
  processEvent(currentVariables);

  // 信息注入
  injectGameInfo(currentVariables);
  injectEventPrompts(currentVariables, oldVariables);

  // 使用 zod schema 约束数据并写回
  _.set(data, 'stat_data', Schema.parse(currentVariables.stat_data));
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
};

// 使用 jQuery 的 ready 事件启动
$(() => {
  errorCatched(init)();
});