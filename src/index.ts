/**
 * 命定之诗 - 脚本主入口
 *
 * 监听 MVU 变量框架的变量更新事件，
 * 在变量更新完成后执行各种处理逻辑
 */

import type { MessageVariables } from './types';
import { Schema } from './zod_schema/schema';

// Services
import { processEvent } from './services/event';
import { processExperienceAndLevel } from './services/experience';
import { maintainCharacterData } from './services/maintain';
import { processNPCExperienceAndLevel } from './services/npc-experience';
import { processLifeSkillExperienceAndLevel } from './services/life-skill-experience';

// Injection
import { injectEventPrompts } from './injection/event-prompts';
import { injectGameInfo } from './injection/game-info';
import { injectLevelPrompts } from './injection/level-prompts';

// Utils
import { deepClone, errorCatched, uninject } from './utils';

// Schema
import { achievement } from '@/services/achievement';
import { DefaultLogData, logSystem } from '@/services/log';

/** date 数据默认值 */
const DefaultDate: MessageVariables['date'] = {
  event: { cache: '', completed_events: [] },
  npcs: {},
  npcLevelUpWithPlayer: true,
  requiresContractForExp: true,
  ascensionLawReady: false,
  log: DefaultLogData,
  levelUpLifeSkills: null,
};

const logLifeSkill = (label: string, value: unknown): void => {
  console.log(label, value);
};

const getMessageVariablesSafe = (messageId: number): Partial<MessageVariables> | null => {
  try {
    return getVariables({
      type: 'message',
      message_id: messageId,
    }) as Partial<MessageVariables> | null;
  } catch (error) {
    console.warn(`[生活职业调试-取消息变量失败-${messageId}]`, error);
    return null;
  }
};

/**
 * 变量更新处理函数
 */
