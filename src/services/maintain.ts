/**
 * 数据维护服务
 * 负责维护角色数据的完整性和一致性
 */

import { getRequiredXpForLevel, getTierForLevel } from '../config';
import type { MessageVariables } from '../types';
import { safeGet } from '../utils';
import { syncAscensionState } from './ascension';

/**
 * 维护角色数据的完整性
 *
 * @param new_variables - 更新后的变量数据
 * @param old_variables - 更新前的变量数据（由 MVU 事件提供）
 */
export const maintainCharacterData = (
  new_variables: MessageVariables,
  old_variables: MessageVariables
): void => {
  const character = safeGet(new_variables, 'stat_data.主角', {} as any);

  // 登神长阶开启条件与任务同步
  syncAscensionState(new_variables, old_variables);

  // 更新升级所需经验
  _.set(character, '升级所需经验', getRequiredXpForLevel(character.等级));

  // 允许累计经验值下降，不保留下限，只保证 >= 0
  const currentExp = Number(character.累计经验值);
  const safeExp = Number.isFinite(currentExp) ? Math.max(currentExp, 0) : 0;
  if (character.累计经验值 !== safeExp) {
    _.set(character, '累计经验值', safeExp);
  }

  // 更新生命层级
  _.set(character, '生命层级', getTierForLevel(character.等级));
};
