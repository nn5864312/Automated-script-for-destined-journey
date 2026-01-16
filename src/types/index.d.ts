/**
 * 类型定义模块
 * 从 zod schema 推导 TypeScript 类型
 */
import { Schema } from '../zod_schema/schema';

/** stat_data 类型 - 从 zod schema 推导 */
export type StatData = z.infer<typeof Schema>;

/** 角色类型 */
export type Character = StatData['主角'];

/** 命定系统类型 */
export type DestinySystem = StatData['命定系统'];

/** 命定之人类型 */
export type DestinedOne = DestinySystem['命定之人'][string];

/** 登神长阶类型 */
export type Ascension = StatData['主角']['登神长阶'];

/** 世界信息类型 */
export type World = StatData['世界'];

/** 事件链类型 */
export type EventChain = StatData['事件'];

/** 背包类型 */
export type Backpack = StatData['主角']['背包'];

/** 背包物品类型 */
export type BackpackItem = Backpack[string];

/** 装备集类型 */
export type EquipmentSet = StatData['主角']['装备'];

/** 任务列表类型 */
export type QuestList = StatData['任务列表'];

/** 新闻类型 */
export type News = StatData['新闻'];

/** NPC 经验数据类型 */
export interface NpcExpData {
  level: number;
  exp: number;
  required_exp: number;
}

/** 升级提示数据类型 - 用于延迟注入升级提示 */
export interface LevelUpData {
  /** 主角升级信息 */
  character?: {
    fromLevel: number;
    toLevel: number;
    gainedAP: boolean;
  };
  /** NPC 升级信息列表 */
  npcs?: string[];
}

/** 日志数据类型 - 用于跟踪游戏统计 */
export interface LogData {
  /** 死亡次数 */
  deathCount: number;
  /** 货币最大欠款额度（铜币） */
  maxCurrencyDebt: number;
  /** 破产次数 */
  bankruptcyCount: number;
  /** AI非法提升等级的消息楼层ID列表 */
  illegalLevelUpId: number[];
  /** FP(命运点数)总获取量 */
  totalFPGained: number;
}

/** 内部数据类型 - 用于脚本持久化 */
export interface DateData {
  event: {
    cache: string;
    completed_events: string[];
    time?: string;
  };
  npcs: Record<string, NpcExpData>;
  requiresContractForExp: boolean;
  /** 登神额外条件占位 */
  ascensionLawReady: boolean;
  /** 日志统计数据 */
  log: LogData;
  /** 升级提示数据 - 用于延迟注入 */
  levelUp?: LevelUpData;
}

/** 完整消息楼层变量类型 */
export interface MessageVariables {
  stat_data: StatData;
  date: DateData;
}

/** 属性键名类型 */
export type AttributeKey = '力量' | '敏捷' | '体质' | '智力' | '精神';

/** 角色属性类型 */
export type CharacterAttributes = Character['属性'];

/** 命定之人属性类型 */
export type DestinedOneAttributes = DestinedOne['属性'];
