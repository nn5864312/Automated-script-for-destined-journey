/**
 * 解除注入的提示信息
 * @param {Array<string>} idsToRemove - 要移除的ID数组
 */
export function uninject(): void {
  const idsToRemove = ["AP+", "LV+", "Location", "Time", "RedlineObjectSpecies", "UserSpecies"];
  uninjectPrompts(idsToRemove);
}
