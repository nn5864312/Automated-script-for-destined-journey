import { LEVEL_XP_TABLE } from "./config";
import { Variables } from "./types";

export function processNPCExperienceAndLevel(variables: Variables) {
  const old_variables = (getVariables({ type: "message", message_id: -2 }) as Variables) || {};
  uninjectPrompts(["NPC_LV+"]);
  let Prompts: string[] = [];
  let has_leveled_up = false;
  const redline_object = variables.stat_data.命定系统.命定之人;
  const date_redline_object = variables.date.npcs;

  // 计算主角经验增量
  const old_exp = old_variables?.stat_data?.角色?.累计经验值 || variables.stat_data.角色.累计经验值;
  const delta_exp = variables.stat_data.角色.累计经验值 - old_exp || 0;

  // 删除 date.npcs 中存在但 命定之人 中不存在的对象
  for (const name in date_redline_object) {
    if (!(name in redline_object)) {
      delete date_redline_object[name];
    }
  }
  // 添加 命定之人 中存在但 date.npcs 中不存在的对象
  for (const name in redline_object) {
    const current_object = redline_object[name];
    if (!(name in date_redline_object)) {
      date_redline_object[name] = {
        level: current_object.等级,
        exp: 0,
        required_exp: 0,
      };
    }
  }
  for (const name in date_redline_object) {
    const current_object = date_redline_object[name];
    current_object.level = redline_object[name].等级;
    current_object.required_exp = LEVEL_XP_TABLE[current_object.level];
    if (current_object.level > 0) {
      const required_xp_for_previous_level = LEVEL_XP_TABLE[current_object.level - 1];
      if (current_object.exp < required_xp_for_previous_level) {
        current_object.exp = required_xp_for_previous_level;
      }
    }
    if (redline_object[name].是否在场 && delta_exp > 0) {
      current_object.exp = current_object.exp + delta_exp;
    }
    while (current_object.exp >= current_object.required_exp) {
      if (!LEVEL_XP_TABLE[current_object.level]) {
        break;
      }
      current_object.level++;
      has_leveled_up = true;
      current_object.required_exp = LEVEL_XP_TABLE[current_object.level];
    }
    if (redline_object[name].等级 < current_object.level) {
      has_leveled_up = true;
      Prompts.push(`${name}从LV${redline_object[name].等级}提升到LV${current_object.level};`);
      redline_object[name].等级 = current_object.level;
    }
  }
  if (has_leveled_up) {
    injectPrompts([
      {
        id: "NPC_LV+",
        content: `core_system: ${Prompts.join("")}`,
        position: "none",
        depth: 0,
        role: "system",
        should_scan: true,
      },
    ]);
  }
}
