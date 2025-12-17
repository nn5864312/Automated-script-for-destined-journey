import { Variables } from "./types";

export function injectGameInfo(variables: Variables): void {
  const world = variables.stat_data.世界;
  const user = variables.stat_data.角色;
  const fatesystem = variables.stat_data.命定系统;

  let redline_object_species: string[] = [];
  if (fatesystem.命定之人) {
    const redline_object = fatesystem.命定之人;
    for (const name in redline_object) {
      const current_object = redline_object[name];
      redline_object_species.push(current_object.种族);
    }
  }
  injectPrompts([
    {
      id: "RedlineObjectSpecies",
      content: redline_object_species,
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
