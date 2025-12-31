
---

## 目录

- [功能特性](#功能特性)
- [系统架构](#系统架构)
- [核心模块](#核心模块)
  - [货币兑换服务](#货币兑换服务)
  - [经验与升级系统](#经验与升级系统)
  - [NPC 经验系统](#npc-经验系统)
  - [数据维护服务](#数据维护服务)
  - [事件处理服务](#事件处理服务)
  - [信息注入模块](#信息注入模块)
- [游戏配置](#游戏配置)
- [数据结构](#数据结构)

---

## 功能特性

- ⚔️ **角色升级系统**：自动处理经验累计、等级提升、属性点分配和里程碑加成
- 💰 **货币兑换系统**：智能处理金币、银币、铜币之间的借位换算
- 👥 **NPC 经验系统**：管理命定之人（同伴）的经验获取与升级
- 📊 **数据验证与维护**：使用 Zod Schema 验证数据完整性，防止非法数据修改
- 🎭 **事件链管理**：处理事件的开启、进行、结束及已完成事件记录
- 📝 **上下文注入**：自动向 AI 注入游戏状态信息和事件提示

---

## 系统架构

```
src/
├── index.ts              # 主入口，监听 MVU 变量更新事件
├── config/
│   └── index.ts          # 游戏配置（里程碑、经验表、货币汇率等）
├── services/
│   ├── currency.ts       # 货币兑换服务
│   ├── event.ts          # 事件处理服务
│   ├── experience.ts     # 玩家经验与升级服务
│   ├── maintain.ts       # 数据维护服务
│   └── npc-experience.ts # NPC 经验与升级服务
├── injection/
│   ├── event-prompts.ts  # 事件提示注入模块
│   └── game-info.ts      # 游戏信息注入模块
├── types/
│   └── index.d.ts        # TypeScript 类型定义
├── utils/
│   └── index.ts          # 工具函数
└── zod_schema/
    ├── schema.ts         # Zod 数据验证 Schema
    └── utils.ts          # Schema 工具函数
```

---

## 核心模块

### 货币兑换服务

📁 [`src/services/currency.ts`](src/services/currency.ts)

处理三种货币（金币、银币、铜币）之间的自动兑换。当某种货币被扣成负数时，进行借位换算。

**兑换率**：
- 1 金币 = 100 银币
- 1 银币 = 100 铜币

**兑换策略**：借位后偿还
1. **向上借位**：铜币不足 → 借银币，银币不足 → 借金币
2. **向下偿还**：金币为负 → 传递给银币，银币为负 → 传递给铜币（可能产生欠债）

### 经验与升级系统

📁 [`src/services/experience.ts`](src/services/experience.ts)

处理玩家角色的经验值累计和等级提升。

**核心功能**：
- 自动升级：当累计经验值达到升级所需经验时自动提升等级
- 属性点获得：每升一级获得 1 点属性点
- 里程碑加成：在特定等级获得额外属性加成和生命层级提升
- 升级提示：向 AI 注入升级信息

### NPC 经验系统

📁 [`src/services/npc-experience.ts`](src/services/npc-experience.ts)

管理命定之人（NPC 同伴）的经验获取与升级。

**经验获取条件**：
- NPC 处于「在场」状态
- 主角获得了正向经验增量
- 若启用契约要求，NPC 需要「已缔结契约」

**特性**：
- 经验增量跟随主角的累计经验值变化
- 经验数据独立存储在 `date.npcs` 中
- 自动同步命定之人列表的变化

### 数据维护服务

📁 [`src/services/maintain.ts`](src/services/maintain.ts)

维护角色数据的完整性和一致性。

**功能**：
- 登神长阶开启条件判断（13 级开启）
- 防止等级被 AI 非法提升
- 自动更新升级所需经验值
- 确保累计经验值不低于当前等级的最低要求
- 更新生命层级

### 事件处理服务

📁 [`src/services/event.ts`](src/services/event.ts)

管理事件链的生命周期。

**处理流程**：
- **事件开启**：记录事件标题和当前阶段到缓存
- **事件进行**：同步已完成事件列表
- **事件结束**：清理事件状态，记录到已完成列表，重置事件链

### 信息注入模块

#### 游戏信息注入

📁 [`src/injection/game-info.ts`](src/injection/game-info.ts)

向 AI 上下文注入当前游戏状态：
- 在场命定之人的种族列表
- 主角种族
- 当前地点
- 当前时间

#### 事件提示注入

📁 [`src/injection/event-prompts.ts`](src/injection/event-prompts.ts)

向 AI 上下文注入事件相关信息：
- 使用getVariables获取变量，可独立运行
- 已完成事件列表
- 当前事件缓存信息
- 事件链激活提示（引导 AI 按事件发展剧情）

---

## 游戏配置

📁 [`src/config/index.ts`](src/config/index.ts)

### 里程碑等级

达到特定等级时获得属性加成和生命层级提升：

| 等级 | 属性加成 | 生命层级 |
|------|----------|----------|
| 5    | +1 全属性 | 第二层级/中坚 |
| 9    | +1 全属性 | 第三层级/精英 |
| 13   | +1 全属性 | 第四层级/史诗 |
| 17   | +1 全属性 | 第五层级/传说 |
| 21   | +1 全属性 | 第六层级/神话 |
| 25   | +1 全属性 | 第七层级/登神 |

### 等级经验表

| 等级 | 累计经验 | 等级 | 累计经验 |
|------|----------|------|----------|
| 0    | 0        | 13   | 38,840   |
| 1    | 120      | 14   | 50,040   |
| 2    | 360      | 15   | 62,040   |
| 3    | 720      | 16   | 74,840   |
| 4    | 1,200    | 17   | 100,340  |
| 5    | 2,400    | 18   | 127,340  |
| 6    | 3,840    | 19   | 155,840  |
| 7    | 5,520    | 20   | 185,840  |
| 8    | 7,440    | 21   | 236,240  |
| 9    | 11,940   | 22   | 289,040  |
| 10   | 16,940   | 23   | 344,240  |
| 11   | 22,440   | 24   | 401,840  |
| 12   | 28,440   | 25   | MAX      |

### 核心配置

| 配置项 | 值 | 说明 |
|--------|-----|------|
| GpToSp | 100 | 1 金币 = 100 银币 |
| SpToCp | 100 | 1 银币 = 100 铜币 |
| ApAcquisitionLevel | 1 | 每 1 级获得属性点 |
| AscensionUnlockLevel | 13 | 登神长阶开启等级 |
| MaxLevel | 25 | 最大等级 |

### 五维属性

- 力量
- 敏捷
- 体质
- 智力
- 精神

---

## 数据结构

📁 [`src/zod_schema/schema.ts`](src/zod_schema/schema.ts)

使用 Zod 定义的数据验证 Schema，确保游戏数据的完整性和类型安全。

### stat_data 结构

```typescript
{
  世界: {
    时间: string,
    地点: string
  },
  事件链: Record<string, any>,
  任务列表: Record<string, Quest>,
  角色: {
    种族: string,
    身份: string[],
    职业: string[],
    生命层级: string,
    等级: number,        // 1-25
    累计经验值: number,
    升级所需经验: number | 'MAX',
    冒险者等级: string,
    生命值上限: number,
    生命值: number,
    法力值上限: number,
    法力值: number,
    体力值上限: number,
    体力值: number,
    属性: {
      力量: number,
      敏捷: number,
      体质: number,
      智力: number,
      精神: number,
      属性点: number
    },
    技能列表: Record<string, Skill>
  },
  背包: Record<string, InventoryItem>,
  货币: {
    金币: number,
    银币: number,
    铜币: number
  },
  装备: {
    武器: Record<string, Equipment>,
    防具: Record<string, Equipment>,
    饰品: Record<string, Equipment>
  },
  登神长阶: {
    是否开启: boolean,
    要素: Record<string, string>,  // 限3个
    权能: Record<string, string>,  // 限1个
    法则: Record<string, string>,  // 无神位时限1个
    神位: string,
    神国: { 名称: string, 描述: string }
  },
  命定系统: {
    命运点数: number,
    命定之人: Record<string, DestinedOne>
  },
  新闻: {
    阿斯塔利亚快讯: { ... },
    酒馆留言板: { ... },
    午后茶会: { ... }
  }
}
```

### 内部数据结构 (date)

```typescript
{
  event: {
    cache: string,           // 当前事件缓存
    completed_events: string[],  // 已完成事件列表
    time?: string
  },
  npcs: Record<string, {
    level: number,
    exp: number,
    required_exp: number
  }>,
  requiresContractForExp: boolean  // 是否需要契约才能获得经验
}
```