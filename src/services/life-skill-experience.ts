/**
 * 生活职业经验与升级服务
 *
 * 仿照主角等级升级逻辑：
 * - 根据 当前经验 / 升级所需经验 自动升级
 * - 升级后扣除本级经验，只保留溢出值
 * - 自动同步下一级所需经验
 * - 将升级提示写入 date.levelUpLifeSkills，供后续注入
 */

import type { MessageVariables } from '../types';
import { safeGet } from '../utils';
import {
  getLifeSkillExpByLevel,
  getNextLifeSkillLevel,
  isMaxLifeSkillLevel,
  normalizeLifeSkillLevel,
} from '../zod_schema/utils';

export const processLifeSkillExperienceAndLevel = (
  new_variables: MessageVariables,
  _old_variables: MessageVariables
): void => {
  const character = safeGet(new_variables, 'stat_data.主角', {} as any);
  const categories = safeGet(
    character,
    '生活职业.分类',
    {} as Record<string, {
      等级?: string;
      当前经验?: number;
      升级所需经验?: number;
      熟练度?: number;
    }>
  );

  const levelUpPrompts: string[] = [];

  _.forEach(categories, (entry, categoryName) => {
    const startLevel = normalizeLifeSkillLevel(_.get(entry, '等级', ''));
    let currentLevel = startLevel;
    let currentExp = Number(_.get(entry, '当前经验', 0));
    currentExp = Number.isFinite(currentExp) ? Math.max(0, Math.round(currentExp)) : 0;
    let requiredExp = Math.max(
      Number(getLifeSkillExpByLevel(currentLevel)) || 1,
      1,
    );

    while (currentExp >= requiredExp && !isMaxLifeSkillLevel(currentLevel)) {
      currentExp -= requiredExp;
      const nextLevel = getNextLifeSkillLevel(currentLevel);
      if (nextLevel === currentLevel) {
        break;
      }
      currentLevel = nextLevel;
      requiredExp = Math.max(Number(getLifeSkillExpByLevel(currentLevel)) || 1, 1);
    }

    _.set(entry, '等级', currentLevel);
    _.set(entry, '当前经验', currentExp);
    _.set(entry, '升级所需经验', requiredExp);
    _.set(entry, '熟练度', Math.max(0, Math.round(Number(_.get(entry, '熟练度', 0)) || 0)));

    if (currentLevel !== startLevel) {
      levelUpPrompts.push(`{{user}}的生活职业「${categoryName}」从${startLevel}提升到了${currentLevel}`);
    }
  });

  if (levelUpPrompts.length > 0) {
    insertOrAssignVariables({ date: { levelUpLifeSkills: levelUpPrompts } }, { type: 'message' });
  }
};
