(function () {
  'use strict';
  const M = window.ScaleMath;
  const keys = ['decimal', 'compare', 'units', 'science'];
  const unitKeys = Object.keys(M.units);
  let savedLanguage;
  try { savedLanguage = localStorage.getItem('scale-lab-language'); } catch (_) { /* Storage is optional, including file://. */ }
  const state = {
    lang: Object.hasOwn(ScaleMessages, savedLanguage) ? savedLanguage : 'en',
    tab: 'compare', mode: 'explore', zoom: 0,
    decimal: { value: '0.6' }, compare: { a: '0.6', b: '0.38' },
    units: { value: '0.6', from: 'm', to: 'cm' }, science: { coefficient: '4.2', exponent: -3 },
    practice: Object.fromEntries(keys.map(key => [key, { index: 0, solved: 0, done: false, hint: false, feedback: '', drafts: {} }])),
    drafts: Object.fromEntries(keys.map(key => [key, {}])),
  };
  const $ = selector => document.querySelector(selector);
  const esc = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const t = (key, args = {}) => String(ScaleMessages[state.lang][key]).replace(/\{(\w+)\}/g, (_, name) => args[name] ?? '');
  const list = key => ScaleMessages[state.lang][key];
  const f = value => String(value).replace('.', ['fr', 'pt-BR'].includes(state.lang) ? ',' : '.');
  const clean = value => String(value).trim().replace(',', '.');
  function displayInput(value, maxPlaces = 3) {
    const d = M.parse(value);
    const [whole, fraction = ''] = M.format(d.n, d.scale).split('.');
    const places = Math.min(d.scale, maxPlaces);
    return whole + (places ? '.' + fraction.padEnd(places, '0') : '');
  }
  const current = () => state.practice[state.tab];
  const question = () => M.banks[state.tab][current().index % M.banks[state.tab].length];
  const drafts = () => state.mode === 'practice' ? current().drafts : state.drafts[state.tab];
  function input(name, label, value = '', options = '') {
    const actual = drafts()[name] ?? f(value);
    return `<label class="field">${esc(label)}<input name="${name}" id="input-${name}" type="text" inputmode="${name.toLowerCase().includes('exponent') ? 'text' : 'decimal'}" autocomplete="off" maxlength="40" value="${esc(actual)}" ${options}></label>`;
  }
  function unitSelect(name, label, selected) {
    return `<label class="field">${esc(label)}<select name="${name}">${unitKeys.map((u, i) => `<option value="${u}" ${u === selected ? 'selected' : ''}>${u} · ${esc(list('unitNames')[i])}</option>`).join('')}</select></label>`;
  }
  const button = (label, cls = 'primary', extra = '') => `<button class="${cls}" ${extra}>${esc(label)}</button>`;
  function sidebar() {
    const i = keys.indexOf(state.tab);
    return `<aside class="sidebar"><section class="note"><p class="eyebrow">${t('idea')}</p><h3>${esc(list('tabs')[i])}</h3><p>${esc(list('insights')[i])}</p><div id="detail"></div></section><section class="note"><p class="eyebrow">${t('tryThis')}</p><p>${t(state.mode === 'explore' ? 'exploreTip' : 'practiceTip')}</p><p class="small-note">${t('answerHelp')}</p></section></aside>`;
  }
  function render() {
    document.documentElement.lang = state.lang;
    document.title = `Scale Lab · ${list('tabs')[keys.indexOf(state.tab)]} · MathPlayground`;
    document.querySelectorAll('[data-t]').forEach(el => {
      const text = t(el.dataset.t);
      el.replaceChildren(...text.split('\n').flatMap((line, i) => i ? [document.createElement('br'), document.createTextNode(line)] : [document.createTextNode(line)]));
    });
    $('#language').value = state.lang;
    $('#identity-equation').textContent = `${f('0.6')} m = 60 cm = 600 mm = 6 × 10⁻¹ m`;
    $('#tabs').setAttribute('aria-label', t('experiments'));
    $('#tabs').innerHTML = keys.map((key, i) => `<button role="tab" id="tab-${key}" aria-controls="panel" aria-selected="${key === state.tab}" tabindex="${key === state.tab ? '0' : '-1'}" data-tab="${key}"><span class="tab-number">0${i + 1}</span>${esc(list('tabs')[i])}</button>`).join('');
    $('#panel').setAttribute('aria-labelledby', `tab-${state.tab}`);
    $('#chapter').textContent = t('chapter', { n: `0${keys.indexOf(state.tab) + 1}` });
    $('#section-title').textContent = list('titles')[keys.indexOf(state.tab)];
    $('#section-intro').textContent = list('intros')[keys.indexOf(state.tab)];
    $('#modes').setAttribute('aria-label', t('mode'));
    $('#modes').innerHTML = ['explore', 'practice'].map(mode => `<button data-mode="${mode}" aria-pressed="${state.mode === mode}">${t(mode)}</button>`).join('');
    $('#workspace').innerHTML = `<div class="workspace"><div class="board">${state.mode === 'explore' ? exploreMarkup() : practiceMarkup()}</div>${sidebar()}</div>`;
    if (state.mode === 'explore') renderVisual(); else renderPracticeFeedback();
  }
  function exploreMarkup() {
    let controls;
    if (state.tab === 'decimal') {
      controls = `<form data-form="decimal"><div class="control-row">${input('value', t('value'), state.decimal.value)}${button(t('update'))}</div><label class="field"><span class="small-note">${t('value')} · 0 ↔ 1</span><input id="decimal-slider" type="range" min="0" max="1000" step="1" value="${Number(state.decimal.value) * 1000}" aria-label="${t('value')}" aria-valuetext="${f(state.decimal.value)}"></label></form>`;
    } else if (state.tab === 'compare') {
      controls = `<form data-form="compare"><div class="control-row">${input('a', t('first'), state.compare.a)}${input('b', t('second'), state.compare.b)}${button(t('update'))}</div></form>`;
    } else if (state.tab === 'units') {
      controls = `<form data-form="units"><div class="control-row">${input('value', t('amount'), state.units.value)}${unitSelect('from', t('from'), state.units.from)}</div><div class="control-row" style="margin-top:12px">${unitSelect('to', t('to'), state.units.to)}${button(t('convert'))}</div></form>`;
    } else {
      const s = state.science;
      controls = `<form data-form="science"><div class="control-row">${input('coefficient', t('coefficient'), s.coefficient)}${input('exponent', t('exponent'), s.exponent)}${button(t('update'))}</div><p class="small-note">${t('normalized')} · −6 ≤ n ≤ 6</p></form><form data-form="scienceDecimal" style="margin-top:18px"><div class="control-row">${input('decimal', t('decimal'), M.shift(s.coefficient, s.exponent))}${button(t('rewrite'), 'secondary')}</div></form><p class="small-note">${t('scienceRange')}</p>`;
    }
    return `<div class="controls">${controls}<p id="error" class="error" role="alert"></p></div><div id="visual"></div>`;
  }
  function grid(value, label, orange = false) {
    const count = Number(M.shift(value, 2));
    return `<div class="grid-wrap ${orange ? 'orange' : ''}"><p class="grid-label">${esc(label)}</p><div class="hundred-grid" role="img" aria-label="${esc(t('gridFill', { n: f(M.shift(value, 2)) }))}">${Array.from({ length: 100 }, (_, i) => `<span class="cell"><i style="width:${Math.max(0, Math.min(1, count - i)) * 100}%"></i></span>`).join('')}</div><p class="grid-caption">${t('gridUnit', { value: f('0.01') })}</p></div>`;
  }
  function line(start, end, markers = [], unit = '') {
    const precision = Math.max(0, Math.min(14, 2 - Math.floor(Math.log10(end - start))));
    const label = n => f(n.toFixed(precision).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, ''));
    const pos = value => 24 + Math.max(0, Math.min(1, (value - start) / (end - start))) * 552;
    const aria = `${label(start)} ${unit} ↔ ${label(end)} ${unit}${markers.map(m => `; ${m.name}: ${f(m.value)} ${unit}`).join('')}`;
    const labelStep = Math.max(label(start).length, label(end).length) > 6 ? 5 : 2;
    return `<svg class="number-line" viewBox="0 0 600 115" role="img" aria-label="${esc(aria)}"><line class="axis" x1="24" y1="52" x2="576" y2="52"/>${Array.from({ length: 11 }, (_, i) => { const x = 24 + i * 55.2; return `<line class="tick" x1="${x}" x2="${x}" y1="46" y2="59"/>${i % labelStep === 0 ? `<text text-anchor="${i === 0 ? 'start' : i === 10 ? 'end' : 'middle'}" x="${x}" y="79">${label(start + (end - start) * i / 10)}</text>` : ''}`; }).join('')}${markers.map((m, i) => `<line x1="${pos(Number(m.value))}" x2="${pos(Number(m.value))}" y1="${i ? 94 : 24}" y2="52" stroke="${i ? '#b95836' : '#276b59'}" stroke-dasharray="3 3"/><circle cx="${pos(Number(m.value))}" cy="52" r="5" fill="${i ? '#b95836' : '#276b59'}"/><text class="marker-text ${i ? 'marker-b' : ''}" text-anchor="${pos(Number(m.value)) < 80 ? 'start' : pos(Number(m.value)) > 520 ? 'end' : 'middle'}" x="${pos(Number(m.value))}" y="${i ? 110 : 17}">${esc(m.name)} ${f(m.value)}</text>`).join('')}</svg>`;
  }
  function decimalVisual(s) {
    const thousand = Math.round(Number(s.value) * 1000);
    const digits = String(thousand).padStart(4, '0').split('');
    const span = [1000, 100, 10][state.zoom];
    const start = Math.min(1000 - span, Math.floor(thousand / span) * span);
    return `<div class="board-heading"><h3>${t('placeValue')}</h3><span class="badge">${t('whole')} = 1</span></div><div class="decimal-visual">${grid(s.value, f(s.value))}<div class="places">${digits.map((d, i) => `<div class="place"><span>${esc(list('places')[i])}</span><strong>${d}</strong></div>`).join('')}<p class="decomposition">${digits[0]} + ${digits[1]} × ${f('0.1')} + ${digits[2]} × ${f('0.01')} + ${digits[3]} × ${f('0.001')}</p></div></div><div class="line-box"><div class="line-heading"><span>${t('zoom')}</span><div class="zoom">${[0, 1, 2].map(z => `<button data-zoom="${z}" aria-pressed="${state.zoom === z}">${esc(list('places')[z])}</button>`).join('')}</div></div>${line(start / 1000, (start + span) / 1000, [{ name: '', value: s.value }])}</div>`;
  }
  function compareVisual(s) {
    const relation = ['<', '=', '>'][M.compare(s.a, s.b) + 1];
    const max = Math.max(Number(s.a), Number(s.b));
    const end = max <= 1 ? 1 : Math.ceil(max / 10 ** Math.floor(Math.log10(max))) * 10 ** Math.floor(Math.log10(max));
    const pictures = max <= 1 ? `<div class="grid-pair">${grid(s.a, `A · ${f(s.a)}`)}${grid(s.b, `B · ${f(s.b)}`, true)}</div>` : `<div class="bars">${[s.a, s.b].map((v, i) => `<div><p class="grid-label">${i ? 'B' : 'A'} · ${f(v)}</p><div class="value-bar ${i ? 'orange' : ''}" style="width:${Number(v) / end * 100}%"></div></div>`).join('')}</div>`;
    return `<div class="board-heading"><h3>${t('sameScale')}</h3></div><div class="equation">${f(s.a)} <span class="accent">${esc(relation)}</span> ${f(s.b)}</div>${pictures}<div class="line-box">${line(0, end, [{ name: 'A', value: s.a }, { name: 'B', value: s.b }])}</div>`;
  }
  function unitsVisual(s) {
    const metres = M.convert(s.value, s.from, 'm');
    const n = Number(metres);
    // The scale depends only on the physical length, never on the output unit.
    const span = 10 ** Math.ceil(Math.log10(n));
    const result = M.convert(s.value, s.from, s.to);
    return `<div class="board-heading"><h3>${t('fixedRibbon', { value: f(metres) })}</h3></div><div class="equation">${f(s.value)} ${s.from} <span class="accent">= ${f(result)} ${s.to}</span></div><div class="ribbon-stage"><div class="ribbon" role="img" aria-label="${esc(t('fixedRibbon', { value: f(metres) }))}" style="width:${n / span * 100}%"></div><span class="ribbon-label">${f(result)} ${s.to}</span>${line(0, Number(M.convert(String(span), 'm', s.to)), [], s.to)}<p class="quiet">${t('rulerSpan', { value: f(M.convert(String(span), 'm', s.to)), unit: s.to })}</p></div><div class="unit-ladder" aria-label="${t('experiments')}">${unitKeys.map(u => `<span class="${u === s.from ? 'from' : ''} ${u === s.to ? 'to' : ''}">${u}</span>`).join('')}</div><p class="quiet">← ÷10 <span style="float:right">×10 →</span></p>`;
  }
  function scienceVisual(s) {
    const value = M.shift(s.coefficient, s.exponent);
    return `<div class="board-heading"><h3>${t('power')}</h3><span class="badge">${t('normalized')}</span></div><div class="power-readout"><div class="equation">${f(s.coefficient)} × 10<sup>${s.exponent < 0 ? '−' + -s.exponent : s.exponent}</sup></div><p>= ${f(value)}</p></div><p class="quiet">${t('powerExplain', { coefficient: f(s.coefficient), factor: f(M.shift('1', s.exponent)), value: f(value) })}</p><div class="power-rail" role="img" aria-label="${t('exponent')}: ${s.exponent}">${Array.from({ length: 13 }, (_, i) => `<span class="${i - 6 === s.exponent ? 'active' : ''}">10<sup>${i - 6}</sup></span>`).join('')}</div><div class="line-box">${line(Number(M.shift('1', s.exponent)), Number(M.shift('1', s.exponent + 1)), [{ name: '', value }])}</div>`;
  }
  function renderVisual() {
    let s = state[state.tab];
    if (state.mode === 'practice') {
      s = question();
      if (!current().hint && !current().done) { $('#detail').innerHTML = ''; return; }
    }
    const visual = $('#visual');
    if (!visual) return;
    visual.innerHTML = ({ decimal: decimalVisual, compare: compareVisual, units: unitsVisual, science: scienceVisual }[state.tab])(s);
    let detail = '';
    if (state.tab === 'decimal') {
      detail = `<p class="equation">${f(s.value)} = ${f(Number(s.value).toFixed(3))}</p>`;
      if (state.mode === 'practice') detail += `<p>${f(s.value)} = ${s.answer} / ${10 ** s.places}</p>`;
    } else if (state.tab === 'compare') {
      const places = Math.max((s.a.split('.')[1] || '').length, (s.b.split('.')[1] || '').length);
      const pair = [s.a, s.b].map(value => Number(value).toFixed(places));
      const width = Math.max(...pair.map(value => value.length));
      detail = `<p>${t('aligned')}</p><div class="aligned">${pair.map((value, i) => `<div style="white-space:pre">${i ? 'B' : 'A'} ${f(value.padStart(width, ' '))}</div>`).join('')}</div><p>${t(M.compare(s.a, s.b) === 0 ? 'equal' : 'compareResult')}</p><p class="difference">${t('difference', { value: f(M.difference(s.a, s.b)) })}</p>`;
    } else if (state.tab === 'units') {
      detail = `<p class="difference">${t('conversion', { from: s.from, to: s.to, factor: f(M.convert('1', s.from, s.to)) })}</p>`;
    } else {
      detail = `<p class="equation">10<sup>${s.exponent}</sup> = ${f(M.shift('1', s.exponent))}</p>`;
    }
    $('#detail').innerHTML = detail;
  }
  function practiceMarkup() {
    const p = current(), q = question();
    let prompt, answer;
    if (state.tab === 'decimal') prompt = `${f(q.value)} = <span class="accent">?</span> / ${10 ** q.places}`;
    if (state.tab === 'compare') prompt = `${f(q.a)} <span class="accent">?</span> ${f(q.b)}`;
    if (state.tab === 'units') prompt = `${f(q.value)} ${q.from} = <span class="accent">?</span> ${q.to}`;
    if (state.tab === 'science') prompt = `${f(q.value)} = <span class="accent">a × 10<sup>n</sup></span>`;
    if (state.tab === 'compare') {
      answer = `<div class="comparison-buttons" role="group" aria-label="${t('answer')}">${['<', '=', '>'].map((symbol, i) => `<button data-answer="${esc(symbol)}" aria-label="${t(['less', 'same', 'greater'][i])}" ${p.done ? 'disabled' : ''}>${esc(symbol)}</button>`).join('')}</div>`;
    } else {
      answer = `<form data-form="answer" class="answer-form"><div class="control-row">${state.tab === 'science' ? input('answerCoefficient', t('coefficient')) + input('answerExponent', t('exponent')) : input('answer', t('answer'))}${button(t('check'), 'primary', p.done ? 'disabled' : '')}</div></form>`;
    }
    return `<div class="practice-heading"><span class="eyebrow" style="margin:0">${t('round', { n: p.index + 1 })}</span><span class="badge" id="score">${t('solved', { n: p.solved })}</span></div><h3>${esc(list('questionLabels')[keys.indexOf(state.tab)])}</h3><div class="question" id="question" tabindex="-1">${prompt}</div>${answer}<div id="feedback" class="feedback" role="status" aria-live="polite"></div><div class="actions">${button(t('hint'), 'secondary', 'data-action="hint"')}${button(t('next'), 'secondary', 'data-action="next"')}</div><div id="hint-placeholder" class="hint-placeholder">${t('hintHidden')}</div><div id="practice-visual" class="practice-visual" hidden><p class="quiet">${esc(list('hints')[keys.indexOf(state.tab)])}</p><div id="visual"></div></div>`;
  }
  function renderPracticeFeedback() {
    const p = current();
    $('#feedback').textContent = p.feedback ? t(p.feedback) : '';
    $('#feedback').classList.toggle('good', p.done);
    $('#score').textContent = t('solved', { n: p.solved });
    $('#practice-visual').hidden = !p.hint && !p.done;
    $('#hint-placeholder').hidden = p.hint || p.done;
    document.querySelectorAll('[data-answer], [data-form="answer"] button').forEach(el => { el.disabled = p.done; });
    renderVisual();
  }
  function checkAnswer(data) {
    const p = current(), q = question();
    if (p.done) return;
    let correct = false;
    if (state.tab === 'science') {
      const c = clean(data.get('answerCoefficient')), e = clean(data.get('answerExponent'));
      if (!M.parse(c) || !/^[+-]?\d+$/.test(e) || Math.abs(Number(e)) > 20) { p.feedback = 'invalid'; renderPracticeFeedback(); return; }
      const sameValue = M.compare(M.shift(c, Number(e)), q.value) === 0;
      correct = sameValue && M.compare(c, '1') >= 0 && M.compare(c, '10') < 0;
      if (sameValue && !correct) { p.feedback = 'notNormalized'; renderPracticeFeedback(); return; }
    } else if (state.tab === 'compare') correct = data === q.answer;
    else {
      const answer = clean(data.get('answer'));
      if (!M.parse(answer)) { p.feedback = 'invalid'; renderPracticeFeedback(); return; }
      correct = M.compare(answer, q.answer) === 0;
    }
    p.feedback = correct ? 'correct' : 'incorrect';
    p.hint = true;
    if (correct) { p.done = true; p.solved++; }
    renderPracticeFeedback();
  }
  document.addEventListener('submit', event => {
    const form = event.target.closest('[data-form]');
    if (!form) return;
    event.preventDefault();
    const data = new FormData(form), kind = form.dataset.form;
    if (kind === 'answer') { checkAnswer(data); return; }
    let error = '';
    if (kind === 'decimal') {
      const value = clean(data.get('value'));
      if (!M.valid(value, '0', '1')) error = 'invalidDecimal'; else state.decimal.value = displayInput(value);
    } else if (kind === 'compare') {
      const a = clean(data.get('a')), b = clean(data.get('b'));
      if (!M.valid(a, '0', '1000') || !M.valid(b, '0', '1000')) error = 'invalidCompare'; else state.compare = { a: displayInput(a), b: displayInput(b) };
    } else if (kind === 'units') {
      const value = clean(data.get('value'));
      if (!M.valid(value, '0.001', '10000')) error = 'invalidUnits'; else state.units = { value: displayInput(value), from: data.get('from'), to: data.get('to') };
    } else if (kind === 'science') {
      const coefficient = clean(data.get('coefficient')), e = clean(data.get('exponent'));
      if (!M.valid(coefficient, '1', '9.99', 2) || !/^[+-]?\d+$/.test(e) || Math.abs(Number(e)) > 6) error = 'invalidScience'; else state.science = { coefficient: displayInput(coefficient, 2), exponent: Number(e) };
    } else if (kind === 'scienceDecimal') {
      const value = clean(data.get('decimal')), s = M.scientific(value);
      if (!M.valid(value, '0.000001', '9990000', 8) || !s || !M.valid(s.coefficient, '1', '9.99', 2)) error = 'invalidScienceDecimal'; else state.science = s;
    }
    if (error) { $('#error').textContent = t(error); return; }
    state.drafts[state.tab] = {};
    render();
    const selector = kind === 'scienceDecimal' ? '#input-decimal' : kind === 'science' ? '#input-coefficient' : kind === 'compare' ? '#input-a' : '#input-value';
    $(selector)?.focus();
  });
  document.addEventListener('input', event => {
    if (event.target.id === 'decimal-slider') {
      state.decimal.value = M.shift(event.target.value, -3);
      state.drafts.decimal = {};
      $('#input-value').value = f(state.decimal.value);
      $('#error').textContent = '';
      event.target.setAttribute('aria-valuetext', f(state.decimal.value));
      renderVisual();
    } else if (event.target.name && event.target.closest('form')) drafts()[event.target.name] = event.target.value;
  });
  document.addEventListener('change', event => {
    if (event.target.id === 'language') {
      state.lang = event.target.value;
      try { localStorage.setItem('scale-lab-language', state.lang); } catch (_) { /* Optional. */ }
      render();
    } else if (event.target.tagName === 'SELECT' && state.tab === 'units') {
      // A unit change is immediate, including when an edited measurement awaits submission.
      event.target.closest('form').requestSubmit();
    }
  });
  document.addEventListener('click', event => {
    const el = event.target.closest('button');
    if (!el) return;
    if (el.dataset.tab) { state.tab = el.dataset.tab; render(); $(`#tab-${state.tab}`).focus(); }
    else if (el.dataset.mode) { state.mode = el.dataset.mode; render(); $(`[data-mode="${state.mode}"]`).focus(); }
    else if (el.dataset.zoom !== undefined) { state.zoom = Number(el.dataset.zoom); renderVisual(); $(`[data-zoom="${state.zoom}"]`).focus(); }
    else if (el.dataset.answer) checkAnswer(el.dataset.answer);
    else if (el.dataset.action === 'hint') { current().hint = true; renderPracticeFeedback(); }
    else if (el.dataset.action === 'next') {
      Object.assign(current(), { index: current().index + 1, done: false, hint: false, feedback: '', drafts: {} });
      render(); $('#question').focus();
    }
  });
  $('#tabs').addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = keys.indexOf(state.tab);
    state.tab = keys[event.key === 'Home' ? 0 : event.key === 'End' ? 3 : (index + (event.key === 'ArrowRight' ? 1 : 3)) % 4];
    render(); $(`#tab-${state.tab}`).focus();
  });
  render();
})();
