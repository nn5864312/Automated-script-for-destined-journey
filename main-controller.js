function Main_processes(variables) {
  // 获取变量
const user = variables.stat_data.角色;
const property = variables.stat_data.财产;
const world = variables.stat_data.世界;
const eventchain = variables.stat_data.事件链;
const fatesystem = variables.stat_data.命运系统;

if (!user || !property || !world || !eventchain || !fatesystem) {
  console.error("Core data missing, script terminated");
  return;
}
  // 按照顺序执行模块
  //Lock_favorability(fatesystem);
  uninject(); // 1. 解除注入
  experiencegrowth(user); // 2. 经验与等级处理
  CurrencySystem(property); // 3. 货币换算
  inforead(world); // 4. 信息读取与注入
  event_chain(eventchain, world); // 6. 事件链处理
}

// ============================ [事件监听] ============================
// 监听变量更新完成事件
eventOn('mag_variable_update_ended', Main_processes);
eventOn("message_sent", Main_processes);
// 监听按钮事件
eventOnButton('重新处理变量', Main_processes);