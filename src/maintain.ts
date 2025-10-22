import { User } from "./types";
import { FateSystem } from "./types";
import { safeParseFloat } from './utils';

export function maintain(user: User, fatesystem: FateSystem) {
    user.资源.生命值 = Math.min(Math.max(safeParseFloat(user.资源.生命值), 0), safeParseFloat(user.资源.生命值上限));
    user.资源.法力值 = Math.min(Math.max(safeParseFloat(user.资源.法力值), 0), safeParseFloat(user.资源.法力值上限));
    user.资源.体力值 = Math.min(Math.max(safeParseFloat(user.资源.体力值), 0), safeParseFloat(user.资源.体力值上限));
    user.属性.力量 = Math.min(Math.max(safeParseFloat(user.属性.力量), 0), 20)
    user.属性.敏捷 = Math.min(Math.max(safeParseFloat(user.属性.敏捷), 0), 20)
    user.属性.体质 = Math.min(Math.max(safeParseFloat(user.属性.体质), 0), 20)
    user.属性.智力 = Math.min(Math.max(safeParseFloat(user.属性.智力), 0), 20)
    user.属性.精神 = Math.min(Math.max(safeParseFloat(user.属性.精神), 0), 20)
    const RedlineObject = fatesystem.红线对象
    for (const name in RedlineObject) {
        const CurrentObject = RedlineObject[name];
        const CurrentFavorability = CurrentObject.好感度;
        const newfavorability = Math.max(-100, Math.min(CurrentFavorability, 100));
        if (newfavorability !== CurrentFavorability) {
            CurrentObject.好感度 = newfavorability;
        }
    }
}