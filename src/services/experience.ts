/**
 * 玩家经验与升级服务
 */

import {
  AttributeKeys,
  GameConfig,
  getMilestoneForLevel,
  getRequiredXpForLevel,
  isMaxLevel,
} from '../config';
import type { CharacterLevelUpData, MessageVariables } from '../types';
import { safeGet } from '../utils';
import { canBreakAscensionLevel } from './ascension';

/**
 * 处理玩家角色的经验与升级
 *
 * @param new_variables - 更新后的变量数据
 * @param old_variables - 更新前的变量数据（由 MVU 事件提供）
 */
export const processExperienceAndLevel = (
  new_variables: MessageVariables,
  old_variables: MessageVariables
): void => {
  const character = safeGet(new_variables, 'stat_data.主角', {} as any);
  const initialLevel = safeGet(old_variables, 'stat_data.主角.等级', character.等级);

  // 记录是否获得属性点
  let gainedAP = false;

  // 升级处理循环
  while (character.累计经验值 >= Number(character.升级所需经验) && !isMaxLevel(character.等级)) {
    const canBreak = canBreakAscensionLevel(character.等级, new_variables);
    if (!canBreak) {
      // 关键等级未满足条件时，强制清空超出的经验
      _.set(character, '累计经验值', Number(character.升级所需经验));
      break;
    }

    _.set(character, '等级', character.等级 + 1);
    _.set(character, '升级所需经验', getRequiredXpForLevel(character.等级));

    // 属性点获得
    if (character.等级 % GameConfig.ApAcquisitionLevel === 0) {
      _.set(character, '属性点', safeGet(character, '属性点', 0) + 1);
      gainedAP = true;
    }

    // 里程碑加成
    const milestone = getMilestoneForLevel(character.等级);
    if (milestone) {
      _.forEach(AttributeKeys, attrKey => {
        const currentAttr = safeGet(character, `属性.${attrKey}`, 0);
        _.set(character, `属性.${attrKey}`, currentAttr + milestone.attributes);
      });
      _.set(character, '生命层级', milestone.tier);
    }
  }

  // 将升级信息存储到 date.levelUp，供后续注入使用
  if (character.等级 > initialLevel) {
    const levelUpData: CharacterLevelUpData = {
      fromLevel: initialLevel,
      toLevel: character.等级,
      gainedAP,
    };

    insertOrAssignVariables({ date: { levelUpCharacter: levelUpData } }, { type: 'message' });
  }
};
