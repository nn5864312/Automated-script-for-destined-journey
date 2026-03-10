/**
 * 游戏信息注入模块
 * 向上下文注入当前游戏状态信息
 */

import type { MessageVariables } from '../types';
import { injectMultiplePrompts, safeGet } from '../utils';

/** 关系列表数据类型 */
type PartnersData = MessageVariables['stat_data']['关系列表'];

/** 默认空关系列表数据 */
const DefaultPartners: PartnersData = {};

/**
 * 收集在场关系列表的种族列表
 */
const collectPresentPartnersSpecies = (partners: PartnersData): string[] => {
  return _.chain(partners)
    .pickBy(npc => npc?.在场)
    .map(npc => npc?.种族)
    .filter(species => !_.isEmpty(species))
    .value();
};

/**
 * 注入游戏信息
 * - 在场关系列表的种族列表
 * - 用户角色种族
 * - 当前地点
 * - 当前时间
 *
 * @param current_variables - 当前的变量数据
 */
export const injectGameInfo = (current_variables: MessageVariables): void => {
  // 使用 safeGet 安全访问嵌套属性
  const worldLocation = safeGet(current_variables, 'stat_data.世界.地点', '未知');
  const worldTime = safeGet(current_variables, 'stat_data.世界.时间', '未知');
  const characterSpecies = safeGet(current_variables, 'stat_data.主角.种族', '未知');
  const partners = safeGet<PartnersData>(current_variables, 'stat_data.关系列表', DefaultPartners);

  // 收集在场关系列表的种族
  const presentSpecies = collectPresentPartnersSpecies(partners);

  // 批量注入游戏信息
  injectMultiplePrompts([
    {
      id: '同伴种族',
      content: presentSpecies.join(', '),
      position: 'none',
      depth: 0,
      role: 'system',
    },
    {
      id: '主角种族',
      content: characterSpecies,
      position: 'none',
      depth: 0,
      role: 'system',
    },
    {
      id: '当前所在地点',
      content: worldLocation,
      position: 'none',
      depth: 0,
      role: 'system',
    },
    {
      id: '当前时间',
      content: worldTime,
      position: 'none',
      depth: 0,
      role: 'system',
    },
  ]);
};
