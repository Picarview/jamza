import { readdir, readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';

async function walk(directory) {
  const files = [];
  for (const name of await readdir(directory)) {
    const file = resolve(directory, name);
    if ((await stat(file)).isDirectory()) files.push(...(await walk(file)));
    else files.push(file);
  }
  return files;
}

const files = (await Promise.all(['src', 'scripts', 'tests'].map(walk))).flat();
files.push(resolve('vite.config.js'), resolve('playwright.config.js'));
let checked = 0;
for (const file of files.filter((name) => /\.(?:m?js)$/.test(name))) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || `Syntax check failed: ${file}`);
  const source = await readFile(file, 'utf8');
  for (const match of source.matchAll(/(?:from\s+|import\s*)['"]([^'"]+)['"]/g)) {
    if (match[1].startsWith('.') && !existsSync(resolve(dirname(file), match[1]))) {
      throw new Error(`Missing import ${match[1]} in ${file}`);
    }
  }
  checked++;
}
for (const name of ['index.html', 'admin.html', '404.html']) {
  const html = await readFile(name, 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  if (new Set(ids).size !== ids.length) throw new Error(`Duplicate element ID in ${name}`);
  for (const match of html.matchAll(/(?:src|href)="(\/src\/[^"#?]+)"/g)) {
    if (!existsSync(resolve(match[1].slice(1)))) throw new Error(`Missing page entry: ${match[1]}`);
  }
  if (!html.includes('type="module"')) throw new Error(`Missing module entry in ${name}`);
}
console.log(`Checked ${checked} JavaScript files, relative imports, and three HTML entries.`);
