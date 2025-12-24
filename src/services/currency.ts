/**
 * 货币兑换服务
 * 当某种货币被扣成负数时，进行借位换算
 * 如果所有货币都不足，则产生欠债（负铜币）
 *
 * 核心思路：借位后偿还
 * 1. 向上借位：铜负→借银，银负→借金
 * 2. 向下偿还：金负→传递给银，银负→传递给铜
 *
 * 注意：货币的取整和非负约束由 zod schema 处理，此服务只处理兑换逻辑
 */

import { GameConfig } from '../config';
import type { MessageVariables } from '../types';

/** 兑换率配置 */
const ExchangeRates = {
  gpToSp: GameConfig.GpToSp,
  spToCp: GameConfig.SpToCp,
} as const;

/** 货币数据结构 */
type CurrencyData = { 金币: number; 银币: number; 铜币: number };
type CurrencyKey = keyof CurrencyData;

/**
 * 向上借位：当 lower 为负时，从 higher 借入
 */
const borrowFrom = (
  currency: CurrencyData,
  higher: CurrencyKey,
  lower: CurrencyKey,
  rate: number
): void => {
  if (currency[lower] < 0) {
    const borrow = _.ceil(Math.abs(currency[lower]) / rate);
    currency[higher] -= borrow;
    currency[lower] += borrow * rate;
  }
};

/**
 * 向下偿还：当 higher 为负时，传递给 lower（可能产生欠债）
 */
const transferTo = (
  currency: CurrencyData,
  higher: CurrencyKey,
  lower: CurrencyKey,
  rate: number
): void => {
  if (currency[higher] < 0) {
    currency[lower] += currency[higher] * rate;
    currency[higher] = 0;
  }
};

/**
 * 处理货币兑换
 * 使用借位后偿还策略
 */
export const processCurrencyExchange = (current_variables: MessageVariables): void => {
  const currency = current_variables.stat_data.货币;

  // 向上借位：低级货币为负时，从高级货币借入
  borrowFrom(currency, '银币', '铜币', ExchangeRates.spToCp);
  borrowFrom(currency, '金币', '银币', ExchangeRates.gpToSp);

  // 向下偿还：高级货币为负时，传递给低级货币
  transferTo(currency, '金币', '银币', ExchangeRates.gpToSp);
  transferTo(currency, '银币', '铜币', ExchangeRates.spToCp);
};