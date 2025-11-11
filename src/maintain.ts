import { JOB_LEVEL_XP_TABLE } from './config';
import { FateSystem, User } from './types';
import { safeParseFloat } from './utils';

export function maintain(user: User, fatesystem: FateSystem) {
  user.资源.生命值 = Math.min(Math.max(safeParseFloat(user.资源.生命值), 0), safeParseFloat(user.资源.生命值上限));
  user.资源.法力值 = Math.min(Math.max(safeParseFloat(user.资源.法力值), 0), safeParseFloat(user.资源.法力值上限));
  user.资源.体力值 = Math.min(Math.max(safeParseFloat(user.资源.体力值), 0), safeParseFloat(user.资源.体力值上限));
  user.属性.力量 = Math.min(Math.max(safeParseFloat(user.属性.力量), 0), 20);
  user.属性.敏捷 = Math.min(Math.max(safeParseFloat(user.属性.敏捷), 0), 20);
  user.属性.体质 = Math.min(Math.max(safeParseFloat(user.属性.体质), 0), 20);
  user.属性.智力 = Math.min(Math.max(safeParseFloat(user.属性.智力), 0), 20);
  user.属性.精神 = Math.min(Math.max(safeParseFloat(user.属性.精神), 0), 20);
  const RedlineObject = fatesystem.命定之人;
  for (const name in RedlineObject) {
    const CurrentObject = RedlineObject[name];
    CurrentObject.好感度 = Math.max(-100, Math.min(CurrentObject.好感度, 100));
  }
  user.状态.等级 = Math.max(0, Math.min(user.状态.等级, 25));
  user.状态.升级所需经验 = JOB_LEVEL_XP_TABLE[user.状态.等级];
  const currentLevel = user.状态.等级;
  if (currentLevel > 0) {
    const requiredXpForPreviousLevel = JOB_LEVEL_XP_TABLE[currentLevel - 1];
    if (safeParseFloat(user.状态.累计经验值) < requiredXpForPreviousLevel) {
      user.状态.累计经验值 = requiredXpForPreviousLevel;
    }
  }
}
