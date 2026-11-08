/* DSA Atlas — router + pages (home, lesson, study plan, problem, playground) */
(function () {
  'use strict';
  const DSA = window.DSA;
  const { h, esc, store } = DSA;
  const view = document.getElementById('view');
  const appEl = document.getElementById('app');

  const GROUP_ORDER = ['Start here', 'Foundations', 'Data structures', 'Patterns', 'Toolkit'];
  const lessonList = () => DSA.lessonOrder.map((id) => DSA.lessons[id]);
  const chapterNo = (id) => String(DSA.lessonOrder.indexOf(id) + 1).padStart(2, '0');
  const planIds = (plan) => plan.categories.flatMap((c) => c.ids);
  const ART = { lc75: 'assets/art/lc75.png', top150: 'assets/art/top150.png' };

  /* Images rendered in Blender live in assets/art; fall back to an SVG mark if missing. */
  function art(src, cls, fallbackIcon) {
    const img = h('img', { class: cls, src, alt: '', loading: 'lazy', decoding: 'async' });
    img.addEventListener('error', () => {
      const span = h('span', { class: cls + ' fallback', html: DSA.icon(fallbackIcon) });
      span.querySelector('svg').style.cssText = 'width:100%;height:auto;color:rgba(255,255,255,.35)';
      img.replaceWith(span);
    });
    return img;
  }

  /* ------------------------------------------------------------- sidebar */
  function renderSidebar(active) {
    const sb = document.getElementById('sidebar');
    sb.innerHTML = '';
    sb.append(
      h('a', { class: 'sb-brand', href: '#/' , html: DSA.logo + '<div><div class="sb-title">DSA Atlas</div><div class="sb-sub">Python · visual · interviews</div></div>' }),
      h('button', { class: 'sb-search', type: 'button', onclick: openPalette, html: DSA.icon('search') + '<span>Search lessons, problems…</span><span class="kbd">Ctrl K</span>' }),
    );
    const nav = h('nav', { class: 'sb-nav' });
    const link = (href, label, opts) => {
      opts = opts || {};
      const a = h('a', { class: 'sb-link' + (active === href ? ' active' : ''), href });
      if (opts.num) a.append(h('span', { class: 'sb-num' }, opts.num));
      else a.insertAdjacentHTML('beforeend', DSA.icon(opts.icon || 'arrays', 'sb-ico'));
      a.append(h('span', null, label));
      if (opts.badge) a.append(h('span', { class: 'sb-badge' }, opts.badge));
      if (opts.done != null) a.append(h('span', { class: 'sb-done' + (opts.done ? ' on' : ''), title: opts.done ? 'Completed' : 'Not completed yet' }));
      return a;
    };
    const g0 = h('div', { class: 'sb-group' }, link('#/', 'Home', { icon: 'home' }));
    nav.append(g0);
    const groups = {};
    for (const L of lessonList()) (groups[L.group] = groups[L.group] || []).push(L);
    for (const gName of GROUP_ORDER.concat(Object.keys(groups).filter((g) => !GROUP_ORDER.includes(g)))) {
      const items = groups[gName];
      if (!items) continue;
      const g = h('div', { class: 'sb-group' }, h('div', { class: 'sb-group-title' }, gName));
      for (const L of items) g.append(link('#/learn/' + L.id, L.short || L.title, { num: chapterNo(L.id), done: store.lessonDone(L.id) }));
      nav.append(g);
      if (gName === 'Patterns') {
        const sp = h('div', { class: 'sb-group' }, h('div', { class: 'sb-group-title' }, 'Study plans'));
        for (const pid of ['lc75', 'top150']) {
          const plan = DSA.plans[pid];
          if (!plan) continue;
          const c = store.counts(planIds(plan));
          sp.append(link('#/plan/' + pid, plan.title, { icon: pid, badge: c.solved + '/' + c.total }));
        }
        nav.append(sp);
      }
    }
    nav.append(h('div', { class: 'sb-group' }, h('div', { class: 'sb-group-title' }, 'Tools'),
      link('#/playground', 'Python visualizer', { icon: 'playground' })));
    sb.append(nav);
    const allIds = Object.keys(DSA.problems);
    const solved = allIds.filter((id) => store.problem(id) === 'solved').length;
    const pct = allIds.length ? Math.round((solved / allIds.length) * 100) : 0;
    sb.append(h('div', { class: 'sb-foot' },
      h('div', { class: 'mono' }, `${solved} of ${allIds.length} problems solved · ${store.streak()}-day streak`),
      h('div', { class: 'sb-meter' }, h('i', { style: { width: pct + '%' } }))));
  }

  /* --------------------------------------------------------------- topbar */
  function setCrumbs(parts) {
    const c = document.getElementById('crumbs');
    c.innerHTML = '';
    parts.forEach((p, i) => {
      if (i) c.append(h('span', { class: 'sep' }, '/'));
      if (p.href && i < parts.length - 1) c.append(h('a', { href: p.href }, p.label));
      else c.append(h('span', { class: 'here' }, p.label));
    });
  }
  function initTopbar() {
    const menu = document.getElementById('menuBtn');
    menu.innerHTML = DSA.icon('menu');
    menu.onclick = () => appEl.classList.toggle('nav-open');
    document.getElementById('scrim').onclick = () => appEl.classList.remove('nav-open');
    const themeBtn = document.getElementById('themeBtn');
    const isDark = () => {
      const t = document.documentElement.getAttribute('data-theme');
      return t ? t === 'dark' : !matchMedia('(prefers-color-scheme: light)').matches;
    };
    const paint = () => { themeBtn.innerHTML = DSA.icon(isDark() ? 'sun' : 'moon'); themeBtn.title = isDark() ? 'Switch to light theme' : 'Switch to dark theme'; };
    themeBtn.onclick = () => {
      const next = isDark() ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('dsa-theme', next); } catch (e) { /* theme lasts for this tab */ }
      paint();
      window.dispatchEvent(new Event('dsa-theme'));
    };
    paint();
    const seg = document.getElementById('modeSeg');
    const paintMode = () => seg.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.mode === store.pref('mode', 'learn')));
    seg.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-mode]');
      if (!b) return;
      store.setPref('mode', b.dataset.mode);
      paintMode();
      route();
    });
    paintMode();
  }

  /* ---------------------------------------------------------- lesson page */
  function renderSection(sec, ctx) {
    switch (sec.t) {
      case 'h': {
        ctx.secN++;
        const id = sec.id || 's' + ctx.secN;
        ctx.toc.push({ id, text: sec.text });
        return h('h2', { class: 'sec-h', id }, h('span', { class: 'sec-n' }, ctx.chapter + '.' + ctx.secN), sec.text);
      }
      case 'sub': return h('h3', { class: 'sub-h' }, sec.text);
      case 'p': return h('p', { html: sec.html });
      case 'html': return h('div', { html: sec.html });
      case 'callout': {
        const tags = { analogy: 'Analogy', tip: 'Pro tip', warn: 'Common mistake', interview: 'In the interview', key: 'Key idea', note: 'Note' };
        return h('div', { class: 'callout k-' + sec.kind },
          h('div', { class: 'callout-tag' }, tags[sec.kind] || sec.kind),
          h('div', { class: 'ct-body' }, sec.title ? h('h5', null, sec.title) : null, h('div', { html: sec.html })));
      }
      case 'code': return DSA.codeBlock(sec.code, sec);
      case 'table': {
        const t = h('table', { class: 'tbl' },
          h('thead', null, h('tr', null, sec.head.map((c) => h('th', { html: c })))),
          h('tbody', null, sec.rows.map((r) => h('tr', null, r.map((c) => h('td', { html: String(c) }))))));
        return h('div', { class: 'tbl-wrap' }, t, sec.caption ? h('div', { class: 'tbl-cap', html: sec.caption }) : null);
      }
      case 'list': return h('ul', { class: 'bullets' }, sec.items.map((x) => h('li', { html: x })));
      case 'steps': return h('ol', { class: 'steps-list' }, sec.items.map((x) => h('li', null, h('div', { html: x }))));
      case 'grid': return h('div', { class: 'cards-grid' }, sec.items.map((it) => h('div', { class: 'mini-card' }, h('h5', { html: it.title }), h('div', { html: it.html }))));
      case 'viz3d':
      case 'widget': {
        ctx.figN++;
        const holder = h('div', { class: 'wide' });
        const kicker = `Fig ${ctx.chapter}.${ctx.figN} · ${sec.t === 'viz3d' ? '3D interactive' : 'interactive'}`;
        DSA.lazy(holder, () => {
          const fn = sec.t === 'viz3d' ? DSA.scenes3d[sec.scene] : DSA.widgets[sec.name];
          if (!fn) { holder.append(h('div', { class: 'callout k-note' }, 'This visual is missing: ' + (sec.scene || sec.name))); return; }
          try {
            const base = { kicker };
            for (const k of ['title', 'caption', 'height', 'hint']) if (sec[k] != null) base[k] = sec[k];
            const inst = fn(holder, Object.assign(base, sec.opts || {}));
            if (inst && inst.destroy) DSA.mount(inst.destroy);
          } catch (e) { console.error(e); holder.append(h('div', { class: 'callout k-warn' }, 'This visual failed to start: ' + e.message)); }
        });
        holder.style.minHeight = sec.t === 'viz3d' ? ((sec.height || 420) + 150) + 'px' : '260px';
        return holder;
      }
      case 'quiz': return renderQuiz(sec.qs);
      case 'problems': {
        const ids = sec.ids.filter((id) => DSA.problems[id]);
        if (!ids.length) return null;
        return h('div', { class: 'vblock' }, sec.title ? h('h3', { class: 'sub-h' }, sec.title) : null, problemList(ids, null));
      }
      default: return null;
    }
  }
  function renderQuiz(qs) {
    const wrap = h('div', { class: 'quiz' });
    qs.forEach((q, qi) => {
      const box = h('div', { class: 'q' }, h('div', { class: 'q-text', html: `<span class="mono muted">Q${qi + 1}.</span> ${q.q}` }));
      const opts = h('div', { class: 'q-opts' });
      const why = h('div', { class: 'q-why', hidden: true, html: q.why || '' });
      q.opts.forEach((o, oi) => {
        const b = h('button', { class: 'q-opt', type: 'button', html: `<span class="q-key">${'ABCD'[oi]}</span><span>${o}</span>` });
        b.onclick = () => {
          opts.querySelectorAll('.q-opt').forEach((x, xi) => { x.classList.remove('right', 'wrong'); if (xi === q.a) x.classList.add('right'); });
          if (oi !== q.a) b.classList.add('wrong');
          why.hidden = !q.why;
          why.innerHTML = (oi === q.a ? '<b>Correct.</b> ' : '<b>Not quite.</b> ') + (q.why || '');
        };
        opts.append(b);
      });
      box.append(opts, why);
      wrap.append(box);
    });
    return wrap;
  }
  function lessonPage(id) {
    const L = DSA.lessons[id];
    if (!L) return notFound();
    const chapter = chapterNo(id);
    setCrumbs([{ label: 'Home', href: '#/' }, { label: L.group }, { label: L.title }]);
    const ctx = { chapter: String(+chapter), secN: 0, figN: 0, toc: [] };
    const body = h('div', { class: 'prose' });
    for (const sec of L.sections) { const el = renderSection(sec, ctx); if (el) body.append(el); }
    const idx = DSA.lessonOrder.indexOf(id);
    const prev = DSA.lessons[DSA.lessonOrder[idx - 1]], next = DSA.lessons[DSA.lessonOrder[idx + 1]];
    const doneBtn = h('button', { class: 'btn ' + (store.lessonDone(id) ? 'on' : 'primary'), type: 'button' });
    const paintDone = () => {
      const d = store.lessonDone(id);
      doneBtn.className = 'btn ' + (d ? 'on' : 'primary');
      doneBtn.innerHTML = d ? DSA.icon('check') + '<span>Completed</span>' : '<span>Mark lesson complete</span>';
    };
    doneBtn.onclick = () => { store.setLessonDone(id, !store.lessonDone(id)); paintDone(); renderSidebar('#/learn/' + id); };
    paintDone();
    const main = h('div', { class: 'lesson-main' },
      h('header', { class: 'lesson-head' },
        h('div', { class: 'eyebrow' }, `Chapter ${chapter} · ${L.group}`),
        h('h1', null, L.title),
        L.summary ? h('p', { class: 'lede', html: L.summary }) : null,
        h('div', { class: 'lesson-meta' },
          L.level ? h('span', { class: 'chip' }, L.level) : null,
          L.minutes ? h('span', { class: 'chip' }, '≈ ' + L.minutes + ' min') : null,
          ctx.figN ? h('span', { class: 'chip' }, ctx.figN + ' interactive figure' + (ctx.figN > 1 ? 's' : '')) : null)),
      body,
      h('div', { class: 'done-bar' }, h('p', null, 'Finished reading and tried the figures? Mark it so your progress stays up to date.'), doneBtn),
      h('nav', { class: 'lesson-nav' },
        prev ? h('a', { href: '#/learn/' + prev.id }, h('small', null, '← Previous'), prev.title) : h('span'),
        next ? h('a', { class: 'next', href: '#/learn/' + next.id }, h('small', null, 'Next →'), next.title) : h('a', { class: 'next', href: '#/plan/lc75' }, h('small', null, 'Next →'), 'Practice: LeetCode 75')));
    const toc = h('aside', { class: 'lesson-toc' }, h('div', { class: 'toc-title' }, 'On this page'),
      ctx.toc.map((t) => h('a', { href: '#/learn/' + id, 'data-target': t.id, onclick: (e) => { e.preventDefault(); document.getElementById(t.id).scrollIntoView({ behavior: 'smooth' }); } }, t.text)));
    view.append(h('div', { class: 'page' }, h('div', { class: 'lesson' }, main, toc)));
    /* highlight the TOC entry for the section on screen */
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((ents) => {
        for (const e of ents) if (e.isIntersecting) toc.querySelectorAll('a').forEach((a) => a.classList.toggle('on', a.dataset.target === e.target.id));
      }, { rootMargin: '-10% 0px -75% 0px' });
      ctx.toc.forEach((t) => { const el = document.getElementById(t.id); if (el) io.observe(el); });
      DSA.mount(() => io.disconnect());
    }
  }

  /* ---------------------------------------------------------- problem list */
  function problemList(ids, planId) {
    const list = h('div', { class: 'prob-list' });
    for (const id of ids) {
      const p = DSA.problems[id];
      if (!p) continue;
      const st = store.problem(id);
      list.append(h('a', { class: 'prob-row', href: planId ? `#/plan/${planId}/${id}` : `#/problem/${id}`, dataset: { id: String(id) } },
        h('span', { class: 'status-dot ' + (st || ''), title: st === 'solved' ? 'Solved' : st === 'review' ? 'Marked for review' : 'Not solved yet' }),
        h('span', { class: 'pr-id' }, '#' + id),
        h('span', { class: 'pr-title' }, p.title),
        h('span', { class: 'pr-pat' }, p.pattern),
        h('span', { class: 'pill ' + p.diff.toLowerCase() }, p.diff)));
    }
    return list;
  }

  /* ------------------------------------------------------------ plan page */
  function planPage(planId) {
    const plan = DSA.plans[planId];
    if (!plan) return notFound();
    setCrumbs([{ label: 'Home', href: '#/' }, { label: 'Study plans' }, { label: plan.title }]);
    const ids = planIds(plan);
    const c = store.counts(ids);
    const nextId = ids.find((id) => store.problem(id) !== 'solved');
    const diffCount = (d) => ids.filter((id) => DSA.problems[id] && DSA.problems[id].diff === d).length;
    const hero = h('section', { class: 'plan-hero ' + planId },
      art(ART[planId], 'pc-art', planId),
      h('div', { class: 'eyebrow' }, 'Study plan · ' + plan.categories.length + ' topics'),
      h('h1', null, plan.title),
      h('p', null, plan.subtitle),
      h('div', { class: 'ph-stats' },
        h('div', null, h('b', null, c.solved + ' / ' + c.total), 'solved'),
        h('div', null, h('b', null, String(c.review)), 'to review'),
        h('div', null, h('b', null, diffCount('Easy') + ' · ' + diffCount('Medium') + ' · ' + diffCount('Hard')), 'easy · medium · hard')),
      h('div', { class: 'progress' }, h('i', { style: { width: (c.total ? (c.solved / c.total) * 100 : 0) + '%' } })),
      h('div', { class: 'hero-ctas' },
        nextId ? h('a', { class: 'btn', href: `#/plan/${planId}/${nextId}` }, c.solved ? 'Continue with #' + nextId : 'Start with problem 1') : h('span', { class: 'btn' }, 'Plan complete'),
        h('a', { class: 'btn ghost', href: '#/learn/roadmap' }, 'How to practice')));
    const q = h('input', { type: 'search', placeholder: 'Filter by title, number or pattern', 'aria-label': 'Filter problems', id: 'plan-filter-' + planId });
    const diffSel = h('div', { class: 'seg' }, ['All', 'Easy', 'Medium', 'Hard'].map((d) => h('button', { type: 'button', class: d === 'All' ? 'on' : '', dataset: { d } }, d)));
    const stSel = h('div', { class: 'seg' }, [['all', 'Any status'], ['todo', 'Unsolved'], ['review', 'Review'], ['solved', 'Solved']].map(([k, l]) => h('button', { type: 'button', class: k === 'all' ? 'on' : '', dataset: { s: k } }, l)));
    const cats = h('div');
    let fDiff = 'All', fSt = 'all';
    function paint() {
      cats.innerHTML = '';
      const term = q.value.trim().toLowerCase();
      plan.categories.forEach((cat, ci) => {
        const vis = cat.ids.filter((id) => {
          const p = DSA.problems[id];
          if (!p) return false;
          if (fDiff !== 'All' && p.diff !== fDiff) return false;
          const st = store.problem(id);
          if (fSt === 'todo' && st === 'solved') return false;
          if (fSt === 'review' && st !== 'review') return false;
          if (fSt === 'solved' && st !== 'solved') return false;
          if (term && !(p.title.toLowerCase().includes(term) || String(id) === term || p.pattern.toLowerCase().includes(term))) return false;
          return true;
        });
        if (!vis.length) return;
        const cc = store.counts(cat.ids);
        const lesson = DSA.lessons[cat.lesson];
        cats.append(h('section', { class: 'cat-block' },
          h('div', { class: 'cat-head' },
            h('span', { class: 'eyebrow' }, String(ci + 1).padStart(2, '0')),
            h('h3', null, cat.name),
            h('span', { class: 'cat-count' }, cc.solved + '/' + cc.total + ' solved'),
            lesson ? h('a', { class: 'btn sm ghost cat-lesson', href: '#/learn/' + lesson.id }, 'Learn the pattern: ' + (lesson.short || lesson.title) + ' →') : null),
          cat.blurb ? h('p', { class: 'cat-blurb', html: cat.blurb }) : null,
          problemList(vis, planId)));
      });
      if (!cats.children.length) cats.append(h('p', { class: 'muted' }, 'No problems match these filters.'));
    }
    q.addEventListener('input', paint);
    diffSel.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; fDiff = b.dataset.d; diffSel.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); paint(); });
    stSel.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; fSt = b.dataset.s; stSel.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); paint(); });
    paint();
    view.append(h('div', { class: 'page' }, hero, h('div', { class: 'filters' }, q, diffSel, stSel), cats));
  }

  /* --------------------------------------------------------- problem page */
  function problemPage(pid, planId) {
    const p = DSA.problems[pid];
    if (!p) return notFound();
    const plan = planId && DSA.plans[planId];
    let cat = null, seq = null;
    if (plan) {
      seq = planIds(plan);
      cat = plan.categories.find((c) => c.ids.includes(+pid));
    }
    setCrumbs(plan ? [{ label: 'Home', href: '#/' }, { label: plan.title, href: '#/plan/' + planId }, { label: cat ? cat.name : '' }, { label: '#' + p.id + ' ' + p.title }]
      : [{ label: 'Home', href: '#/' }, { label: 'Problem' }, { label: '#' + p.id + ' ' + p.title }]);
    const practice = store.pref('mode', 'learn') === 'practice';
    const lesson = DSA.lessons[p.topic];
    const statusBtns = h('div', { class: 'prob-actions' });
    function paintStatus() {
      statusBtns.innerHTML = '';
      const st = store.problem(p.id);
      statusBtns.append(
        h('button', { class: 'btn sm ' + (st === 'solved' ? 'on' : ''), type: 'button', onclick: () => { store.setProblem(p.id, st === 'solved' ? null : 'solved'); paintStatus(); renderSidebar(currentActive); }, html: DSA.icon('check') + '<span>' + (st === 'solved' ? 'Solved' : 'Mark solved') + '</span>' }),
        h('button', { class: 'btn sm ' + (st === 'review' ? 'on-review' : ''), type: 'button', onclick: () => { store.setProblem(p.id, st === 'review' ? null : 'review'); paintStatus(); renderSidebar(currentActive); }, html: DSA.icon('flag') + '<span>' + (st === 'review' ? 'Marked for review' : 'Review later') + '</span>' }),
        h('a', { class: 'btn sm ghost', href: 'https://leetcode.com/problems/' + p.slug + '/', target: '_blank', rel: 'noopener', html: DSA.icon('external') + '<span>Solve on LeetCode</span>' }));
    }
    paintStatus();
    const block = (title, n, content, cls) => h('section', { class: 'pblock ' + (cls || '') }, h('h3', null, n ? h('span', { class: 'n' }, n) : null, title), h('div', { class: 'pb-body' }, content));
    const parts = [];
    parts.push(block('The problem in plain English', '01', h('p', { html: p.hook })));
    const hidden = [];
    if (p.brute) hidden.push({ gate: 'Hint 1: the naive idea', el: block('Start with brute force', '02', h('p', { html: p.brute })) });
    hidden.push({ gate: 'Hint 2: the key insight · pattern is ' + esc(p.pattern), el: block('The key insight', '03', h('p', { html: p.insight }), 'insight') });
    hidden.push({ gate: 'Show the step-by-step plan', el: block('The plan, step by step', '04', h('ol', { class: 'steps-list' }, p.steps.map((s) => h('li', null, h('div', { html: s }))))) });
    const codeEl = DSA.codeBlock(p.code, { title: p.slug.replace(/-/g, '_') + '.py', run: p.run, expect: p.expect });
    hidden.push({ gate: 'Show the Python solution', el: h('div', { style: { display: 'grid', gap: '10px' } },
      codeEl,
      h('div', { class: 'cx-row' },
        h('span', null, h('span', { class: 'lbl' }, 'Time'), h('span', { html: DSA.cx(p.time) })),
        h('span', null, h('span', { class: 'lbl' }, 'Space'), h('span', { html: DSA.cx(p.space) })),
        p.cxWhy ? h('span', { class: 'muted', style: { fontSize: '14px' }, html: p.cxWhy }) : null)) });
    if (p.tip) hidden.push({ gate: 'Show the interview tip', el: h('div', { class: 'callout k-interview' }, h('div', { class: 'callout-tag' }, 'In the interview'), h('div', { class: 'ct-body', html: p.tip })) });
    for (const x of hidden) {
      if (practice && x.gate) {
        const gate = h('div', { class: 'reveal-gate' }, h('p', { html: '<b>Practice mode.</b> Try it yourself first, then reveal.' }),
          h('button', { class: 'btn sm', type: 'button', html: DSA.icon('eye') + '<span>' + x.gate + '</span>' }));
        x.el.hidden = true;
        gate.querySelector('button').onclick = () => { gate.remove(); x.el.hidden = false; };
        parts.push(gate, x.el);
      } else parts.push(x.el);
    }
    const notes = h('textarea', { id: 'note-' + p.id, placeholder: 'Your notes: the trick you missed, edge cases, how long it took…' });
    notes.value = store.note(p.id);
    notes.addEventListener('input', () => store.setNote(p.id, notes.value));
    parts.push(block('My notes', null, h('div', { class: 'notes' }, notes)));
    let nav = null;
    if (seq) {
      const i = seq.indexOf(+pid);
      const pv = DSA.problems[seq[i - 1]], nx = DSA.problems[seq[i + 1]];
      nav = h('nav', { class: 'prob-nav' },
        pv ? h('a', { href: `#/plan/${planId}/${pv.id}` }, h('small', null, '← Previous'), h('span', null, '#' + pv.id + ' ' + pv.title)) : h('span'),
        nx ? h('a', { class: 'next', href: `#/plan/${planId}/${nx.id}` }, h('small', null, 'Next →'), h('span', null, '#' + nx.id + ' ' + nx.title)) : h('a', { class: 'next', href: '#/plan/' + planId }, h('small', null, 'Done →'), h('span', null, 'Back to the plan')));
    }
    view.append(h('div', { class: 'page' }, h('article', { class: 'prob' },
      h('header', { class: 'prob-head' },
        cat ? h('div', { class: 'eyebrow' }, plan.title + ' · ' + cat.name) : h('div', { class: 'eyebrow' }, 'Problem'),
        h('h1', null, h('span', { class: 'pid' }, '#' + p.id), p.title),
        h('div', { class: 'prob-meta' },
          h('span', { class: 'pill ' + p.diff.toLowerCase() }, p.diff),
          lesson ? h('a', { class: 'chip', href: '#/learn/' + lesson.id }, 'Pattern: ' + p.pattern) : h('span', { class: 'chip' }, p.pattern),
          (p.plans || []).map((x) => DSA.plans[x] ? h('a', { class: 'chip', href: '#/plan/' + x + '/' + p.id }, DSA.plans[x].title) : null)),
        statusBtns),
      parts, nav)));
  }

  /* ------------------------------------------------------------ home page */
  function homePage() {
    setCrumbs([{ label: 'Home' }]);
    const lessons = lessonList();
    const doneL = lessons.filter((L) => store.lessonDone(L.id)).length;
    const lc = DSA.plans.lc75 ? store.counts(planIds(DSA.plans.lc75)) : { solved: 0, total: 75 };
    const tp = DSA.plans.top150 ? store.counts(planIds(DSA.plans.top150)) : { solved: 0, total: 150 };
    const last = store.lastVisit();
    const firstLesson = lessons[0];
    const stage = h('div', { class: 'hero-stage' }, h('div', { class: 'hero-tag' }, 'Live · breadth-first search in 3D · drag to orbit'));
    const hero = h('section', { class: 'home-hero' },
      h('div', { class: 'hero-copy' },
        h('div', { class: 'eyebrow' }, 'Data structures & algorithms · in Python'),
        h('h1', { class: 'hero-title', html: 'See the algorithm.<br><em>Then</em> write it in <span class="py">Python</span>.' }),
        h('p', { class: 'lede' }, 'A visual study guide that starts from zero: every structure in 3D, every pattern as a step-by-step animation, and every LeetCode 75 and Top Interview 150 problem explained with tested Python you can run and step through line by line.'),
        h('div', { class: 'hero-ctas' },
          h('a', { class: 'btn primary', href: last && last !== '#/' ? last : '#/learn/' + (firstLesson ? firstLesson.id : '') }, last && last !== '#/' ? 'Continue where you left off' : 'Start chapter 01'),
          h('a', { class: 'btn', href: '#/plan/lc75' }, 'Open LeetCode 75'),
          h('a', { class: 'btn ghost', href: '#/playground', html: DSA.icon('playground') + '<span>Python visualizer</span>' }))),
      stage);
    const strip = h('section', { class: 'stat-strip' },
      h('div', { class: 'stat' }, h('b', null, doneL + '/' + lessons.length), h('span', null, 'chapters done')),
      h('div', { class: 'stat' }, h('b', null, lc.solved + '/' + lc.total), h('span', null, 'LeetCode 75')),
      h('div', { class: 'stat' }, h('b', null, tp.solved + '/' + tp.total), h('span', null, 'Top Interview 150')),
      h('div', { class: 'stat' }, h('b', null, store.streak() + (store.streak() === 1 ? ' day' : ' days')), h('span', null, 'study streak')));
    const planCard = (pid, sub) => {
      const plan = DSA.plans[pid];
      if (!plan) return null;
      const c = store.counts(planIds(plan));
      return h('a', { class: 'plan-card ' + pid, href: '#/plan/' + pid },
        art(ART[pid], 'pc-art', pid),
        h('h3', null, plan.title), h('p', null, sub),
        h('div', { class: 'pc-foot' }, h('small', null, c.solved + ' of ' + c.total + ' solved'), h('div', { class: 'progress' }, h('i', { style: { width: (c.solved / c.total) * 100 + '%' } }))));
    };
    const roadmap = h('div', { class: 'roadmap' });
    const phases = [
      ['Phase 1', 'Foundations', 'Big-O, the Python toolkit, and recursion. The vocabulary every other chapter uses.', ['bigo', 'python', 'recursion']],
      ['Phase 2', 'Core data structures', 'Arrays to graphs, each one in 3D: what it costs to read, insert and delete.', ['arrays', 'hashing', 'linkedlist', 'stackqueue', 'trees', 'heaps', 'graphs', 'tries']],
      ['Phase 3', 'Patterns & practice', 'The patterns that solve most interview problems, then the two LeetCode plans.', ['two-pointers', 'sliding-window', 'binary-search', 'dp', 'backtracking']],
    ];
    for (const [n, t, d, ids] of phases) {
      roadmap.append(h('div', { class: 'phase' }, h('div', { class: 'phase-n' }, n.toUpperCase()), h('h4', null, t), h('p', null, d),
        h('div', { class: 'links' }, ids.filter((i) => DSA.lessons[i]).map((i) => h('a', { class: 'chip', href: '#/learn/' + i }, DSA.lessons[i].short || DSA.lessons[i].title)))));
    }
    const grid = h('div', { class: 'topic-grid' });
    for (const L of lessons) {
      grid.append(h('a', { class: 'topic-card', href: '#/learn/' + L.id },
        h('div', { class: 'tc-art' }, topicArt(L)),
        h('div', null,
          h('div', { class: 'tc-num' }, 'CH ' + chapterNo(L.id) + ' · ' + L.group.toUpperCase()),
          h('h4', null, L.title),
          h('p', null, L.blurb || '')),
        store.lessonDone(L.id) ? h('span', { class: 'sb-done on tc-done', title: 'Completed' }) : null));
    }
    view.append(h('div', { class: 'page' }, hero, strip,
      h('div', { class: 'section-head' }, h('h2', null, 'Study plans'), h('p', null, 'The two LeetCode lists interviewers draw from most, grouped by pattern. Each problem has the logic, a tested solution, and a step-through visual.')),
      h('div', { class: 'plan-cards' }, planCard('lc75', 'Ace the coding interview with 75 essential questions'), planCard('top150', 'The must-do list for interview prep, 150 classics')),
      h('div', { class: 'section-head' }, h('h2', null, 'The roadmap'), h('p', null, 'New to DSA? Go in this order. Each phase builds on the one before it.')),
      roadmap,
      h('div', { class: 'section-head' }, h('h2', null, 'All chapters'), h('p', null, 'Every chapter has interactive figures, runnable Python and a short quiz.')),
      grid));
    DSA.lazy(stage, () => {
      if (DSA.scenes3d.graph) {
        const inst = DSA.scenes3d.graph(stage, { hero: true });
        if (inst && inst.destroy) DSA.mount(inst.destroy);
      }
    });
  }
  function topicArt(L) {
    const img = h('img', { src: 'assets/art/' + L.id + '.png', alt: '', loading: 'lazy', decoding: 'async' });
    img.addEventListener('error', () => { img.replaceWith(h('span', { html: DSA.icon(L.icon || L.id) })); });
    return img;
  }

  /* ----------------------------------------------------------- playground */
  function playgroundPage() {
    setCrumbs([{ label: 'Home', href: '#/' }, { label: 'Tools' }, { label: 'Python visualizer' }]);
    const samples = DSA.playgroundSamples || [];
    const saved = store.pref('pgCode', null);
    const ed = DSA.editor(saved != null ? saved : (samples[0] ? samples[0].code : 'nums = [3, 1, 4]\nprint(sum(nums))'), { onRun: () => runBtn.click(), onChange: (v) => store.setPref('pgCode', v) });
    const drv = DSA.editor(store.pref('pgDriver', samples[0] ? samples[0].driver : ''), { label: 'Example call', onChange: (v) => store.setPref('pgDriver', v) });
    const sel = h('select', { id: 'pg-sample', 'aria-label': 'Load a sample program' }, h('option', { value: '' }, 'Load a sample…'), samples.map((s, i) => h('option', { value: String(i) }, s.title)));
    sel.onchange = () => { const s = samples[+sel.value]; if (s) { ed.set(s.code); drv.set(s.driver || ''); store.setPref('pgCode', s.code); store.setPref('pgDriver', s.driver || ''); } };
    const out = h('div', { class: 'cb-out', hidden: true });
    const runBtn = DSA.btn('Run', 'run', async () => {
      DSA.renderRunOutput(out, { loading: DSA.py.ready ? 'Running…' : 'Loading Python in your browser (first run downloads about 10 MB)…' });
      DSA.renderRunOutput(out, await DSA.py.run(ed.get(), drv.get(), null));
    });
    const vizBtn = DSA.btn('Visualize step by step', 'eye', () => DSA.py.openDebugger({ code: ed.get(), driver: drv.get(), title: 'Playground' }), 'primary');
    view.append(h('div', { class: 'page' }, h('div', { class: 'pg' },
      h('header', { class: 'lesson-head', style: { marginBottom: '0' } },
        h('div', { class: 'eyebrow' }, 'Tools'),
        h('h1', null, 'Python visualizer'),
        h('p', { class: 'lede' }, 'Paste any Python and watch it run one line at a time: lists become rows of cells with index pointers, linked lists become chains, trees become trees, and the call stack grows and shrinks as functions recurse. Everything runs in your browser.')),
      h('div', { class: 'pg-bar' }, sel, runBtn, vizBtn, h('span', { class: 'muted', style: { fontSize: '13px' } }, 'Tip: Ctrl+Enter runs. Helpers ListNode, TreeNode, build_list, build_tree are preloaded.')),
      h('div', { class: 'pg-label' }, 'Your code'),
      h('div', { class: 'pg-editor' }, ed.el),
      h('div', { class: 'pg-label' }, 'Example call (optional). Its last line is the value shown as the result'),
      h('div', { class: 'pg-editor pg-driver' }, drv.el),
      out)));
  }

  function notFound() {
    setCrumbs([{ label: 'Home', href: '#/' }, { label: 'Not found' }]);
    view.append(h('div', { class: 'page' }, h('h1', null, 'That page does not exist'), h('p', { class: 'lede' }, 'The link may be from an older version of the guide.'), h('p', null, h('a', { class: 'btn', href: '#/' }, 'Go home'))));
  }

  /* -------------------------------------------------------- search palette */
  function searchIndex() {
    const items = [];
    for (const L of lessonList()) items.push({ kind: 'Chapter', title: L.title, sub: L.group, href: '#/learn/' + L.id, key: (L.title + ' ' + L.group + ' ' + (L.blurb || '')).toLowerCase() });
    for (const pid of Object.keys(DSA.plans)) items.push({ kind: 'Plan', title: DSA.plans[pid].title, sub: 'study plan', href: '#/plan/' + pid, key: DSA.plans[pid].title.toLowerCase() });
    for (const id of Object.keys(DSA.problems)) {
      const p = DSA.problems[id];
      const plan = (p.plans || [])[0];
      items.push({ kind: '#' + p.id, title: p.title, sub: p.pattern + ' · ' + p.diff, href: plan ? `#/plan/${plan}/${p.id}` : '#/problem/' + p.id, key: (p.id + ' ' + p.title + ' ' + p.pattern).toLowerCase() });
    }
    items.push({ kind: 'Tool', title: 'Python visualizer', sub: 'playground', href: '#/playground', key: 'python visualizer playground debugger' });
    return items;
  }
  function openPalette() {
    appEl.classList.remove('nav-open');
    const root = document.getElementById('modal-root');
    if (root.querySelector('.palette')) return;
    const items = searchIndex();
    const input = h('input', { class: 'pal-input', placeholder: 'Search chapters and problems: "two sum", "dp", "206"…', 'aria-label': 'Search' });
    const list = h('div', { class: 'pal-list', role: 'listbox' });
    let sel = 0, shown = [];
    const close = () => backdrop.remove();
    function paint() {
      const q = input.value.trim().toLowerCase();
      const terms = q.split(/\s+/).filter(Boolean);
      shown = items.filter((it) => terms.every((t) => it.key.includes(t))).slice(0, 40);
      sel = Math.min(sel, Math.max(0, shown.length - 1));
      list.innerHTML = '';
      if (!shown.length) list.append(h('div', { class: 'pal-empty' }, 'Nothing matches. Try a problem number or a pattern name.'));
      shown.forEach((it, i) => list.append(h('a', { class: 'pal-item' + (i === sel ? ' sel' : ''), href: it.href, onclick: close },
        h('span', { class: 'pi-kind' }, it.kind), h('span', { class: 'pi-title' }, it.title), h('span', { class: 'muted mono', style: { fontSize: '11.5px' } }, it.sub))));
    }
    input.addEventListener('input', () => { sel = 0; paint(); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, shown.length - 1); paint(); list.querySelector('.sel') && list.querySelector('.sel').scrollIntoView({ block: 'nearest' }); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); paint(); list.querySelector('.sel') && list.querySelector('.sel').scrollIntoView({ block: 'nearest' }); }
      else if (e.key === 'Enter') { e.preventDefault(); if (shown[sel]) { location.hash = shown[sel].href; close(); } }
      else if (e.key === 'Escape') close();
    });
    const backdrop = h('div', { class: 'modal-backdrop', onclick: (e) => { if (e.target === backdrop) close(); } }, h('div', { class: 'palette', role: 'dialog', 'aria-label': 'Search' }, input, list));
    root.append(backdrop);
    paint();
    input.focus();
  }

  /* --------------------------------------------------------------- router */
  let currentActive = '#/';
  function route() {
    DSA.unmountAll();
    view.innerHTML = '';
    appEl.classList.remove('nav-open');
    const hash = location.hash || '#/';
    const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    currentActive = '#/';
    try {
      if (!parts.length) { currentActive = '#/'; homePage(); }
      else if (parts[0] === 'learn') { currentActive = '#/learn/' + parts[1]; lessonPage(parts[1]); }
      else if (parts[0] === 'plan' && parts[2]) { currentActive = '#/plan/' + parts[1]; problemPage(parts[2], parts[1]); }
      else if (parts[0] === 'plan') { currentActive = '#/plan/' + parts[1]; planPage(parts[1]); }
      else if (parts[0] === 'problem') { problemPage(parts[1], null); }
      else if (parts[0] === 'playground') { currentActive = '#/playground'; playgroundPage(); }
      else notFound();
    } catch (e) {
      console.error(e);
      view.append(h('div', { class: 'page' }, h('div', { class: 'callout k-warn' }, h('div', { class: 'callout-tag' }, 'Error'), h('div', { class: 'ct-body' }, 'This page failed to render: ' + e.message))));
    }
    renderSidebar(currentActive);
    if (hash !== '#/') store.setLastVisit(hash);
    window.scrollTo(0, 0);
    const act = document.querySelector('.sb-link.active');
    if (act && act.scrollIntoViewIfNeeded) act.scrollIntoViewIfNeeded(false);
  }

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); }
    if (e.key === 'Escape') { const b = document.querySelector('#modal-root .modal-backdrop'); if (b && !b.dataset.sticky) b.remove(); }
  });
  window.addEventListener('hashchange', route);
  initTopbar();
  route();
  DSA.renderSidebar = () => renderSidebar(currentActive);
  DSA.openPalette = openPalette;
})();
