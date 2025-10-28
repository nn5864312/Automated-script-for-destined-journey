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
  'event-chain-system-current.js', // 事件链系统
  'event-chain-system-inject.js', // 事件链系统
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
        let content = await fs.readFile(filePath, 'utf-8');
        
        // 移除 "use strict" 声明（因为外层已经有了）
        content = content.replace(/["']use strict["'];?\n?/g, '');
        
        // 移除 Object.defineProperty(exports, "__esModule", { value: true });
        content = content.replace(/Object\.defineProperty\(exports,\s*"__esModule",\s*\{\s*value:\s*true\s*\}\);?\n?/g, '');
        
        // 移除 exports.XXX = exports.YYY = ... = void 0; 这样的链式声明
        content = content.replace(/exports\.\w+\s*=\s*exports\.\w+\s*=.*?void\s+0;?\n?/g, '');
        
        // 完全移除所有 require 语句（因为所有模块都在同一作用域）
        content = content.replace(/const\s+\w+\s*=\s*require\(["']\.\/[\w-]+["']\);?\n?/g, '');
        
        // 将 exports.XXX = { ... }; 转换为 const XXX = { ... };（支持多行对象）
        content = content.replace(/exports\.(\w+)\s*=\s*(\{[\s\S]*?\};?)/g, 'const $1 = $2');
        
        // 移除剩余的简单 exports.xxx = xxx; 形式的导出
        content = content.replace(/exports\.\w+\s*=\s*\w+;?\n?/g, '');
        
        // 将 (0, xxx.yyy) 形式的调用改为直接调用 yyy
        content = content.replace(/\(0,\s*\w+\.(\w+)\)/g, '$1');
        
        // 将 xxx.yyy 形式的引用改为直接引用 yyy（仅针对已知的导入模块）
        content = content.replace(/\butils_1\.(\w+)/g, '$1');
        content = content.replace(/\bconfig_1\.(\w+)/g, '$1');
        content = content.replace(/\bmaintain_1\.(\w+)/g, '$1');
        content = content.replace(/\bexperience_level_1\.(\w+)/g, '$1');
        content = content.replace(/\bcurrency_system_1\.(\w+)/g, '$1');
        content = content.replace(/\binfo_injection_1\.(\w+)/g, '$1');
        content = content.replace(/\bevent_chain_system_current_1\.(\w+)/g, '$1');
        content = content.replace(/\bevent_chain_system_inject_1\.(\w+)/g, '$1');
        
        // 清理多余的空行
        content = content.replace(/\n{3,}/g, '\n\n');
        
        contents.push(`// ============================================================`);
        contents.push(`// ${file}`);
        contents.push(`// ============================================================`);
        contents.push(content.trim());
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
