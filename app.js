// App logic. Card content lives in data.js (forms, emphasis, belts).

const $ = id => document.getElementById(id);
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const nb = s => s.replace(/-/g, '\u2011'); // non-breaking hyphen

// IDs come from names, so adding or reordering cards never scrambles saved progress.
const cards = [
  ...forms.flatMap(([name, n, meaning]) => [
    { id: 'meaning:' + slug(name), type: 'meaning', name, question: 'What is the meaning of ' + nb(name) + '?', answer: meaning },
    { id: 'movements:' + slug(name), type: 'movements', name, question: 'How many movements are in ' + nb(name) + '?', answer: String(n) }
  ]),
  ...belts.map(([name, answer]) => ({ id: 'belt:' + slug(name), type: 'belts', name: name + ' Belt', question: 'What does the ' + name + ' Belt mean?', answer }))
];
const byId = new Map(cards.map(c => [c.id, c]));
const TYPE_LABELS = { meaning: 'Form meaning', movements: 'Movement count', belts: 'Belt meaning' };
// Touch devices get tap wording; mouse/keyboard devices get the Space shortcut.
const touch = matchMedia('(hover: none), (pointer: coarse)').matches;
const HINT_FRONT = touch ? 'Tap the card to reveal' : 'Click or press Space to reveal';
const HINT_BACK = touch ? 'Tap to see the question again' : 'Click or press Space to see the question again';
const LONG_ANSWER = 160; // characters; longer answers get a smaller font on phones
const CATEGORIES = { all: 'All cards', meaning: 'Meanings', movements: 'Movements', belts: 'Belts' };

// Category menu with live counts.
$('category').innerHTML = Object.entries(CATEGORIES).map(([value, label]) => {
  const count = value === 'all' ? cards.length : cards.filter(c => c.type === value).length;
  return '<option value="' + value + '">' + label + ' · ' + count + '</option>';
}).join('');

// revealed: the answer of the current card has been shown at least once, so it can be rated.
let deck = [], index = 0, flipped = false, revealed = false, known = 0, missed = [], review = false;

const storageKey = 'ironhorse-flashcards-v2';
let storageOk = true;
try { localStorage.removeItem('ironhorse-flashcards-v1'); } catch (e) {} // retired save format

function save() {
  try {
    localStorage.setItem(storageKey, JSON.stringify({
      category: $('category').value, review, deck: deck.map(c => c.id), index, known, missed: missed.map(c => c.id)
    }));
  } catch (e) {
    storageOk = false;
    showRemaining();
  }
}

function showRemaining() {
  if (index >= deck.length) return;
  $('remaining').textContent = (deck.length - index) + ' cards remaining' +
    (storageOk ? '' : ' · progress can\u2019t be saved in this browser');
}

function selected() {
  const cat = $('category').value;
  return cards.filter(c => cat === 'all' || c.type === cat);
}

function start(items, isReview = false) {
  deck = [...items]; index = 0; known = 0; missed = []; review = isReview;
  $('practice').classList.remove('hidden');
  $('done').classList.add('hidden');
  render(); save();
}

function render() {
  flipped = false;
  revealed = false;
  const c = deck[index];
  $('position').textContent = (review ? 'Missed-card review · ' : '') + 'Card ' + (index + 1) + ' of ' + deck.length;
  $('score').textContent = known + ' got it · ' + missed.length + ' to revisit';
  $('progress').style.width = (index / deck.length * 100) + '%';
  $('label').textContent = TYPE_LABELS[c.type];
  $('content').className = 'question';
  $('content').textContent = c.question;
  $('hint').textContent = HINT_FRONT;
  $('announce').textContent = '';
  $('card').setAttribute('aria-label', c.question + ' Reveal answer');
  $('again').disabled = $('known').disabled = true;
  showRemaining();
}

function showAnswer(c) {
  const node = $('content');
  node.textContent = '';
  let rest = c.answer;
  for (const phrase of (emphasis[c.name] || [])) {
    const at = rest.indexOf(phrase);
    if (at < 0) continue;
    node.appendChild(document.createTextNode(rest.slice(0, at)));
    const strong = document.createElement('strong');
    strong.textContent = phrase;
    node.appendChild(strong);
    rest = rest.slice(at + phrase.length);
  }
  node.appendChild(document.createTextNode(rest));
}

