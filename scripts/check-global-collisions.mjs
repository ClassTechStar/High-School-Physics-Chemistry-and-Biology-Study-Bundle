/**
 * check-global-collisions.mjs — 扫描 1.2 前端脚本顶层 const/let/class 声明的跨文件重名
 * 同名声明会在浏览器全局作用域抛 SyntaxError 并使整个文件静默失效。
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const APP = join(ROOT, '1.2');

const decls = new Map(); // name -> [file...]
function scan(name, src) {
  // 顶层近似检测：排除行首缩进的声明（函数体内部的），够用且低误报
  for (const m of src.matchAll(/^(?:const|let|class)\s+([A-Za-z_$][\w$]*)/gm)) {
    if (!decls.has(m[1])) decls.set(m[1], []);
    decls.get(m[1]).push(name);
  }
}

for (const f of readdirSync(join(APP, 'js'))) {
  if (f.endsWith('.js')) scan(f, readFileSync(join(APP, 'js', f), 'utf8'));
}
const html = readFileSync(join(APP, 'index.html'), 'utf8');
for (const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) scan('index.html(inline)', m[1]);

let bad = 0;
for (const [name, files] of decls) {
  if (files.length > 1) {
    bad++;
    console.log(`DUP ${name}: ${files.join(', ')}`);
  }
}
console.log(bad === 0 ? 'OK: 无跨文件顶层声明重名' : `发现 ${bad} 个重名声明`);
process.exit(0);
