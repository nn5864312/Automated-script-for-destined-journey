import { LEVEL_XP_TABLE, MILESTONE_LEVELS } from "./config";
import { Variables } from "./types";

export function maintain(variables: Variables) {
  const old_variables = Mvu.getMvuData({ type: "message", message_id: -2 }) || {};
  const user = variables.stat_data.角色;
  if (user.等级 < 13) {
    variables.stat_data.登神长阶.是否开启 = false;
  } else {
    variables.stat_data.登神长阶.是否开启 = true;
  }
  if (old_variables.stat_data.角色.等级 !== 1) {
    user.等级 = old_variables.stat_data.角色.等级;
  }
  user.升级所需经验 = LEVEL_XP_TABLE[user.等级];
  const current_level = user.等级;
  if (current_level > 0) {
    const required_xp_for_previous_level = LEVEL_XP_TABLE[current_level - 1];
    if (user.累计经验值 < required_xp_for_previous_level) {
      user.累计经验值 = required_xp_for_previous_level;
    }
  }
  const milestones = Object.keys(MILESTONE_LEVELS)
    .map(Number)
    .sort((a, b) => b - a);

  for (const milestone of milestones) {
    if (user.等级 >= milestone) {
      user.生命层级 = MILESTONE_LEVELS[milestone].tier;
      break;
    }
  }
}
