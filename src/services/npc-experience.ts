/**
 * NPC 经验与升级服务
 *
 * NPC（命定之人）的经验系统：
 * - 经验数据存储在 date.npcs 中
 * - 经验增量跟随主角的累计经验值变化
 * - 只有「在场」（如果需要契约则「已缔结契约」）的 NPC 才能获得经验
 */

import { getRequiredXpForLevel, getTierForLevel, isMaxLevel, LevelXpTable } from '../config';
import type { MessageVariables, NpcExpData } from '../types';
import { injectMultiplePrompts, safeGet } from '../utils';

/**
 * 处理所有 NPC 的经验与升级
 *
 * @param new_variables - 更新后的变量数据
 * @param old_variables - 更新前的变量数据（由 MVU 事件提供）
 */
export const processNPCExperienceAndLevel = (new_variables: MessageVariables, old_variables: MessageVariables): void => {
  const destined = safeGet(new_variables, 'stat_data.命定系统.命定之人', {} as Record<string, any>);
  const requiresContract = safeGet(new_variables, 'date.requiresContractForExp', true);

  // 获取现有的 date.npcs 数据，如果不存在则创建空对象
  const dateNpcs: Record<string, NpcExpData> = safeGet(new_variables, 'date.npcs', {});

  // 计算主角经验增量
  const currentExp = safeGet(new_variables, 'stat_data.主角.累计经验值', 0);
  const oldExp = safeGet(old_variables, 'stat_data.主角.累计经验值', currentExp);
  const deltaExp = currentExp - oldExp;

  // 早期初始化阶段仅同步，不进行经验结算
  const isInitDryRun = getLastMessageId() <= 3;

  // 同步：添加命定之人中存在但 date.npcs 中不存在的对象
  _.forEach(destined, (npc, name) => {
    if (!dateNpcs[name]) {
      _.set(dateNpcs, name, {
        level: npc.等级,
        exp: 0,
        required_exp: getRequiredXpForLevel(npc.等级),
      });
    }
  });

  // 同步：删除 date.npcs 中存在但命定之人中不存在的对象
  _.forEach(_.keys(dateNpcs), (name) => {
    if (!destined[name]) {
      _.unset(dateNpcs, name);
    }
  });

  // 升级提示收集
  const levelUpPrompts: string[] = [];

  // 处理每个 NPC
  _.forEach(dateNpcs, (npcData: NpcExpData, name: string) => {
    const npc = destined[name];
    if (!npc) return;

    const oldNpcLevel = safeGet(
      old_variables,
      `stat_data.命定系统.命定之人.${name}.等级`,
      undefined as number | undefined,
    );
    const isManualLevelSet = typeof oldNpcLevel !== 'number' || oldNpcLevel !== npc.等级;

    // 同步等级（使用 _.set 确保写入）
    _.set(npcData, 'level', npc.等级);
    _.set(npcData, 'required_exp', getRequiredXpForLevel(npcData.level));

    const prevRequired = npcData.level > 1 ? LevelXpTable[npcData.level - 1] : 0;

    // 手动设置等级时，将经验对齐到前一级，避免被动升一级
    if (isManualLevelSet) {
      if (typeof prevRequired === 'number') {
        _.set(npcData, 'exp', prevRequired);
      }
    } else if (npcData.level > 1) {
      // 确保经验不低于前一级所需
      if (typeof prevRequired === 'number' && npcData.exp < prevRequired) {
        _.set(npcData, 'exp', prevRequired);
      }
    }

    const shouldProcessExp = !isInitDryRun && !isManualLevelSet;

    // 经验增加：在场 + 经验增量 > 0 + （需要契约时要已缔结）
    const canGainExp = shouldProcessExp && npc.是否在场 && deltaExp > 0 && (!requiresContract || npc.是否缔结契约);
    if (canGainExp) {
      _.set(npcData, 'exp', npcData.exp + deltaExp);
    }

    // 升级检查
    const initialLevel = npc.等级;
    while (shouldProcessExp && npcData.exp >= npcData.required_exp && !isMaxLevel(npcData.level)) {
      _.set(npcData, 'level', npcData.level + 1);
      _.set(npcData, 'required_exp', getRequiredXpForLevel(npcData.level));
    }

    // 同步升级后的等级回命定之人（使用 _.set 确保写入）
    if (npc.等级 < npcData.level) {
      levelUpPrompts.push(`${name}从LV${initialLevel}提升到LV${npcData.level}`);
      _.set(npc, '等级', npcData.level);
      // 同步生命层级
      _.set(npc, '生命层级', getTierForLevel(npcData.level));
    }
  });

  // 使用 insertOrAssignVariables 持久化 date.npcs 到消息楼层变量
  insertOrAssignVariables({ date: { npcs: dateNpcs } }, { type: 'message' });

  // 注入升级提示
  if (levelUpPrompts.length > 0) {
    injectMultiplePrompts([
      {
        id: 'NPC等级提升',
        content: `core_system: ${levelUpPrompts.join('; ')}`,
        position: 'none',
        role: 'system',
      },
    ]);
  }
};