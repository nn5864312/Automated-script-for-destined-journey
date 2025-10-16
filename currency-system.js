/**
 * 货币系统模块
 * 当某种货币被扣成负数时，自动从更高层级的货币中换算抵扣
 * 如果所有货币都不足，则产生欠债（负CP）
 * 
 * @param {Object} property - 财产对象，包含货币信息
 */
function CurrencySystem(property) {
  // 货币层级配置（从高到低）
  const CURRENCY_HIERARCHY = [
    { 
      key: 'PP', 
      name: '白金币',
      toNext: GAME_CONFIG.PP_TO_GP 
    },
    { 
      key: 'GP', 
      name: '金币',
      toNext: GAME_CONFIG.GP_TO_SP 
    },
    { 
      key: 'SP', 
      name: '银币',
      toNext: GAME_CONFIG.SP_TO_CP 
    },
    { 
      key: 'CP', 
      name: '铜币',
      toNext: null  // 最低层级货币
    }
  ];

  // 初始化货币数值
  let currencies = {
    PP: safeParseFloat(property.货币.白金币),
    GP: safeParseFloat(property.货币.金币),
    SP: safeParseFloat(property.货币.银币),
    CP: safeParseFloat(property.货币.铜币)
  };

  /**
   * 计算从当前货币到目标货币的转换率
   * @param {number} fromIndex - 起始货币索引
   * @param {number} toIndex - 目标货币索引
   * @returns {number} - 转换率
   */
  function getConversionRate(fromIndex, toIndex) {
    let rate = 1;
    for (let i = fromIndex; i < toIndex; i++) {
      rate *= CURRENCY_HIERARCHY[i].toNext;
    }
    return rate;
  }

  /**
   * 处理单个货币的负值换算
   * @param {number} deficitIndex - 出现赤字的货币索引
   * @returns {boolean} - 是否已清空所有货币
   */
  function handleDeficitCurrency(deficitIndex) {
    const deficitCurrency = CURRENCY_HIERARCHY[deficitIndex];
    const deficit = Math.abs(currencies[deficitCurrency.key]);

    // 从高层级货币开始尝试换算
    for (let i = 0; i < deficitIndex; i++) {
      const higherCurrency = CURRENCY_HIERARCHY[i];
      const conversionRate = getConversionRate(i, deficitIndex);
      
      // 计算需要多少高层级货币
      const needed = Math.ceil(deficit / conversionRate);
      
      if (currencies[higherCurrency.key] >= needed) {
        // 高层级货币充足，直接换算
        currencies[higherCurrency.key] -= needed;
        currencies[deficitCurrency.key] = needed * conversionRate - deficit;
        return false;
      } else if (currencies[higherCurrency.key] > 0) {
        // 高层级货币不足但有一些，用完后继续向下尝试
        const remainingDeficit = deficit - currencies[higherCurrency.key] * conversionRate;
        currencies[higherCurrency.key] = 0;
        currencies[deficitCurrency.key] = -remainingDeficit;
        // 不返回，继续尝试下一个层级
      }
    }

    // 尝试从次低层级货币换算
    for (let i = deficitIndex + 1; i < CURRENCY_HIERARCHY.length; i++) {
      const lowerCurrency = CURRENCY_HIERARCHY[i];
      const prevCurrency = CURRENCY_HIERARCHY[i - 1];
      const conversionRate = prevCurrency.toNext;
      
      const currentDeficit = Math.abs(currencies[deficitCurrency.key]);
      
      if (currencies[lowerCurrency.key] >= currentDeficit * conversionRate) {
        // 低层级货币充足
        currencies[lowerCurrency.key] -= currentDeficit * conversionRate;
        currencies[deficitCurrency.key] = 0;
        return false;
      } else if (i === CURRENCY_HIERARCHY.length - 1) {
        // 已经是最低层级货币（CP），产生欠债
        const finalDeficit = currentDeficit * conversionRate - currencies[lowerCurrency.key];
        // 清空所有货币
        for (let j = 0; j < CURRENCY_HIERARCHY.length - 1; j++) {
          currencies[CURRENCY_HIERARCHY[j].key] = 0;
        }
        currencies.CP = -finalDeficit;
        return true;
      } else {
        // 当前低层级货币不足，继续向下
        const remainingDeficit = currentDeficit * conversionRate - currencies[lowerCurrency.key];
        currencies[lowerCurrency.key] = 0;
        currencies[CURRENCY_HIERARCHY[i - 1].key] = -remainingDeficit / conversionRate;
      }
    }
    
    return false;
  }

  /**
   * 执行货币按需换算的主函数
   */
  function handleCurrencyExchange() {
    let currencyCleared = false;

    // 按货币层级顺序处理（从高到低）
    for (let i = 0; i < CURRENCY_HIERARCHY.length && !currencyCleared; i++) {
      const currency = CURRENCY_HIERARCHY[i];
      
      if (currencies[currency.key] < 0) {
        currencyCleared = handleDeficitCurrency(i);
      }
    }
  }

  // 执行按需换算
  handleCurrencyExchange();

  // 更新货币值（向下取整，CP可以为负）
  property.货币.白金币 = Math.max(0, Math.floor(currencies.PP));
  property.货币.金币 = Math.max(0, Math.floor(currencies.GP));
  property.货币.银币 = Math.max(0, Math.floor(currencies.SP));
  property.货币.铜币 = Math.floor(currencies.CP); // CP可以为负数，表示欠债
}
