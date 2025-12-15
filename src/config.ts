// 里程碑等级配置
export const MILESTONE_LEVELS: {
  [key: number]: { strength: number; agility: number; constitution: number; intelligence: number; spirit: number; tier: string };
} = {
  5: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: "第二层级/中坚" },
  9: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: "第三层级/精英" },
  13: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: "第四层级/史诗" },
  17: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: "第五层级/传说" },
  21: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: "第六层级/神话" },
  25: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: "第七层级/登神" },
};
// 职业等级经验表
export const LEVEL_XP_TABLE: { [key: number]: number } = {
  0: 0,
  1: 23,
  2: 106,
  3: 258,
  4: 689,
  5: 997,
  6: 1388,
  7: 1866,
  8: 2945,
  9: 3604,
  10: 4358,
  11: 5208,
  12: 7009,
  13: 8057,
  14: 9206,
  15: 10457,
  16: 13035,
  17: 14496,
  18: 16065,
  19: 17742,
  20: 21135,
  21: 23032,
  22: 25041,
  23: 27161,
  24: 31000,
  25: Infinity,
};
// 核心游戏配置
export const GAME_CONFIG = {
  GP_TO_SP: 100,
  SP_TO_CP: 100,
  AP_Acquisition_Level: 1,
};
