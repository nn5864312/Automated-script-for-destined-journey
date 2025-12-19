// 世界信息
export interface World {
  时间: string;
  地点: string;
}

// 事件链
export interface EventChain {
  开启: boolean;
  结束: boolean;
  琥珀事件: boolean;
  标题: string;
  阶段: string;
  已完成事件: string[];
}

// 任务
export interface Task {
  简介: string;
  目标: string;
  奖励: string;
}

export interface TaskList {
  [任务名称: string]: Task;
}

// 属性
export interface Attributes {
  力量: number;
  敏捷: number;
  体质: number;
  智力: number;
  精神: number;
  属性点: number;
}

// 技能
export interface Skill {
  品质: string;
  类型: string;
  消耗: string;
  标签: string;
  效果: string;
  描述: string;
}

export interface SkillList {
  [技能名称: string]: Skill;
}

// 角色
export interface Character {
  种族: string;
  身份: string[];
  职业: string[];
  生命层级: string;
  等级: number;
  累计经验值: number;
  升级所需经验: number;
  冒险者等级: string;
  生命值上限: number;
  生命值: number;
  法力值上限: number;
  法力值: number;
  体力值上限: number;
  体力值: number;
  属性: Attributes;
  技能列表: SkillList;
}

// 背包物品
export interface BackpackItem {
  品质: string;
  数量: number;
  类型: "武器防具" | "其它物品" | "消耗品" | "材料";
  标签: string;
  效果: string;
  描述: string;
}

export interface Backpack {
  [物品名称: string]: BackpackItem;
}

// 货币
export interface Currency {
  金币: number;
  银币: number;
  铜币: number;
}

// 装备
export interface Equipment {
  品质: string;
  标签: string;
  效果: string;
  描述: string;
  位置: string;
}

export interface EquipmentSlot {
  [装备名称: string]: Equipment;
}

export interface EquipmentSet {
  武器: EquipmentSlot;
  防具: EquipmentSlot;
  饰品: EquipmentSlot;
}

// 登神长阶 - 能力
export interface Ability {
  [能力名称: string]: string;
}

// 神国
export interface DivineRealm {
  名称: string;
  描述: string;
}

// 登神长阶
export interface StairwayToGodhood {
  是否开启: boolean;
  要素: Ability;
  权能: Ability;
  法则: Ability;
  神位: string;
  神国: DivineRealm;
}

// 命定之人的属性（不含属性点）
export interface PartnerAttributes {
  力量: number;
  敏捷: number;
  体质: number;
  智力: number;
  精神: number;
}

// 命定之人的装备
export interface PartnerEquipment {
  品质: string;
  类型: string;
  标签: string;
  效果: string;
  描述: string;
}

export interface PartnerEquipmentSlot {
  [装备名称: string]: PartnerEquipment;
}

// 命定之人
export interface DestinedOne {
  是否在场: boolean;
  生命层级: string;
  等级: number;
  种族: string;
  身份: string[];
  职业: string[];
  性格: string;
  喜爱: string;
  外貌特质: string;
  衣物装饰: string;
  装备: PartnerEquipmentSlot;
  属性: PartnerAttributes;
  登神长阶: StairwayToGodhood;
  是否缔结契约: boolean;
  好感度: number;
  评价: string;
  背景故事: string;
  技能: SkillList;
}

export interface DestinedOnes {
  [角色名: string]: DestinedOne;
}

// 命定系统
export interface DestinySystem {
  命运点数: number;
  命定之人: DestinedOnes;
}

// 阿斯塔利亚快讯
export interface AstaliaNews {
  势力要闻: string;
  尊位行迹: string;
  军事行动: string;
  经济动脉: string;
  灾害预警: string;
}

// 酒馆留言板
export interface TavernBoard {
  高额悬赏: string;
  冒险发现: string;
  怪物异动: string;
  通缉要犯: string;
  宝物传闻: string;
}

// 午后茶会
export interface AfternoonTea {
  社交逸闻: string;
  千里远望: string;
  命运涟漪: string;
  邂逅预兆: string;
}

// 新闻
export interface News {
  阿斯塔利亚快讯: AstaliaNews;
  酒馆留言板: TavernBoard;
  午后茶会: AfternoonTea;
}

// 完整变量表
export interface Variables {
  stat_data: {
    世界: World;
    事件链: EventChain;
    任务列表: TaskList;
    角色: Character;
    背包: Backpack;
    货币: Currency;
    装备: EquipmentSet;
    登神长阶: StairwayToGodhood;
    命定系统: DestinySystem;
    新闻: News;
  };
  date: {
    event: {
      cache: string;
      completed_events: string[];
      time: string;
    };
    npcs: {
      [name: string]: {
        level: number;
        exp: number;
        required_exp: number;
      };
    };
  };
}
