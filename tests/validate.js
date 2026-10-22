#!/usr/bin/env node
// Checks the card data and site files before deploy. Run locally with: node tests/validate.js
// The deploy workflow runs it first, so a mistake in data.js stops the deploy instead of going live.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const errors = [];
const fail = msg => errors.push(msg);

// Load data.js the same way the browser does (as a plain script).
const sandbox = {};
try {
  vm.runInNewContext(fs.readFileSync(path.join(root, 'data.js'), 'utf8') + '\n;this.forms=forms;this.emphasis=emphasis;this.belts=belts;', sandbox);
} catch (e) {
  console.error('data.js could not be loaded: ' + e.message);
  process.exit(1);
}
const { forms, emphasis, belts } = sandbox;

// Forms: [name, movement count, meaning]
if (!Array.isArray(forms) || !forms.length) fail('forms must be a non-empty list');
const names = new Set();
(forms || []).forEach((f, i) => {
  const where = 'forms[' + i + ']' + (Array.isArray(f) && typeof f[0] === 'string' ? ' (' + f[0] + ')' : '');
  if (!Array.isArray(f) || f.length !== 3) return fail(where + ': must be [name, movement count, meaning]');
  const [name, count, meaning] = f;
  if (typeof name !== 'string' || !name.trim()) fail(where + ': name is missing');
  if (names.has(name)) fail(where + ': duplicate form name');
  names.add(name);
  if (!Number.isInteger(count) || count < 1) fail(where + ': movement count must be a whole number above 0, got ' + JSON.stringify(count));
  if (typeof meaning !== 'string' || !meaning.trim()) fail(where + ': meaning is missing');
});

// Emphasis: every key is a form, every phrase appears in that form's meaning, in order.
for (const [name, phrases] of Object.entries(emphasis || {})) {
  const form = (forms || []).find(f => f[0] === name);
  if (!form) { fail('emphasis["' + name + '"]: no form has this name'); continue; }
  if (!Array.isArray(phrases)) { fail('emphasis["' + name + '"]: must be a list of phrases'); continue; }
  let rest = form[2];
  for (const phrase of phrases) {
    const at = rest.indexOf(phrase);
    if (at < 0) fail('emphasis["' + name + '"]: phrase not found in the meaning (check spelling, quotes, and order): "' + phrase + '"');
    else rest = rest.slice(at + phrase.length);
  }
}

// Belts: [color, meaning]
if (!Array.isArray(belts) || !belts.length) fail('belts must be a non-empty list');
const colors = new Set();
(belts || []).forEach((b, i) => {
  if (!Array.isArray(b) || b.length !== 2 || !String(b[0]).trim() || !String(b[1]).trim()) return fail('belts[' + i + ']: must be [color, meaning]');
  if (colors.has(b[0])) fail('belts[' + i + ']: duplicate belt "' + b[0] + '"');
  colors.add(b[0]);
});

// Every file the offline cache and the page reference must exist.
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const assets = (sw.match(/const ASSETS = \[([\s\S]*?)\];/) || [, ''])[1].match(/'([^']+)'/g) || [];
if (!assets.length) fail('sw.js: could not read the ASSETS list');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const refs = [
  ...assets.map(a => a.slice(1, -1)),
  ...[...html.matchAll(/(?:src|href)="([^"#:]+)"/g)].map(m => m[1]),
  ...[...css.matchAll(/url\("?([^")]+)"?\)/g)].map(m => m[1]),
  ...JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8')).icons.map(i => i.src)
];
for (const ref of new Set(refs)) {
  if (ref === './') continue;
  if (!fs.existsSync(path.join(root, ref))) fail('missing file: ' + ref);
}
// Local files the page loads should also be cached for offline use.
for (const m of html.matchAll(/(?:src|href)="([^"#:]+\.(?:js|css|woff2|jpg|png|webmanifest))"/g)) {
  if (!assets.includes("'" + m[1] + "'")) fail('sw.js: ' + m[1] + ' is used by index.html but not cached for offline use');
}

if (errors.length) {
  console.error('Found ' + errors.length + ' problem(s):\n  - ' + errors.join('\n  - '));
  process.exit(1);
}
console.log('OK: ' + forms.length + ' forms, ' + Object.keys(emphasis).length + ' with emphasis, ' + belts.length + ' belts, ' + assets.length + ' cached files.');