function flip() {
  if (index >= deck.length) return;
  flipped = !flipped;
  const c = deck[index];
  if (flipped && c.type === 'meaning') showAnswer(c);
  else $('content').textContent = flipped ? c.answer : c.question;
  $('content').className = flipped ? (c.type === 'movements' ? 'answer count' : 'answer' + (c.answer.length > LONG_ANSWER ? ' long' : '')) : 'question';
  $('hint').textContent = flipped ? HINT_BACK : HINT_FRONT;
  // Screen readers don't reliably read a changed button label, so announce the flip.
  $('announce').textContent = flipped ? 'Answer: ' + c.answer : c.question;
  $('card').setAttribute('aria-label', flipped ? c.answer + ' Show question' : c.question + ' Reveal answer');
  // Rating unlocks once the answer has been seen, and stays unlocked if the card is turned back.
  if (flipped) revealed = true;
  $('again').disabled = $('known').disabled = !revealed;
}

function showDone() {
  $('practice').classList.add('hidden');
  $('done').classList.remove('hidden');
  $('summary').textContent = known + ' of ' + deck.length + ' recalled. ' +
    (missed.length ? missed.length + ' cards ready for another pass.' : 'You recalled every card in this round.');
  $('review').disabled = !missed.length;
}

function rate(got) {
  if (index >= deck.length || !revealed) return;
  if (got) known++; else missed.push(deck[index]);
  index++;
  save();
  if (index < deck.length) render(); else showDone();
}

function shuffled(items) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

$('card').onclick = flip;
$('known').onclick = () => rate(true);
$('again').onclick = () => rate(false);
$('category').onchange = () => start(selected());
// Restart keeps the current round: same order, same review mode.
$('restart').onclick = () => start(deck, review);
$('newsession').onclick = () => start(selected());
$('review').onclick = () => start(missed, true);
$('shuffle').onclick = () => start(shuffled(review ? deck : selected()), review);

// Shortcuts: 1 and 2 work anywhere except form fields. Space flips the card, unless Tab moved
// focus to another button; then Space presses that button as usual. A button focused by a mouse
// click or tap doesn't count, so Space keeps flipping cards after you click Shuffle.
let tabbing = false, tabbedTo = null;
document.addEventListener('keydown', e => { if (e.key === 'Tab') tabbing = true; }, true);
document.addEventListener('pointerdown', () => { tabbing = false; tabbedTo = null; }, true);
document.addEventListener('focusin', e => { tabbedTo = tabbing ? e.target : null; tabbing = false; });
document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const el = document.activeElement;
  if (['SELECT', 'INPUT', 'TEXTAREA'].includes(el.tagName)) return;
  if (e.code === 'Space') {
    if (el.tagName === 'BUTTON' && el.id !== 'card' && el === tabbedTo) return;
    e.preventDefault(); flip();
  }
  else if (e.key === '1') rate(false);
  else if (e.key === '2') rate(true);
});

function restore() {
  try {
    const s = JSON.parse(localStorage.getItem(storageKey));
    if (!s || !(s.category in CATEGORIES) || !Array.isArray(s.deck) || !s.deck.length) return false;
    const restored = s.deck.map(id => byId.get(id));
    if (restored.some(c => !c) || !Number.isInteger(s.index) || s.index < 0 || s.index > restored.length ||
        !Number.isInteger(s.known) || s.known < 0 || !Array.isArray(s.missed) || s.missed.some(id => !byId.has(id)) ||
        s.known + s.missed.length !== s.index) return false;
    $('category').value = s.category;
    deck = restored; index = s.index; known = s.known; missed = s.missed.map(id => byId.get(id)); review = !!s.review;
    if (index < deck.length) render(); else showDone();
    return true;
  } catch (e) {
    return false;
  }
}
if (!restore()) start(cards);

// Offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

// Install prompt (Chrome, Edge, Android)
let installEvent = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  installEvent = e;
  $('install').classList.remove('hidden');
});
$('install').onclick = async () => {
  if (!installEvent) return;
  installEvent.prompt();
  await installEvent.userChoice;
  installEvent = null;
  $('install').classList.add('hidden');
};
window.addEventListener('appinstalled', () => $('install').classList.add('hidden'));

// iPhone/iPad have no install prompt, so show a one-time Add to Home Screen hint in Safari.
(() => {
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = navigator.standalone || matchMedia('(display-mode: standalone)').matches;
  let dismissed = false;
  try { dismissed = localStorage.getItem('ironhorse-ios-hint') === 'dismissed'; } catch (e) {}
  if (!ios || standalone || dismissed) return;
  $('ioshint').classList.remove('hidden');
  $('ioshint-close').onclick = () => {
    $('ioshint').classList.add('hidden');
    try { localStorage.setItem('ironhorse-ios-hint', 'dismissed'); } catch (e) {}
  };
})();