const handleVariableUpdate = (data: Mvu.MvuData, data_before_update: Mvu.MvuData): void => {
  // 使用 insertVariables 确保 date 数据存在（仅插入不存在的字段）
  insertVariables({ date: DefaultDate }, { type: 'message' });

  // 显式读取消息变量，排查到底哪一路真的拿到了 stat_data
  const currentMessageVariables = getMessageVariablesSafe(-1);
  const previousMessageVariables = getMessageVariablesSafe(-2);
  const defaultMessageVariables = getMessageVariablesSafe(0);

  logLifeSkill('[生活职业调试-0-事件原始data.stat_data]', data.stat_data ?? null);
  logLifeSkill(
    '[生活职业调试-0-事件原始data_before_update.stat_data]',
    data_before_update.stat_data ?? null
  );
  logLifeSkill('[生活职业调试-0-消息变量-1.stat_data]', currentMessageVariables?.stat_data ?? null);
  logLifeSkill(
    '[生活职业调试-0-消息变量-2.stat_data]',
    previousMessageVariables?.stat_data ?? null
  );
  logLifeSkill('[生活职业调试-0-消息变量0.stat_data]', defaultMessageVariables?.stat_data ?? null);

  // 关键修正：本轮处理优先信事件 payload 自带的最新 stat_data，
  // 避免被 -1/-2 消息变量中的旧快照覆盖，导致 patch 值看不到。
  const nextStatData =
    data.stat_data ??
    currentMessageVariables?.stat_data ??
    previousMessageVariables?.stat_data ??
    defaultMessageVariables?.stat_data ??
    null;

  const prevStatData =
    data_before_update.stat_data ??
    previousMessageVariables?.stat_data ??
    defaultMessageVariables?.stat_data ??
    null;

  logLifeSkill('[生活职业调试-0-最终采用nextStatData]', nextStatData);
  logLifeSkill('[生活职业调试-0-最终采用prevStatData]', prevStatData);

  if (!nextStatData) {
    console.warn('[生活职业调试-空数据] 本轮 nextStatData 仍然为空，已跳过处理', {
      dataStatData: data.stat_data,
      dataBeforeUpdateStatData: data_before_update.stat_data,
      currentMessageVariables,
      previousMessageVariables,
      defaultMessageVariables,
    });
    return;
  }

  // 使用 Schema.safeParse 规范化 stat_data
  const parsed = Schema.safeParse(nextStatData);
  if (!parsed.success) {
    console.error('[生活职业调试-校验失败] stat_data 校验失败', parsed.error);
  }

  logLifeSkill('[生活职业调试-1-safeParse结果]', parsed.success ? parsed.data : nextStatData);

  // 使用 deepClone 保护原数据
  data.stat_data = deepClone(parsed.success ? parsed.data : nextStatData);
  logLifeSkill('[生活职业调试-2-deepClone后data.stat_data]', data.stat_data);

  // 获取当前 date 数据
  const currentDate = _.get(data, 'date', DefaultDate) as MessageVariables['date'];
  const oldDate = _.get(data_before_update, 'date', DefaultDate) as MessageVariables['date'];

  // 构造变量引用
  const current: MessageVariables = {
    stat_data: data.stat_data as MessageVariables['stat_data'],
    date: currentDate,
  };
  const old: MessageVariables = {
    stat_data: prevStatData as MessageVariables['stat_data'],
    date: oldDate,
  };

  logLifeSkill('[生活职业调试-3-进入maintain前 current.stat_data]', current.stat_data);

  uninject();
  maintainCharacterData(current, old);
  logLifeSkill('[生活职业调试-4-maintain后]', current.stat_data);

  processExperienceAndLevel(current, old);
  logLifeSkill('[生活职业调试-5-主角等级处理后]', current.stat_data);

  processLifeSkillExperienceAndLevel(current, old);
  logLifeSkill('[生活职业调试-6-生活职业处理后]', current.stat_data);

  processNPCExperienceAndLevel(current, old);
  logLifeSkill('[生活职业调试-7-NPC等级处理后]', current.stat_data);

  const shouldDeleteEventCache = processEvent(current);
  logLifeSkill('[生活职业调试-8-事件处理后]', current.stat_data);

  logSystem(current, old);
  logLifeSkill('[生活职业调试-9-logSystem后最终值]', current.stat_data);

  if (shouldDeleteEventCache) {
    deleteVariable('date.event.cache', { type: 'message' });
  }
};

/**
 * 注入所有提示词
 * 组合函数，在生成前注入所有需要的提示
 */
const injectAllPrompts = (): void => {
  // 这里先保留 -2：它影响的是 AI 注入提示所见的上下文，不是本轮变量处理的最新值来源。
  // 当前核心 bug 在 handleVariableUpdate 取数优先级，先修这个。
  const variables = getVariables({ type: 'message', message_id: -2 }) as MessageVariables;

  injectGameInfo(variables);
  injectEventPrompts(variables);
  injectLevelPrompts(variables);
};

/**
 * 初始化脚本
 */
const init = async (): Promise<void> => {
  // 等待 MVU 初始化完成
  await waitGlobalInitialized('Mvu');

  // 监听 zod 处理完成后的变量更新结束事件
  eventOn('mag_variable_update_ended_for_zod' as any, errorCatched(handleVariableUpdate));

  // 监听生成相关事件，注入提示词
  eventOn(tavern_events.GENERATION_AFTER_COMMANDS, injectAllPrompts);
  eventOn(tavern_events.MESSAGE_SENT, injectAllPrompts);
  eventOn(tavern_events.MESSAGE_UPDATED, injectAllPrompts);

  eventOn(getButtonEvent('查看成就'), achievement);
  console.log("[命定之诗] 脚本已加载 ฅ'ω'ฅ");
  toastr.success("[命定之诗] 脚本已加载 ฅ'ω'ฅ");
  eventEmit('[命定之诗] 脚本已加载');
};

// 使用 jQuery 的 ready 事件启动
$(() => {
  errorCatched(init)();
});
