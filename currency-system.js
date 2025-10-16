/**
 * 货币系统模块
 * 当某种货币被扣成负数时，自动从更高层级的货币中换算抵扣
 * 如果所有货币都不足，则产生欠债（负CP）
 * 
 * @param {Object} property - 财产对象，包含货币信息
 */
    function CurrencySystem(property) {
        let PP = safeParseFloat(property.货币.白金币); 
        let GP = safeParseFloat(property.货币.金币);   
        let SP = safeParseFloat(property.货币.银币);   
        let CP = safeParseFloat(property.货币.铜币);   
        
        // 按需换算函数
        function handleCurrencyExchange() {
            let deficit = 0;
            let currencyCleared = false;
            
            // PP购买处理：PP被扣成负时的换算逻辑
            // 新逻辑：优先用GP抵扣 → SP转GP循环 → CP转SP循环
            if (PP < 0) {
                let ppDeficit = Math.abs(PP);
                
                // 阶段1：优先用GP抵扣 (1PP = 100GP)
                if (GP > 0) {
                    let gpCanCover = GP / GAME_CONFIG.PP_TO_GP;
                    if (gpCanCover >= ppDeficit) {
                        // GP足够抵扣
                        GP -= ppDeficit * GAME_CONFIG.PP_TO_GP;
                        PP = 0;
                        ppDeficit = 0;
                    } else {
                        // GP不足，用完所有GP
                        ppDeficit -= gpCanCover;
                        GP = 0;
                    }
                }
                
                // 阶段2：GP不足时，将SP转换为GP循环抵扣
                while (ppDeficit > 0 && SP > 0) {
                    // 计算需要多少SP来换1PP (1PP = 100GP, 1GP = 100SP, 所以1PP = 10000SP)
                    let spNeeded = GAME_CONFIG.PP_TO_GP * GAME_CONFIG.GP_TO_SP;
                    
                    if (SP >= spNeeded) {
                        // 将10000SP转换为1PP
                        SP -= spNeeded;
                        PP += 1;
                        ppDeficit -= 1;
                    } else {
                        // SP不足以换1PP，将剩余SP转换为GP
                        GP = Math.floor(SP / GAME_CONFIG.GP_TO_SP);
                        SP = SP % GAME_CONFIG.GP_TO_SP;
                        
                        // 用新获得的GP抵扣PP
                        let gpCanCover = GP / GAME_CONFIG.PP_TO_GP;
                        if (gpCanCover >= ppDeficit) {
                            GP -= ppDeficit * GAME_CONFIG.PP_TO_GP;
                            PP = 0;
                            ppDeficit = 0;
                        } else {
                            ppDeficit -= gpCanCover;
                            GP = 0;
                        }
                        break; // SP已用完，退出循环
                    }
                }
                
                // 阶段3：SP为0时若仍不足，将CP转换为SP，然后重复SP_TO_GP过程
                while (ppDeficit > 0 && CP > 0) {
                    // 将CP转换为SP (每次转换尽可能多)
                    let spFromCp = Math.floor(CP / GAME_CONFIG.SP_TO_CP);
                    let remainingCp = CP % GAME_CONFIG.SP_TO_CP;
                    
                    if (spFromCp > 0) {
                        SP = spFromCp;
                        CP = remainingCp;
                        
                        // 重复SP转GP转PP的过程
                        while (ppDeficit > 0 && SP > 0) {
                            let spNeeded = GAME_CONFIG.PP_TO_GP * GAME_CONFIG.GP_TO_SP;
                            
                            if (SP >= spNeeded) {
                                SP -= spNeeded;
                                PP += 1;
                                ppDeficit -= 1;
                            } else {
                                // SP不足以换1PP，将剩余SP转换为GP
                                GP = Math.floor(SP / GAME_CONFIG.GP_TO_SP);
                                SP = SP % GAME_CONFIG.GP_TO_SP;
                                
                                let gpCanCover = GP / GAME_CONFIG.PP_TO_GP;
                                if (gpCanCover >= ppDeficit) {
                                    GP -= ppDeficit * GAME_CONFIG.PP_TO_GP;
                                    PP = 0;
                                    ppDeficit = 0;
                                } else {
                                    ppDeficit -= gpCanCover;
                                    GP = 0;
                                }
                                break;
                            }
                        }
                    }
                    
                    // 如果仍有债务但CP不足以换SP，退出循环
                    if (ppDeficit > 0 && CP < GAME_CONFIG.SP_TO_CP) {
                        break;
                    }
                }
                
                // 阶段4：所有货币都耗尽，将PP债务转换为CP债务
                if (ppDeficit > 0) {
                    CP = -(ppDeficit * GAME_CONFIG.PP_TO_GP * GAME_CONFIG.GP_TO_SP * GAME_CONFIG.SP_TO_CP);
                    PP = 0;
                    currencyCleared = true;
                }
            }
            
            // GP购买处理：GP被扣成负时的换算逻辑
            // 新逻辑：优先用PP抵扣 → SP转PP循环 → CP转SP循环
            if (GP < 0 && !currencyCleared) {
                let gpDeficit = Math.abs(GP);
                
                // 阶段1：优先用PP抵扣 (1PP = 100GP)
                if (PP > 0) {
                    let ppCanCover = PP * GAME_CONFIG.PP_TO_GP;
                    if (ppCanCover >= gpDeficit) {
                        // PP足够抵扣
                        let ppNeeded = Math.ceil(gpDeficit / GAME_CONFIG.PP_TO_GP);
                        PP -= ppNeeded;
                        GP = ppNeeded * GAME_CONFIG.PP_TO_GP - gpDeficit;
                        gpDeficit = 0;
                    } else {
                        // PP不足，用完所有PP
                        gpDeficit -= ppCanCover;
                        PP = 0;
                    }
                }
                
                // 阶段2：PP不足时，将SP转换为PP循环抵扣
                while (gpDeficit > 0 && SP > 0) {
                    // 计算需要多少SP来换1PP (1PP = 100GP * 100SP = 10000SP)
                    let spNeeded = GAME_CONFIG.PP_TO_GP * GAME_CONFIG.GP_TO_SP;
                    
                    if (SP >= spNeeded) {
                        // 将SP转换为PP
                        SP -= spNeeded;
                        PP = 1;
                        
                        // 用新获得的PP转GP抵扣
                        let ppCanCover = PP * GAME_CONFIG.PP_TO_GP;
                        if (ppCanCover >= gpDeficit) {
                            let ppNeeded = Math.ceil(gpDeficit / GAME_CONFIG.PP_TO_GP);
                            PP -= ppNeeded;
                            GP = ppNeeded * GAME_CONFIG.PP_TO_GP - gpDeficit;
                            gpDeficit = 0;
                        } else {
                            gpDeficit -= ppCanCover;
                            PP = 0;
                        }
                    } else {
                        // SP不足以换1PP，退出循环
                        break;
                    }
                }
                
                // 阶段3：SP为0时若仍不足，将CP转换为SP，然后重复SP_TO_PP过程
                while (gpDeficit > 0 && CP > 0) {
                    // 计算需要多少CP来换1PP (1PP = 1000000CP)
                    let cpNeeded = GAME_CONFIG.PP_TO_GP * GAME_CONFIG.GP_TO_SP * GAME_CONFIG.SP_TO_CP;
                    
                    if (CP >= cpNeeded) {
                        // 将CP转换为PP
                        CP -= cpNeeded;
                        PP = 1;
                        
                        // 用新获得的PP抵扣GP
                        let ppCanCover = PP * GAME_CONFIG.PP_TO_GP;
                        if (ppCanCover >= gpDeficit) {
                            let ppNeeded = Math.ceil(gpDeficit / GAME_CONFIG.PP_TO_GP);
                            PP -= ppNeeded;
                            GP = ppNeeded * GAME_CONFIG.PP_TO_GP - gpDeficit;
                            gpDeficit = 0;
                        } else {
                            gpDeficit -= ppCanCover;
                            PP = 0;
                        }
                    } else {
                        // CP不足以换1PP，退出循环
                        break;
                    }
                }
                
                // 阶段4：所有货币都耗尽，将GP债务转换为CP债务
                if (gpDeficit > 0) {
                    CP = -(gpDeficit * GAME_CONFIG.GP_TO_SP * GAME_CONFIG.SP_TO_CP);
                    GP = 0;
                    currencyCleared = true;
                }
            }
            
            // SP购买处理：SP被扣成负时的换算逻辑
            // 新逻辑：优先用GP抵扣 → PP转GP循环 → CP转PP循环
            if (SP < 0 && !currencyCleared) {
                let spDeficit = Math.abs(SP);
                
                // 阶段1：优先用GP抵扣 (1GP = 100SP)
                if (GP > 0) {
                    let gpCanCover = GP * GAME_CONFIG.GP_TO_SP;
                    if (gpCanCover >= spDeficit) {
                        // GP足够抵扣
                        let gpNeeded = Math.ceil(spDeficit / GAME_CONFIG.GP_TO_SP);
                        GP -= gpNeeded;
                        SP = gpNeeded * GAME_CONFIG.GP_TO_SP - spDeficit;
                        spDeficit = 0;
                    } else {
                        // GP不足，用完所有GP
                        spDeficit -= gpCanCover;
                        GP = 0;
                    }
                }
                
                // 阶段2：GP不足时，将PP转换为GP循环抵扣
                while (spDeficit > 0 && PP > 0) {
                    // 将1PP转换为100GP
                    PP -= 1;
                    GP = GAME_CONFIG.PP_TO_GP;
                    
                    // 用新获得的GP抵扣SP
                    let gpCanCover = GP * GAME_CONFIG.GP_TO_SP;
                    if (gpCanCover >= spDeficit) {
                        // 新获得的GP足够抵扣剩余债务
                        let gpNeeded = Math.ceil(spDeficit / GAME_CONFIG.GP_TO_SP);
                        GP -= gpNeeded;
                        SP = gpNeeded * GAME_CONFIG.GP_TO_SP - spDeficit;
                        spDeficit = 0;
                    } else {
                        // 新获得的GP仍不足，用完后继续循环
                        spDeficit -= gpCanCover;
                        GP = 0;
                    }
                }
                
                // 阶段3：PP为0时若仍不足，将CP转换为PP，然后重复PP_TO_GP过程
                while (spDeficit > 0 && CP > 0) {
                    // 计算需要多少CP来换1PP (1PP = 1000000CP)
                    let cpNeeded = GAME_CONFIG.PP_TO_GP * GAME_CONFIG.GP_TO_SP * GAME_CONFIG.SP_TO_CP;
                    
                    if (CP >= cpNeeded) {
                        // 将CP转换为PP
                        CP -= cpNeeded;
                        PP = 1;
                        
                        // 用新获得的PP转GP抵扣SP
                        PP -= 1;
                        GP = GAME_CONFIG.PP_TO_GP;
                        
                        let gpCanCover = GP * GAME_CONFIG.GP_TO_SP;
                        if (gpCanCover >= spDeficit) {
                            let gpNeeded = Math.ceil(spDeficit / GAME_CONFIG.GP_TO_SP);
                            GP -= gpNeeded;
                            SP = gpNeeded * GAME_CONFIG.GP_TO_SP - spDeficit;
                            spDeficit = 0;
                        } else {
                            spDeficit -= gpCanCover;
                            GP = 0;
                        }
                    } else {
                        // CP不足以换1PP，退出循环
                        break;
                    }
                }
                
                // 阶段4：所有货币都耗尽，将SP债务转换为CP债务
                if (spDeficit > 0) {
                    CP = -(spDeficit * GAME_CONFIG.SP_TO_CP);
                    SP = 0;
                    currencyCleared = true;
                }
            }
            
            // CP购买处理：CP被扣成负时的换算逻辑
            // 新逻辑：优先用SP抵扣 → GP转SP循环 → PP转GP循环
            if (CP < 0 && !currencyCleared) {
                let cpDeficit = Math.abs(CP);
                
                // 阶段1：优先用SP抵扣 (1SP = 100CP)
                if (SP > 0) {
                    let spCanCover = SP * GAME_CONFIG.SP_TO_CP;
                    if (spCanCover >= cpDeficit) {
                        // SP足够抵扣
                        let spNeeded = Math.ceil(cpDeficit / GAME_CONFIG.SP_TO_CP);
                        SP -= spNeeded;
                        CP = spNeeded * GAME_CONFIG.SP_TO_CP - cpDeficit;
                        cpDeficit = 0;
                    } else {
                        // SP不足，用完所有SP
                        cpDeficit -= spCanCover;
                        SP = 0;
                    }
                }
                
                // 阶段2：SP不足时，将GP转换为SP循环抵扣
                while (cpDeficit > 0 && GP > 0) {
                    // 将1GP转换为100SP
                    GP -= 1;
                    SP = GAME_CONFIG.GP_TO_SP;
                    
                    // 用新获得的SP抵扣CP
                    let spCanCover = SP * GAME_CONFIG.SP_TO_CP;
                    if (spCanCover >= cpDeficit) {
                        // 新获得的SP足够抵扣剩余债务
                        let spNeeded = Math.ceil(cpDeficit / GAME_CONFIG.SP_TO_CP);
                        SP -= spNeeded;
                        CP = spNeeded * GAME_CONFIG.SP_TO_CP - cpDeficit;
                        cpDeficit = 0;
                    } else {
                        // 新获得的SP仍不足，用完后继续循环
                        cpDeficit -= spCanCover;
                        SP = 0;
                    }
                }
                
                // 阶段3：GP为0时若仍不足，将PP转换为GP，然后重复GP_TO_SP过程
                while (cpDeficit > 0 && PP > 0) {
                    // 将1PP转换为100GP
                    PP -= 1;
                    GP = GAME_CONFIG.PP_TO_GP;
                    
                    // 重复GP转SP的过程
                    while (cpDeficit > 0 && GP > 0) {
                        // 将1GP转换为100SP
                        GP -= 1;
                        SP = GAME_CONFIG.GP_TO_SP;
                        
                        // 用新获得的SP抵扣CP
                        let spCanCover = SP * GAME_CONFIG.SP_TO_CP;
                        if (spCanCover >= cpDeficit) {
                            // 新获得的SP足够抵扣剩余债务
                            let spNeeded = Math.ceil(cpDeficit / GAME_CONFIG.SP_TO_CP);
                            SP -= spNeeded;
                            CP = spNeeded * GAME_CONFIG.SP_TO_CP - cpDeficit;
                            cpDeficit = 0;
                        } else {
                            // 新获得的SP仍不足，用完后继续循环
                            cpDeficit -= spCanCover;
                            SP = 0;
                        }
                    }
                }
                
                // 阶段4：所有货币都耗尽，CP保持负值表示欠债
                if (cpDeficit > 0) {
                    CP = -cpDeficit;
                    currencyCleared = true;
                }
            }
            
        }
        
        // 执行按需换算
        handleCurrencyExchange();
        
        // 更新货币值
        property.货币.白金币 = Math.max(0, Math.floor(PP));
        property.货币.金币 = Math.max(0, Math.floor(GP));
        property.货币.银币 = Math.max(0, Math.floor(SP));
        property.货币.铜币 = Math.floor(CP); // CP可以为负数，表示欠债
    }
