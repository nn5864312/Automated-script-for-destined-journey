/**
 * 经验与等级处理模块
 * @param {Object} user - 用户对象
 */
import { LEVEL_XP_TABLE, MILESTONE_LEVELS, GAME_CONFIG } from "./config";
import { Variables } from "./types";
export function processExperienceAndLevel(variables: Variables, old_variables: Variables): void {
  const user = variables.stat_data.角色;
  const current_level = user.等级;
  let has_leveled_up = false;
  // 升级处理循环
  while (user.累计经验值 >= user.升级所需经验) {
    if (!LEVEL_XP_TABLE[user.等级]) {
      break;
    }

    user.等级 = user.等级 + 1;
    has_leveled_up = true;
    user.升级所需经验 = LEVEL_XP_TABLE[user.等级];
    // 检查是否获得属性点
    if (user.等级 % GAME_CONFIG.AP_Acquisition_Level === 0) {
      user.属性.属性点 = user.属性.属性点 + 1;
      injectPrompts([
        {
          id: "AP+",
          position: "in_chat",
          role: "system",
          depth: 0,
          content: "core_system: The {{user}} has reached a specific level and obtained attribute points. Guide the {{user}} to use attribute points",
          should_scan: true,
        },
      ]);
    }
    // 检查里程碑等级
    const milestone = MILESTONE_LEVELS[user.等级];
    if (milestone) {
      user.属性.力量 = user.属性.力量 + milestone.strength;
      user.属性.敏捷 = user.属性.敏捷 + milestone.agility;
      user.属性.体质 = user.属性.体质 + milestone.constitution;
      user.属性.智力 = user.属性.智力 + milestone.intelligence;
      user.属性.精神 = user.属性.精神 + milestone.spirit;
      user.生命层级 = milestone.tier;
    }
  }
  // 如果升级了，注入升级提示
  if (has_leveled_up) {
    injectPrompts([
      {
        id: "LV+",
        position: "in_chat",
        role: "system",
        depth: 0,
        content: `core_system: The {{user}} level increased from ${current_level} to ${user.等级}`,
        should_scan: true,
      },
    ]);
  }
}
