(function () {
  'use strict';
  const M = window.StarMath;
  const $ = id => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';
  const presets = [
    { n: 7, k: 5, name: 'Heptagram', color: '#efaa91' },
    { n: 9, k: 4, name: 'Enneagram', color: '#e6c85b' },
    { n: 20, k: 13, name: 'Icosagram', color: '#8bc6b7' },
    { n: 25, k: 12, name: 'Icosipentagram', color: '#e9e5d6' },
    { n: 29, k: 17, name: 'Icosienneagram', color: '#ed8865' }
  ];
  let phase = 0;
  let revealed = 0;
  let playing = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lastTime = null;
  let custom = null;
  const rows = [];

  function svgElement(tag, attrs, parent) {
    const el = document.createElementNS(NS, tag);
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
    if (parent) parent.append(el);
    return el;
  }
  function path(points) { return points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(3)},${p.y.toFixed(3)}`).join(' '); }
  function createRow(config, host) {
    const row = document.createElement('article');
    row.className = 'polygon-row';
    row.style.setProperty('--row-color', config.color);
    const heading = document.createElement('div');
    heading.className = 'row-label';
    const title = document.createElement('h3'); title.textContent = config.name;
    const notation = document.createElement('span'); notation.className = 'notation'; notation.textContent = `{${config.n}/${config.k}}`;
    const ratio = document.createElement('span'); ratio.className = 'ratio'; ratio.textContent = `k/n = ${(config.k / config.n).toFixed(3)}`;
    heading.append(title, notation, ratio); row.append(heading);
    const svg = svgElement('svg', { class: 'plot', role: 'img', 'aria-label': `${config.name} {${config.n}/${config.k}}: a point traverses the edges; the graph to the right shows its height over the previous two circuits.` });
    row.append(svg); host.append(row);
    const obj = { ...config, row, svg };
    buildGeometry(obj);
    return obj;
  }
  function buildGeometry(o) {
    const width = Math.max(280, o.row.clientWidth);
    const mobile = width < 700;
    o.width = width;
    o.cy = 85; o.cx = width * (mobile ? .125 : .115);
    o.r = Math.min(49, width * .105);
    o.start = width * (mobile ? .28 : .25);
    o.end = width - 8;
    o.svg.setAttribute('viewBox', `0 0 ${width} 142`);
    o.svg.replaceChildren();
    const screen = p => ({ x: o.cx + o.r * p.x, y: o.cy - o.r * p.y });
    svgElement('line', { x1: o.cx - o.r - 5, x2: o.end, y1: o.cy, y2: o.cy, stroke: '#39423b', 'stroke-width': 1 }, o.svg);
    for (let i = 0; i <= 2; i++) {
      const x = o.start + (o.end - o.start) * i / 2;
      svgElement('line', { x1: x, x2: x, y1: o.cy - o.r - 4, y2: o.cy + o.r + 4, stroke: '#29312c', 'stroke-width': 1, 'stroke-dasharray': '2 5' }, o.svg);
    }
    o.guide = svgElement('circle', { cx: o.cx, cy: o.cy, r: o.r, fill: 'none', stroke: '#6d7a70', 'stroke-dasharray': '2 4' }, o.svg);
    const count = M.period(o.n, o.k);
    const vertices = Array.from({ length: count + 1 }, (_, j) => screen(M.vertex(o.n, o.k, j)));
    // Equal-length edges make normalized path length match circuit progress.
    // Only reveal the component visited by this dot; other paths stay invisible.
    o.polygon = svgElement('path', { class: 'polygon-trail', d: path(vertices), fill: 'none', stroke: o.color, 'stroke-width': 1.5, 'stroke-opacity': .88, 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': '1 1' }, o.svg);
    o.envelope = svgElement('path', { fill: 'none', stroke: '#c4dea1', 'stroke-width': 1, 'stroke-opacity': .5, 'stroke-dasharray': '3 5' }, o.svg);
    o.wave = svgElement('path', { fill: 'none', stroke: o.color, 'stroke-width': 1.65, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, o.svg);
    o.samples = svgElement('g', { fill: o.color }, o.svg);
    o.connector = svgElement('line', { stroke: o.color, 'stroke-width': 1, 'stroke-dasharray': '3 4', 'stroke-opacity': .65 }, o.svg);
    o.halo = svgElement('circle', { r: 8, fill: o.color, 'fill-opacity': .13 }, o.svg);
    o.dot = svgElement('circle', { r: 3.5, fill: '#fffaf0' }, o.svg);
    o.graphDot = svgElement('circle', { r: 2.7, fill: o.color, cx: o.start }, o.svg);
    renderRow(o);
  }
  function renderRow(o) {
    o.polygon.setAttribute('stroke-dashoffset', 1 - revealed);
    o.polygon.style.visibility = revealed === 0 ? 'hidden' : 'visible';
    const period = M.period(o.n, o.k), edge = phase * period, span = period * 2;
    const p = M.position(o.n, o.k, edge);
    const x = o.cx + p.x * o.r, y = o.cy - p.y * o.r;
    for (const el of [o.dot, o.halo]) { el.setAttribute('cx', x); el.setAttribute('cy', y); }
    for (const [key, value] of Object.entries({ x1: x, x2: o.start, y1: y, y2: y })) o.connector.setAttribute(key, value);
    o.graphDot.setAttribute('cy', y);
    const points = M.trace(o.n, o.k, edge, span).map(v => ({ x: o.start + v.age / span * (o.end - o.start), y: o.cy - v.y * o.r }));
    o.wave.setAttribute('d', path(points));
    o.guide.style.display = $('circles').checked ? '' : 'none';
    o.samples.replaceChildren();
    if ($('samples').checked) {
      for (let j = 0; j < o.n; j++) {
        const v = M.vertex(o.n, 1, j);
        svgElement('circle', { cx: o.cx + v.x * o.r, cy: o.cy - v.y * o.r, r: 2 }, o.samples);
      }
      for (const point of points.slice(1, -1)) svgElement('circle', { cx: point.x, cy: point.y, r: 2 }, o.samples);
    }
    const showEnvelope = $('envelope').checked && o.n === 25 && o.k === 12;
    o.envelope.style.display = showEnvelope ? '' : 'none';
    if (showEnvelope) {
      const curves = [1, -1].map(sign => path(Array.from({ length: 301 }, (_, i) => {
        const age = i / 300 * span;
        return { x: o.start + i / 300 * (o.end - o.start), y: o.cy - sign * Math.abs(Math.sin(Math.PI * (edge - age) / 25)) * o.r };
      })));
      o.envelope.setAttribute('d', curves.join(' '));
    }
  }
  function render() {
    rows.forEach(renderRow);
    if (custom && $('custom-panel').open) renderRow(custom);
    $('phase').value = Math.round(phase * 1000);
    $('phase-value').value = `${Math.round(phase * 100)}%`;
  }
  function updatePlayback() {
    $('play').innerHTML = playing ? 'Ⅱ <span>Pause</span>' : '▶ <span>Play</span>';
    $('play').setAttribute('aria-label', playing ? 'Pause animation' : 'Play animation');
    $('status').textContent = playing ? 'In motion' : 'Paused';
    $('status-dot').classList.toggle('paused', !playing);
    lastTime = null;
  }
  function applyCustom() {
    const n = Number($('custom-n').value), k = Number($('custom-k').value);
    try { M.validate(n, k); } catch (error) { $('custom-info').textContent = error.message; return; }
    $('custom-chart').replaceChildren();
    custom = createRow({ n, k, name: 'Your polygon', color: '#b9c9f1' }, $('custom-chart'));
    const components = M.gcd(n, k);
    $('custom-info').textContent = components === 1
      ? `All ${n} vertices belong to one path. The dot closes its circuit after ${n} edges.`
      : `gcd(${n}, ${k}) = ${components}: this figure has ${components} separate paths. The dot traces one path of ${n / components} vertices; unvisited paths stay invisible.`;
    if (2 * k === n) $('custom-info').textContent += ' This is a degenerate case: each path goes back and forth along a diameter.';
    render();
  }
  presets.forEach(p => rows.push(createRow(p, $('examples'))));
  $('play').addEventListener('click', () => { playing = !playing; updatePlayback(); });
  $('restart').addEventListener('click', () => { phase = 0; revealed = 0; lastTime = null; render(); });
  $('phase').addEventListener('input', () => { phase = Number($('phase').value) / 1000; revealed = phase; playing = false; updatePlayback(); render(); });
  $('speed').addEventListener('change', () => { lastTime = null; });
  for (const id of ['circles', 'samples', 'envelope']) $(id).addEventListener('change', render);
  $('custom-n').addEventListener('input', () => { $('custom-k').max = Math.max(1, Number($('custom-n').value) - 1); });
  $('apply').addEventListener('click', applyCustom);
  for (const id of ['custom-n', 'custom-k']) $(id).addEventListener('keydown', e => { if (e.key === 'Enter') applyCustom(); });
  $('custom-panel').addEventListener('toggle', () => {
    if ($('custom-panel').open) { if (!custom) applyCustom(); else buildGeometry(custom); }
  });
  new ResizeObserver(() => { rows.forEach(buildGeometry); if (custom && $('custom-panel').open) buildGeometry(custom); }).observe($('examples'));
  document.addEventListener('visibilitychange', () => { lastTime = null; });
  function tick(now) {
    if (playing && !document.hidden) {
      if (lastTime !== null) {
        const advance = (now - lastTime) / 12000 * Number($('speed').value);
        phase = (phase + advance) % 1;
        revealed = Math.min(1, revealed + advance);
      }
      render();
    }
    lastTime = now;
    requestAnimationFrame(tick);
  }
  updatePlayback(); render(); requestAnimationFrame(tick);
})();
