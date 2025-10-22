const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const sourceFiles = [
  'utils.js',              // 工具函数（最先加载）
  'config.js',             // 配置
  'maintain.js',
  'experience-level.js',   // 经验与等级系统
  'currency-system.js',    // 货币系统
  'info-injection.js',     // 信息注入
  'event-chain-system.js', // 事件链系统
  'main-controller.js'     // 主控制器（最后加载）
];

const outputFile = 'automated-script-for-destined-journey.js';
const tsconfigPath = path.join(__dirname, 'tsconfig.json');
const outDir = 'dist';
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
function getVersion() {
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
    return packageJson.version || '1.0.0';
  } catch (e) {
    const now = new Date();
    return `${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}`;
  }
}

async function build() {
  console.log('🚀 开始构建...');
  console.log('📦 正在编译 TypeScript...');
  execSync(`npx tsc`);

  const contents = [];
  for (const file of sourceFiles) {
    const jsFile = file.replace('.ts', '.js');
    const filePath = path.join(__dirname, outDir, jsFile);
    if (fs.existsSync(filePath)) {
        console.log(`📄 读取: ${jsFile}`);
        const content = await fs.readFile(filePath, 'utf-8');
        contents.push(`// ============================================================`);
        contents.push(`// ${file}`);
        contents.push(`// ============================================================`);
        contents.push(content);
        contents.push('');
    } else {
        console.warn(`⚠️  文件不存在: ${jsFile}`);
    }
  }

  const header = generateHeader();
  const mergedContent = contents.join('\n');
  const finalContent = `${header}\n\n(function() {\n  'use strict';\n\n${mergedContent}\n\n})();`;

  await fs.writeFile(path.join(__dirname, outputFile), finalContent, 'utf-8');

  console.log(`\n✅ 构建完成！`);
  console.log(`📦 输出文件: ${outputFile}`);
}

build().catch(error => {
  console.error('❌ 构建失败:', error);
  process.exit(1);
});