const fs = require('fs-extra');
const { execSync } = require('child_process');
const path = require('path');
const esbuild = require('esbuild');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function build() {
  try {
    log('🚀 开始构建项目...', 'cyan');
    
    // 1. 清理dist目录
    log('\n📦 清理构建目录...', 'yellow');
    if (fs.existsSync('dist')) {
      await fs.remove('dist');
      log('✓ 已清理 dist 目录', 'green');
    }
    
    // 2. 使用 esbuild 打包和编译 TypeScript
    log('\n🔨 打包和编译 TypeScript...', 'yellow');
    try {
      const packageJson = require('./package.json');
      const now = new Date();
      const buildDate = now.toISOString().split('T')[0];
      const buildTime = now.toTimeString().split(' ')[0];
      
      // 构建文件头部注释
      const banner = `// ============================================================
// Automated Script for Destined Journey
// 命定的异世界开发之旅自动化脚本
// ============================================================
// Version: ${packageJson.version}
// Build Date: ${buildDate} ${buildTime}
// Author: ${packageJson.author}
// License: ${packageJson.license}
// Repository: ${packageJson.repository.url}
// ============================================================
`;
      
      await esbuild.build({
        entryPoints: ['src/main-controller.ts'],
        bundle: true,
        outfile: 'dist/automated-script-for-destined-journey.js',
        platform: 'browser',
        format: 'iife',
        target: 'es2020',
        minify: false,
        sourcemap: false,
        banner: {
          js: banner
        }
        
      });
      log('✓ TypeScript 打包编译完成', 'green');
      const distFile = 'dist/automated-script-for-destined-journey.js';
      let content = await fs.readFile(distFile, 'utf8');
      content = content.replace(/\\u([\dA-F]{4})/gi, (_, g) => String.fromCharCode(parseInt(g, 16)));
      await fs.writeFile(distFile, content, 'utf8');
      log(`  构建日期: ${buildDate} ${buildTime}`, 'cyan');
    } catch (error) {
      log('✗ TypeScript 打包编译失败', 'red');
      throw error;
    }
    
    // 3. 复制必要的文件
    log('\n📋 复制必要文件...', 'yellow');
    const filesToCopy = [
      'package.json',
      'README.md',
      'LICENSE',
      'DOC.md'
    ];
    
    for (const file of filesToCopy) {
      if (fs.existsSync(file)) {
        await fs.copy(file, path.join('dist', file));
        log(`✓ 已复制 ${file}`, 'green');
      }
    }
    
    // 4. 创建简化的package.json用于发布
    log('\n📝 创建发布版 package.json...', 'yellow');
    const packageJson = await fs.readJson('package.json');
    const distPackageJson = {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description,
      main: 'automated-script-for-destined-journey.js',
      keywords: packageJson.keywords,
      author: packageJson.author,
      license: packageJson.license,
      repository: packageJson.repository,
      bugs: packageJson.bugs,
      homepage: packageJson.homepage,
      engines: packageJson.engines
    };
    
    await fs.writeJson(path.join('dist', 'package.json'), distPackageJson, { spaces: 2 });
    log('✓ 已创建发布版 package.json', 'green');
    
    // 5. 显示构建统计
    log('\n📊 构建统计:', 'cyan');
    const distFiles = await fs.readdir('dist');
    const jsFiles = distFiles.filter(f => f.endsWith('.js'));
    log(`  - JavaScript 文件: ${jsFiles.length}`, 'green');
    log(`  - 总文件数: ${distFiles.length}`, 'green');
    
    // 6. 计算构建大小
    const mainScriptPath = path.join('dist', 'automated-script-for-destined-journey.js');
    if (fs.existsSync(mainScriptPath)) {
      const stats = await fs.stat(mainScriptPath);
      log(`  - 主脚本大小: ${(stats.size / 1024).toFixed(2)} KB`, 'green');
    }
    
    let totalSize = 0;
    for (const file of distFiles) {
      const filePath = path.join('dist', file);
      const stats = await fs.stat(filePath);
      if (stats.isFile()) {
        totalSize += stats.size;
      }
    }
    log(`  - 总大小: ${(totalSize / 1024).toFixed(2)} KB`, 'green');
    
    log('\n✨ 构建完成！', 'green');
    log(`📁 输出目录: ${path.resolve('dist')}`, 'cyan');
    
  } catch (error) {
    log('\n❌ 构建失败！', 'red');
    console.error(error);
    process.exit(1);
  }
}

// 执行构建
build();
