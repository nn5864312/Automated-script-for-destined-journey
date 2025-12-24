/**
 * 数据维护服务
 * 负责维护角色数据的完整性和一致性
 */

import { GameConfig, getRequiredXpForLevel, getTierForLevel } from '../config';
import type { MessageVariables } from '../types';
import { safeGet } from '../utils';

/**
 * 维护角色数据的完整性
 *
 * @param new_variables - 更新后的变量数据
 * @param old_variables - 更新前的变量数据（由 MVU 事件提供）
 */
export const maintainCharacterData = (new_variables: MessageVariables, old_variables: MessageVariables): void => {
  const character = safeGet(new_variables, 'stat_data.角色', {} as any);
  const oldLevel = safeGet(old_variables, 'stat_data.角色.等级', 1);

  // 登神长阶开启条件
  _.set(new_variables, 'stat_data.登神长阶.是否开启', character.等级 >= GameConfig.AscensionUnlockLevel);

  // 防止等级被非法提升
  if (oldLevel < character.等级 && oldLevel !== 1) {
    _.set(character, '等级', oldLevel);
    toastr.error('等级被AI非法提升,请检查变量更新');
  }

  // 更新升级所需经验
  _.set(character, '升级所需经验', getRequiredXpForLevel(character.等级));

  // 确保累计经验值不低于当前等级的最低要求
  if (character.等级 > 0) {
    const minExp = getRequiredXpForLevel(character.等级 - 1);
    if (character.累计经验值 < minExp) {
      _.set(character, '累计经验值', minExp);
    }
  }

  // 更新生命层级
  _.set(character, '生命层级', getTierForLevel(character.等级));
};