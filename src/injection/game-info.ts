/**
 * 游戏信息注入模块
 * 向上下文注入当前游戏状态信息
 */

import type { MessageVariables } from '../types';
import { injectMultiplePrompts, safeGet } from '../utils';

/** 命定之人数据类型 */
type DestinedOnesData = MessageVariables['stat_data']['命定系统']['命定之人'];

/** 默认空命定之人数据 */
const DefaultDestinedOnes: DestinedOnesData = {};

/**
 * 收集在场命定之人的种族列表
 */
const collectPresentDestinedOnesSpecies = (destined_ones: DestinedOnesData): string[] => {
  return _.chain(destined_ones)
    .pickBy(npc => npc?.是否在场)
    .map(npc => npc?.种族)
    .filter(species => !_.isEmpty(species))
    .value();
};

/**
 * 注入游戏信息
 * - 在场命定之人的种族列表
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
  const destinedOnes = safeGet<DestinedOnesData>(current_variables, 'stat_data.命定系统.命定之人', DefaultDestinedOnes);

  // 收集在场命定之人的种族
  const presentSpecies = collectPresentDestinedOnesSpecies(destinedOnes);

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