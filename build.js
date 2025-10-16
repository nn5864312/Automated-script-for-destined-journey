/**
 * 构建脚本 - 合并所有模块到单个 IIFE 文件
 */
const fs = require('fs');
const path = require('path');

// 需要合并的文件列表（按依赖顺序）
const sourceFiles = [
  'utils.js',              // 工具函数（最先加载）
  'config.js',             // 配置
  //'lock_HS.js',            // 好感度锁定
  'experience-level.js',   // 经验与等级系统
  'currency-system.js',    // 货币系统
  'info-injection.js',     // 信息注入
  'event-chain-system.js', // 事件链系统
  'main-controller.js'     // 主控制器（最后加载）
];

// 输出文件名
const outputFile = 'automated-script-for-destined-journey.js';

/**
 * 读取文件内容并移除多余的空行
 */
function readFileContent(filename) {
  const filePath = path.join(__dirname, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  文件不存在: ${filename}`);
    return '';
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  // 移除文件开头和结尾的空行
  return content.trim();
}

/**
 * 生成文件头部注释
 */
function generateHeader() {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  
  return `/**
 * Automated Script for Destined Journey
 * 命定之旅自动化脚本
 * 
 * @version ${getVersion()}
 * @date ${dateStr}
 * @license MIT
 * 
 * 这是一个自动生成的合并文件，包含以下模块：
 * ${sourceFiles.map(f => `- ${f}`).join('\n')}
 */`;
}

/**
 * 获取版本号（从 package.json 或使用日期）
 */
function getVersion() {
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
    return packageJson.version || '1.0.0';
  } catch (e) {
    // 如果没有 package.json，使用日期作为版本
    const now = new Date();
    return `${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}`;
  }
}

/**
 * 构建合并文件
 */
function build() {
  console.log('🚀 开始构建...\n');
  
  // 收集所有文件内容
  const contents = [];
  
  for (const file of sourceFiles) {
    console.log(`📄 读取: ${file}`);
    const content = readFileContent(file);
    if (content) {
      contents.push(`// ============================================================`);
      contents.push(`// ${file}`);
      contents.push(`// ============================================================`);
      contents.push(content);
      contents.push(''); // 添加空行分隔
    }
  }
  
  // 生成最终内容
  const header = generateHeader();
  const mergedContent = contents.join('\n');
  
  // 包装在 IIFE 中
  const finalContent = `${header}

(function() {
  'use strict';

${mergedContent}

})();
`;
  
  // 写入文件
  fs.writeFileSync(path.join(__dirname, outputFile), finalContent, 'utf-8');
  
  console.log(`\n✅ 构建完成！`);
  console.log(`📦 输出文件: ${outputFile}`);
  console.log(`📊 文件大小: ${(finalContent.length / 1024).toFixed(2)} KB`);
  console.log(`📝 包含模块: ${sourceFiles.length} 个\n`);
}

// 执行构建
try {
  build();
} catch (error) {
  console.error('❌ 构建失败:', error.message);
  process.exit(1);
}
