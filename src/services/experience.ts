/**
 * 玩家经验与升级服务
 */

import { AttributeKeys, GameConfig, getMilestoneForLevel, getRequiredXpForLevel, isMaxLevel } from '../config';
import type { MessageVariables } from '../types';
import { injectMultiplePrompts, safeGet } from '../utils';

/**
 * 处理玩家角色的经验与升级
 *
 * @param new_variables - 更新后的变量数据
 * @param old_variables - 更新前的变量数据（由 MVU 事件提供）
 */
export const processExperienceAndLevel = (new_variables: MessageVariables, old_variables: MessageVariables): void => {
  const character = safeGet(new_variables, 'stat_data.角色', {} as any);
  const initialLevel = safeGet(old_variables, 'stat_data.角色.等级', character.等级);
  const promptsToInject: Array<{ id: string; content: string; position?: 'none' | 'in_chat'; depth?: number; role?: 'system' }> = [];

  // 升级处理循环
  while (character.累计经验值 >= Number(character.升级所需经验) && !isMaxLevel(character.等级)) {
    _.set(character, '等级', character.等级 + 1);
    _.set(character, '升级所需经验', getRequiredXpForLevel(character.等级));

    // 属性点获得
    if (character.等级 % GameConfig.ApAcquisitionLevel === 0) {
      _.set(character, '属性.属性点', safeGet(character, '属性.属性点', 0) + 1);
      promptsToInject.push({
        id: '属性点获得',
        content: 'core_system: The {{user}} has reached a specific level and obtained attribute points. Guide the {{user}} to use attribute points',
        position: 'in_chat',
        role: 'system',
      });
    }

    // 里程碑加成
    const milestone = getMilestoneForLevel(character.等级);
    if (milestone) {
      _.forEach(AttributeKeys, (attrKey) => {
        const currentAttr = safeGet(character, `属性.${attrKey}`, 0);
        _.set(character, `属性.${attrKey}`, currentAttr + milestone.attributes);
      });
      _.set(character, '生命层级', milestone.tier);
    }
  }

  // 升级提示
  if (character.等级 > initialLevel) {
    promptsToInject.push({
      id: '等级提升',
      content: `core_system: The {{user}} level increased from ${initialLevel} to ${character.等级}`,
      position: 'in_chat',
      role: 'system',
    });
  }

  if (promptsToInject.length > 0) {
    injectMultiplePrompts(promptsToInject);
  }
};