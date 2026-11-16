// Every game module must at least load (catches syntax errors, e.g. a stray
// quote in a string, before they reach the live site).
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const files = [];
const walk = (dir) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.js')) files.push(p);
  }
};
walk(join(root, 'src'));
walk(join(root, 'data'));

let failed = 0;
const log = console.log;
const quiet = () => { console.log = console.error = console.warn = () => {}; };
const loud = () => { console.log = log; console.error = console.warn = log; };
process.on('unhandledRejection', () => {}); // browser-only code failing in Node is fine
for (const f of files) {
  quiet();
  try {
    await import(f);
  } catch (e) {
    // Modules that need a browser (window, document) are fine; syntax errors are not.
    if (e instanceof SyntaxError) { failed++; loud(); log(`FAIL ${f.slice(root.length)}: ${e.message}`); }
  }
  loud();
}
console.log(failed ? `modules_load: ${failed} FAILED` : `modules_load: all ${files.length} modules parse`);
if (failed) process.exitCode = 1;
