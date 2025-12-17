import { Variables } from "./types";

export function processEvent(variables: Variables): void {
  const world = variables.stat_data.世界;
  const event = variables.stat_data.事件链;
  const star = event.开启;
  const end = event.结束;
  const recall_time = event.琥珀事件;
  const title = event.标题;
  const step = event.阶段;
  const completed_events = event.已完成事件;
  uninjectPrompts(["completed_events"]);
  insertOrAssignVariables({ date: { event: { completed_events: completed_events } } }, { type: "message" });
  if (star === true) {
    if (variables?.date?.event?.time === null || variables?.date?.event?.time === undefined) {
      insertOrAssignVariables({ date: { event: { time: world.时间 } } }, { type: "message" });
    }
    insertOrAssignVariables({ date: { event: { cache: `当前事件为${title}，当前步骤为${step}` } } }, { type: "message" });
  }
  if (end === true) {
    if (recall_time === true) {
      const time = variables?.date?.event?.time;
      if (time) {
        world.时间 = time;
      }
    }
    uninjectPrompts([`event`]);
    uninjectPrompts([`event_tips`]);
    event.已完成事件.push(`已完成事件${title}`);
    event.标题 = "";
    event.阶段 = "";
    event.结束 = false;
    event.开启 = false;
    event.琥珀事件 = false;
    deleteVariable("event.time", { type: "message" });
    deleteVariable("event.cache", { type: "message" });
  }
}
