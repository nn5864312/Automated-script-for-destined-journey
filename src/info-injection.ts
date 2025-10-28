import { World } from './types';
import { FateSystem } from './types';
import { User } from './types';
declare function injectPrompts(prompts: any[]): void;
/**
 * 信息读取与注入模块
 * @param {Object} world - 世界对象
 */
export function inforead(world: World, fatesystem: FateSystem, user: User): void {
  const RedlineObject = fatesystem.命定之人
  let RedlineObjectSpecies = []
  for (const name in RedlineObject) {
    const CurrentObject = RedlineObject[name];
    RedlineObjectSpecies.push(CurrentObject.种族);
  }
  injectPrompts([
    {
      id: "RedlineObjectSpecies",
      content: RedlineObjectSpecies,
      position: "none",
      depth: 0,
      role: "system",
      should_scan: true,
    },
  ]);
  injectPrompts([
    {
      id: "UserSpecies",
      content: user.种族,
      position: "none",
      depth: 0,
      role: "system",
      should_scan: true,
    },
  ]);
  // 注入地点信息
  injectPrompts([
    {
      id: "Location",
      content: world.地点,
      position: "none",
      depth: 0,
      role: "system",
      should_scan: true,
    },
  ]);
  // 注入时间信息
  injectPrompts([
    {
      id: "Time",
      content: world.时间,
      position: "none",
      depth: 0,
      role: "system",
      should_scan: true,
    },
  ]);
}