(() => {
  'use strict';
  const E = window.SixtySeven, messages = window.SixtySevenMessages;
  const $ = id => document.getElementById(id);
  const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const save = (key, value) => { try { localStorage.setItem(key, String(value)); } catch { /* Gameplay works without storage. */ } };
  let language = read('67-language');
  if (!messages[language]) language = 'pt-BR';
  let wins = Math.max(0, Math.min(99999, Number.parseInt(read('67-wins'), 10) || 0));
  let round = 1, initial = [8, 5, 4, 8, 2], state = E.createState(initial), history = [];
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
    else bId = id;
    say('selected'); render();
    document.querySelector(`[data-tile-id="${id}"]`)?.focus({ preventScroll: true });
  }
  function render() {
    document.documentElement.lang = language;
    document.querySelector('meta[name="description"]').content = t('description');
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    $('language').value = language;
    $('round-label').textContent = t('round', { n: round });
    $('pieces-left').textContent = t('piecesLeft', { n: state.tiles.length });
    $('operations').setAttribute('aria-label', t('operations'));
    $('numbers').replaceChildren(...state.tiles.map(piece => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'number-tile';
      if (piece.id >= 5) button.classList.add('result');
      const value = E.format(piece.value);
      if (value.length > 3) button.classList.add('fraction');
      button.textContent = value; button.dataset.tileId = piece.id;
      button.setAttribute('aria-label', piece.id >= 5 ? t('resultTile', { n: value, expression: piece.expression }) : t('selectTile', { n: value }));
      const selected = piece.id === aId || piece.id === bId;
      button.setAttribute('aria-pressed', String(selected));
      button.disabled = awarded || !state.ops.length;
      if (selected) { const order = document.createElement('span'); order.className = 'order'; order.textContent = piece.id === aId ? '1' : '2'; order.setAttribute('aria-hidden', 'true'); button.append(order); }
      button.addEventListener('click', () => pick(piece.id));
      return button;
    }));
    $('operations').replaceChildren(...E.OPS.map(operation => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'operation';
      button.textContent = E.symbols[operation]; button.dataset.operation = operation;
      button.disabled = !state.ops.includes(operation) || awarded;
      button.setAttribute('aria-pressed', String(op === operation));
      button.setAttribute('aria-label', t(opKeys[operation]) + (button.disabled ? ` (${t('used')})` : ''));
      button.addEventListener('click', () => { op = op === operation ? null : operation; say('selected'); render(); document.querySelector(`[data-operation="${operation}"]`).focus({ preventScroll: true }); });
      return button;
    }));
    [['slot-a', aId, 'first'], ['slot-b', bId, 'second']].forEach(([id, selected, label]) => {
      const value = selected === null ? '?' : E.format(tile(selected).value);
      $(id).textContent = value; $(id).disabled = selected === null;
      $(id).setAttribute('aria-label', selected === null ? t(label) : t('clearSlot', { slot: t(label), n: value }));
    });
    $('slot-op').textContent = op ? E.symbols[op] : '?';
    $('slot-op').classList.toggle('active', !!op);
    let result = '?';
    const ready = aId !== null && bId !== null && op !== null;
    if (ready) { try { result = E.format(E.calculate(tile(aId).value, op, tile(bId).value)); } catch { result = '—'; } }
    $('preview').textContent = result;
    $('combine').disabled = !ready || awarded;
    $('undo').disabled = !history.length || awarded;
    $('restart').disabled = (!history.length && aId === null && bId === null && op === null) || awarded;
    $('hint').disabled = awarded;
    $('status').textContent = t(notice.key, notice.vars);
    $('status').className = 'status' + (awarded ? ' success' : ['hintMove', 'noSolution'].includes(notice.key) ? ' hint' : '');
    $('history-count').textContent = `${state.steps.length}/4`;
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
    $('next').querySelector('span').textContent = t(awarded ? 'nextRound' : 'newRound');
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
  $('combine').addEventListener('click', () => {
    if (aId === null || bId === null || !op || awarded) return;
    let next;
    try { next = E.combine(state, aId, op, bId); } catch (error) { say(error.message === 'zero' ? 'zero' : 'range'); render(); return; }
    history.push(state); state = next; clearSelection();
    if (E.won(state)) { awarded = true; wins++; save('67-wins', wins); say('win'); celebrate(); }
    else if (!state.ops.length) say('miss', { n: E.format(state.tiles[0].value) });
    else if (state.tiles.some(piece => piece.value.n === 67 * piece.value.d)) say('early');
    else say('afterMove');
    render();
    (awarded ? $('next') : state.ops.length ? $('numbers').querySelector('button') : $('undo')).focus({ preventScroll: true });
  });
  $('slot-a').addEventListener('click', () => { aId = null; render(); $('numbers').querySelector('button:not(:disabled)')?.focus({ preventScroll: true }); });
  $('slot-b').addEventListener('click', () => { bId = null; render(); $('numbers').querySelector('button:not(:disabled)')?.focus({ preventScroll: true }); });
  $('undo').addEventListener('click', () => { if (history.length && !awarded) { state = history.pop(); clearSelection(); say('ready'); render(); $('numbers').querySelector('button').focus({ preventScroll: true }); } });
  $('restart').addEventListener('click', () => { if (awarded) return; state = E.createState(initial); history = []; clearSelection(); say('ready'); render(); $('numbers').querySelector('button').focus({ preventScroll: true }); });
  $('next').addEventListener('click', () => { initial = E.generate(Math.random, initial); state = E.createState(initial); history = []; awarded = false; round++; clearSelection(); say('ready'); render(); $('numbers').querySelector('button').focus({ preventScroll: true }); });
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
