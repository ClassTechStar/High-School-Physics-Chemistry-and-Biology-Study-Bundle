/**
 * handler-integrity: data-tool / onclick handlers vs window exports
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const APP = join(ROOT, '1.2');
const html = readFileSync(join(APP, 'index.html'), 'utf8');

// collect window.X = and function declarations that look global
const exports = new Set();
const jsDir = join(APP, 'js');
for (const f of readdirSync(jsDir)) {
  if (!f.endsWith('.js')) continue;
  const src = readFileSync(join(jsDir, f), 'utf8');
  for (const m of src.matchAll(/window\.([A-Za-z_$][\w$]*)\s*=/g)) exports.add(m[1]);
  for (const m of src.matchAll(/(?:^|\n)(?:function|const|let|var)\s+([A-Za-z_$][\w$]*)/g)) exports.add(m[1]);
  // also object method assignments photosynthesisTrainerEnhanced.foo
}

// onclick="foo.bar(" or onclick="foo("
const onclickFns = new Set();
for (const m of html.matchAll(/onclick="([^"]+)"/g)) {
  for (const call of m[1].matchAll(/([A-Za-z_$][\w$.]*)\s*\(/g)) {
    onclickFns.add(call[1]);
  }
}
// also from JS files
for (const f of readdirSync(jsDir)) {
  if (!f.endsWith('.js')) continue;
  const src = readFileSync(join(jsDir, f), 'utf8');
  for (const m of src.matchAll(/onclick=\\?"([A-Za-z_$][\w$.]*)\s*\(/g)) {
    onclickFns.add(m[1]);
  }
  for (const m of src.matchAll(/onclick="([A-Za-z_$][\w$.]*)\s*\(/g)) {
    onclickFns.add(m[1]);
  }
}

const missing = [];
for (const fn of onclickFns) {
  const root = fn.split('.')[0];
  // skip builtins
  if (['alert', 'confirm', 'prompt', 'event'].includes(root)) continue;
  if (!exports.has(root)) missing.push(fn);
}

console.log('onclick root symbols checked:', onclickFns.size);
console.log('potentially missing exports:', missing.length);
for (const m of missing.slice(0, 40)) console.log(' ', m);

// data-tool routing in index inline script
const toolCases = new Set([...html.matchAll(/case\s+'([^']+)'/g)].map((m) => m[1]));
const dataTools = new Set([...html.matchAll(/data-tool="([^"]+)"/g)].map((m) => m[1]));
const unrouted = [...dataTools].filter((t) => !toolCases.has(t) && !html.includes(`id="${t}-section"`));
console.log('data-tool count', dataTools.size, 'switch cases', toolCases.size);
console.log('data-tool without case and without *-section:', unrouted.length);
// These may still be handled by default or other maps - info only
console.log(' sample unrouted:', unrouted.slice(0, 15).join(', '));

// check specific critical handlers used on home
const critical = ['switchSubject', 'navigateTo', 'loadModuleContent', 'toggleTheme', 'handleToolClick'];
for (const c of critical) {
  console.log(c, exports.has(c) ? 'OK' : 'MISSING');
}
