/* Loads data/lessons/*.js in Node with a minimal DSA stub and prints every
   runnable code block as JSON, so tools/build.py can test them with Python. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const sandbox = { console, location: { search: '' }, DSA: { py: {} } };
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'js', 'core.js'), 'utf8'), sandbox, { filename: 'core.js' });
vm.runInContext(fs.readFileSync(path.join(root, 'js', 'py', 'debugger.js'), 'utf8'), sandbox, { filename: 'debugger.js' });
const dir = path.join(root, 'data', 'lessons');
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.js')).sort()) {
  vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), sandbox, { filename: f });
}
const DSA = sandbox.DSA;
const out = [];
for (const id of DSA.lessonOrder) {
  for (const s of DSA.lessons[id].sections) {
    if (s.t === 'code' && s.run != null) out.push({ lesson: id, title: s.title || '', code: s.code, run: s.run, expect: s.expect == null ? null : String(s.expect) });
  }
}
if (DSA.playgroundSamples) for (const s of DSA.playgroundSamples) out.push({ lesson: 'playground', title: s.title, code: s.code, run: s.driver || '', expect: null });
process.stdout.write(JSON.stringify(out));
