import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'NetMock');

const runtimeEntries = [
  'manifest.json',
  'src',
  'ui',
  'assets/icons',
  'rules'
];

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function ensureRuntimeEntries() {
  const missing = [];

  for (const entry of runtimeEntries) {
    const fullPath = path.join(rootDir, entry);
    if (!(await exists(fullPath))) {
      missing.push(entry);
    }
  }

  if (missing.length > 0) {
    throw new Error(`缺少运行时文件/目录: ${missing.join(', ')}`);
  }
}

async function copyRuntimeFiles() {
  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(outDir, { recursive: true });

  for (const entry of runtimeEntries) {
    const srcPath = path.join(rootDir, entry);
    const destPath = path.join(outDir, entry);

    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.cp(srcPath, destPath, { recursive: true });
  }
}

async function calcDirSize(targetPath) {
  const stat = await fs.stat(targetPath);
  if (stat.isFile()) {
    return stat.size;
  }

  let total = 0;
  const children = await fs.readdir(targetPath, { withFileTypes: true });
  for (const child of children) {
    const childPath = path.join(targetPath, child.name);
    total += await calcDirSize(childPath);
  }
  return total;
}

async function main() {
  await ensureRuntimeEntries();
  await copyRuntimeFiles();

  const bytes = await calcDirSize(outDir);
  const kb = (bytes / 1024).toFixed(1);
  const mb = (bytes / 1024 / 1024).toFixed(3);

  console.log('✅ 已生成最小 CRX 发布目录');
  console.log(`📁 目录: ${path.relative(rootDir, outDir)}`);
  console.log(`📦 体积: ${kb} KB (${mb} MB)`);
  console.log('📝 包含内容: manifest.json, src, ui, assets/icons, rules');
}

main().catch((err) => {
  console.error('❌ 生成失败:', err.message);
  process.exit(1);
});
