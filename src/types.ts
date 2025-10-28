export interface User {
    种族: string;
    状态: {
        等级: number;
        升级所需经验: number;
        累计经验值: number;
        生命层级: string;
    };
    属性: {
        力量: number;
        敏捷: number;
        体质: number;
        智力: number;
        精神: number;
        属性点: number;
    };
    资源: {
      生命值上限: number;
      生命值: number;
      法力值上限: number;
      法力值: number;
      体力值上限: number;
      体力值: number;
    }
}

export interface Property {
    货币: {
        金币: number;
        银币: number;
        铜币: number;
    };
}

export interface World {
    地点: string;
    时间: string;
}

export interface EventChain {
    开启: boolean;
    结束: boolean;
    琥珀事件: boolean;
    标题: string;
    阶段: string;
    已完成事件: string[];
}

export interface FateSystem {
  命定之人: {
    [name: string]: {
      好感度: number;
      种族: string;
    };
  };
}

export interface FateSystemOld {
  命定之人: {
    [name: string]: {
      好感度: number;
    };
  };
}

export interface Variables {
    stat_data: {
        角色: User;
        财产: Property;
        世界: World;
        事件链: EventChain;
        命定系统: FateSystem;
    };
    display_data: {
        命定系统: FateSystemOld;
    }
}
