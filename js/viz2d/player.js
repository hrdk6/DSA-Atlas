/* Step player shared by every 2D widget: first / prev / play / next / last,
   a scrubber, and a speed menu. Widgets hand it an array of steps and a
   render(step, index) function. Arrow keys step when the figure has focus. */
(function () {
  'use strict';
  const DSA = window.DSA;
  const h = DSA.h;
  DSA.player = function (fig, opts) {
    let steps = [], i = 0, timer = null, speed = 1;
    const btn = (icon, label, fn, cls) => h('button', { class: 'pl-btn ' + (cls || ''), type: 'button', title: label, 'aria-label': label, html: DSA.icon(icon), onclick: fn });
    const range = h('input', { class: 'pl-range', type: 'range', min: '0', max: '0', value: '0', 'aria-label': 'Step' });
    const count = h('span', { class: 'pl-count' }, '0 / 0');
    const playBtn = btn('play', 'Play', () => (timer ? stop() : play()), 'play');
    const spd = h('select', { 'aria-label': 'Playback speed' }, [['0.5', '0.5×'], ['1', '1×'], ['2', '2×'], ['4', '4×']].map(([v, t]) => h('option', { value: v }, t)));
    spd.value = '1';
    spd.onchange = () => { speed = parseFloat(spd.value); if (timer) { stop(); play(); } };
    const bar = h('div', { class: 'player' },
      btn('first', 'First step', () => go(0)), btn('prev', 'Previous step', () => go(i - 1)), playBtn,
      btn('next', 'Next step', () => go(i + 1)), btn('last', 'Last step', () => go(steps.length - 1)), range, count, spd);
    fig.tools.prepend(bar);
    range.addEventListener('input', () => go(parseInt(range.value, 10)));
    fig.root.tabIndex = 0;
    fig.root.addEventListener('keydown', (e) => {
      if (e.target.closest('input,select,textarea')) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
      else if (e.key === ' ') { e.preventDefault(); timer ? stop() : play(); }
    });
    function go(k) {
      if (!steps.length) return;
      i = DSA.clamp(k, 0, steps.length - 1);
      range.value = String(i);
      count.textContent = (i + 1) + ' / ' + steps.length;
      try { opts.render(steps[i], i, steps); } catch (e) { console.error(e); }
      if (i >= steps.length - 1) stop();
    }
    function play() {
      if (i >= steps.length - 1) go(0);
      playBtn.innerHTML = DSA.icon('pause'); playBtn.title = 'Pause';
      timer = setInterval(() => { if (i >= steps.length - 1) stop(); else go(i + 1); }, (opts.interval || 1000) / speed);
    }
    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
      playBtn.innerHTML = DSA.icon('play'); playBtn.title = 'Play';
    }
    return {
      setSteps(s, start) { stop(); steps = s || []; range.max = String(Math.max(0, steps.length - 1)); go(start || 0); },
      go, play, stop,
      get index() { return i; },
      destroy: stop,
    };
  };

  /* Builds the input row (label + field) for a widget and returns a getter. */
  DSA.widgetInputs = function (fig, fields, onApply) {
    const els = {};
    for (const f of fields) {
      const id = 'w-' + Math.random().toString(36).slice(2, 8);
      const inp = h('input', { type: 'text', id, value: f.value, class: f.short ? 'short' : '', 'aria-label': f.label });
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') onApply(); });
      els[f.key] = { inp, f };
      fig.inputs.append(h('label', { for: id }, f.label, inp));
    }
    fig.inputs.append(DSA.btn('Apply', 'check', onApply));
    return function read() {
      const out = {};
      for (const k in els) {
        const { inp, f } = els[k];
        const raw = inp.value;
        if (f.type === 'nums') out[k] = DSA.parseNums(raw, DSA.parseNums(f.value, []));
        else if (f.type === 'num') { const n = parseFloat(raw); out[k] = Number.isFinite(n) ? n : parseFloat(f.value); }
        else if (f.type === 'list') out[k] = DSA.parseList(raw);
        else out[k] = raw.trim() || f.value;
      }
      return out;
    };
  };
})();
