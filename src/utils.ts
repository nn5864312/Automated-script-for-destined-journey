declare function uninjectPrompts(ids: string[]): void;
/**
 * 安全的浮点数解析函数
 * @param {*} value - 要解析的值
 * @returns {number} - 解析后的数值，如果解析失败则返回0
 */
export function safeParseFloat(value: any): number {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}
/**
 * 解除注入的提示信息
 * @param {Array<string>} idsToRemove - 要移除的ID数组
 */
export function uninject(): void {
  const idsToRemove = ["AP+", "Location", "Time", "LV+", "RedlineObjectSpecies", "UserSpecies"];
  uninjectPrompts(idsToRemove);
}
export function tobool(value: any): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return Boolean(value);
}