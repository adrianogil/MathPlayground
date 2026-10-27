(() => {
  'use strict';
  const E = window.SixtySeven, messages = window.SixtySevenMessages;
  const $ = id => document.getElementById(id);
  const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const save = (key, value) => { try { localStorage.setItem(key, String(value)); } catch { /* Gameplay works without storage. */ } };
  let language = read('67-language');
  if (!messages[language]) language = 'pt-BR';
  let wins = Math.max(0, Math.min(99999, Number.parseInt(read('67-wins'), 10) || 0));
  let round = 1, level = 1, levelSolved = 0, initial = { numbers: [40, 27], ops: ['+'], level: 1 };
  let state = E.createState(initial.numbers, initial.ops), history = [];
  let aId = null, bId = null, op = null, awarded = false, notice = { key: 'ready', vars: {} };
  const t = (key, vars = {}) => messages[language][key].replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? '');
  const opKeys = { '+': 'opAdd', '-': 'opSubtract', '*': 'opMultiply', '/': 'opDivide' };
  function say(key, vars = {}) { notice = { key, vars }; }
  function clearSelection() { aId = bId = op = null; }
  function tile(id) { return state.tiles.find(piece => piece.id === id); }
  function pick(id) {
    if (awarded || !state.ops.length) return;
    if (aId === id) aId = null;
    else if (bId === id) bId = null;
    else if (aId === null) aId = id;
    else if (bId === null) bId = id;
    else { say('twoAtATime'); render(); document.querySelector(`[data-tile-id="${id}"]`)?.focus({ preventScroll: true }); return; }
    say('selected');
    if (combineSelection()) return;
    render();
    document.querySelector(`[data-tile-id="${id}"]`)?.focus({ preventScroll: true });
  }
  function render() {
    document.documentElement.lang = language;
    document.querySelector('meta[name="description"]').content = t('description');
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n, { numbers: initial.numbers.length, operations: initial.ops.length }); });
    $('language').value = language;
    $('round-label').textContent = t('round', { n: round });
    $('level-label').textContent = t('level', { n: level });
    $('level-help').textContent = t(level < 4 ? (levelSolved >= E.PRACTICE_ROUNDS ? 'levelReady' : 'progressHelp') : 'masterHelp', { done: levelSolved, total: E.PRACTICE_ROUNDS });
    $('pieces-left').textContent = t('piecesLeft', { n: state.tiles.length });
    $('operations').setAttribute('aria-label', t('operations'));
    $('numbers').style.setProperty('--tile-columns', initial.numbers.length);
    $('numbers').style.setProperty('--compact-columns', Math.min(3, initial.numbers.length));
    $('numbers').replaceChildren(...initial.numbers.map((_, slot) => {
      const piece = state.tiles.find(candidate => candidate.slot === slot);
      if (!piece) {
        const empty = document.createElement('span'); empty.className = 'consumed-tile';
        const mark = document.createElement('span'); mark.textContent = '✓'; mark.setAttribute('aria-hidden', 'true');
        const caption = document.createElement('small'); caption.textContent = t('combinedTile');
        empty.append(mark, caption); return empty;
      }
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'number-tile'; button.dataset.color = slot;
      if (piece.id >= initial.numbers.length) button.classList.add('result');
      const value = E.format(piece.value);
      if (value.length > 3) button.classList.add('fraction');
      const label = document.createElement('span'); label.className = 'tile-value'; label.textContent = value; button.append(label); button.dataset.tileId = piece.id;
      if (piece.id >= initial.numbers.length) {
        const origin = document.createElement('small'); origin.className = 'tile-origin'; origin.textContent = t('resultLabel'); button.title = piece.expression; button.append(origin);
        if (piece.id === state.nextId - 1) button.classList.add('new-result');
      }
      button.setAttribute('aria-label', piece.id >= initial.numbers.length ? t('resultTile', { n: value, expression: piece.expression }) : t('selectTile', { n: value }));
      const selected = piece.id === aId || piece.id === bId;
      button.setAttribute('aria-pressed', String(selected));
      button.disabled = awarded || !state.ops.length;
      if (selected) { const order = document.createElement('span'); order.className = 'order'; order.textContent = piece.id === aId ? '1' : '2'; order.setAttribute('aria-hidden', 'true'); button.append(order); }
      button.addEventListener('click', () => pick(piece.id));
      return button;
    }));
    $('operations').replaceChildren(...initial.ops.map(operation => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'operation';
      button.textContent = E.symbols[operation]; button.dataset.operation = operation;
      button.disabled = !state.ops.includes(operation) || awarded;
      button.setAttribute('aria-pressed', String(op === operation));
      button.setAttribute('aria-label', t(opKeys[operation]) + (button.disabled ? ` (${t('used')})` : ''));
      button.addEventListener('click', () => {
        op = op === operation ? null : operation; say('selected');
        if (combineSelection()) return;
        render(); document.querySelector(`[data-operation="${operation}"]`).focus({ preventScroll: true });
      });
      return button;
    }));
    $('swap').disabled = aId === null || bId === null;
    $('selection-tools').hidden = aId === null && bId === null && op === null;
    $('swap').hidden = aId === null || bId === null;
    $('selection-prompt').textContent = t(aId === null ? 'pickFirst' : op === null ? 'pickOperation' : bId === null ? 'pickSecond' : 'readyToCombine');
    const finished = !state.ops.length;
    $('composer').hidden = finished;
    $('finished').hidden = !finished;
    $('finished-value').textContent = finished ? E.format(state.tiles[0].value) : '';
    $('finished-explanation').textContent = t(awarded ? 'allUsedWin' : 'allUsedRetry');
    $('finished-expression').textContent = finished ? `${state.tiles[0].expression} = ${E.format(state.tiles[0].value)}` : '';
    $('step-label').textContent = t(finished ? 'stepsDone' : 'stepLabel', { n: state.steps.length + 1, total: initial.ops.length });
    const usedNumbers = initial.numbers.length - state.tiles.filter(piece => piece.id < initial.numbers.length).length;
    $('usage-count').textContent = t('usageCount', { used: usedNumbers, numbers: initial.numbers.length, done: state.steps.length, operations: initial.ops.length });
    $('original-pieces').replaceChildren(...initial.numbers.map((number, id) => {
      const chip = document.createElement('span'), used = !tile(id);
      chip.className = used ? 'incorporated' : '';
      chip.textContent = `${used ? '✓ ' : ''}${number}`;
      chip.setAttribute('aria-label', t(used ? 'numberInResult' : 'numberWaiting', { n: number }));
      return chip;
    }));
    $('undo').disabled = !history.length || awarded;
    $('restart').disabled = (!history.length && aId === null && bId === null && op === null) || awarded;
    $('hint').disabled = awarded;
    $('status').textContent = t(notice.key, notice.vars);
    $('status').className = 'status' + (awarded ? ' success' : ['hintMove', 'noSolution'].includes(notice.key) ? ' hint' : '');
    $('history-panel').hidden = !state.steps.length;
    $('history-count').textContent = `${state.steps.length}/${initial.ops.length}`;
    $('history').replaceChildren(...state.steps.map(step => {
      const li = document.createElement('li'); li.textContent = equation(step); return li;
    }));
    if (!state.steps.length) { const li = document.createElement('li'); li.textContent = t('historyEmpty'); $('history').append(li); }
    $('wins').textContent = wins.toLocaleString(language);
    $('collection-text').textContent = t('collectionText');
    $('stars').replaceChildren(...Array.from({ length: 5 }, (_, i) => {
      const star = document.createElement('span'); star.textContent = '★';
      // Each completed group of five remains filled until the next star is earned.
      if (i < (wins === 0 ? 0 : (wins - 1) % 5 + 1)) star.className = 'earned';
      return star;
    }));
    $('next').querySelector('span').textContent = t(awarded ? (level < 4 && levelSolved >= E.PRACTICE_ROUNDS ? 'nextLevel' : 'nextRound') : 'newRound');
    $('practice-level').hidden = !(awarded && level < 4 && levelSolved >= E.PRACTICE_ROUNDS);
  }
  function equation(step) { return `${E.format(step.a)} ${E.symbols[step.op]} ${E.format(step.b)} = ${E.format(step.value)}`; }
  function celebrate() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const colors = ['#de513f', '#6950af', '#f9d966', '#72b994', '#6faacb'];
    for (let i = 0; i < 45; i++) {
      const bit = document.createElement('i'); bit.className = 'confetto';
      bit.style.left = `${Math.random() * 100}%`; bit.style.background = colors[i % colors.length]; bit.style.animationDelay = `${Math.random() * .5}s`;
      $('confetti').append(bit); setTimeout(() => bit.remove(), 3200);
    }
  }
  function combineSelection() {
    if (aId === null || bId === null || !op || awarded) return false;
    let next;
    try { next = E.combine(state, aId, op, bId); } catch (error) { say(error.message === 'zero' ? 'zero' : 'range'); render(); return true; }
    history.push(state); state = next; clearSelection();
    if (E.won(state)) { awarded = true; levelSolved = Math.min(E.PRACTICE_ROUNDS, levelSolved + 1); wins++; save('67-wins', wins); say('win'); celebrate(); }
    else if (!state.ops.length) say('miss', { n: E.format(state.tiles[0].value) });
    else if (state.tiles.some(piece => piece.value.n === 67 * piece.value.d)) say('early');
    else say('afterMove', { n: E.format(state.tiles.at(-1).value) });
    render();
    (awarded ? $('next') : state.ops.length ? $('numbers').querySelector(`[data-tile-id="${state.nextId - 1}"]`) : $('undo')).focus();
    return true;
  }
  $('undo').addEventListener('click', () => { if (history.length && !awarded) { state = history.pop(); clearSelection(); say('ready'); render(); $('numbers').querySelector('button').focus({ preventScroll: true }); } });
  $('restart').addEventListener('click', () => { if (awarded) return; state = E.createState(initial.numbers, initial.ops); history = []; clearSelection(); say('ready'); render(); $('numbers').querySelector('button').focus({ preventScroll: true }); });
  function nextRound(stay = false) {
    const nextLevel = stay ? level : E.levelAfter(level, levelSolved);
    if (nextLevel !== level || stay) levelSolved = 0;
    level = nextLevel;
    initial = E.generate(level, Math.random, initial);
    state = E.createState(initial.numbers, initial.ops); history = []; awarded = false; round++;
    clearSelection(); say('ready'); render(); $('numbers').querySelector('button').focus({ preventScroll: true });
  }
  $('next').addEventListener('click', () => nextRound());
  $('practice-level').addEventListener('click', () => nextRound(true));
  $('swap').addEventListener('click', () => { [aId, bId] = [bId, aId]; say('selected'); if (!combineSelection()) render(); });
  $('clear-selection').addEventListener('click', () => { clearSelection(); say('ready'); render(); $('numbers').querySelector('button').focus({ preventScroll: true }); });
  $('hint').addEventListener('click', () => {
    if (awarded) return;
    const solution = E.solve(state);
    if (solution?.length) { const step = solution[0]; say('hintMove', { equation: equation(step) }); }
    else say('noSolution');
    render();
  });
  $('language').addEventListener('change', event => { language = event.target.value; save('67-language', language); render(); });
  render();
})();
