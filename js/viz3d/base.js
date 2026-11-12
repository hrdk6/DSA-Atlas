/* DSA Atlas — shared three.js stage: lights, labels, rounded blocks, arrows,
   promise-based tweens, toolbar helpers. Every 3D figure is built on this. */
(function () {
  'use strict';
  const DSA = window.DSA;
  const h = DSA.h;
  const D3 = (DSA.d3 = { forceTimers: !!DSA.testMode });

  /* Fixed 3D palette: saturated mid-tones that read on both the dark and light stage. */
  const PAL = (D3.PAL = {
    ink: '#4d8dff', inkDeep: '#2d5fd0', accent: '#ffad3b', mint: '#29c993', coral: '#ff5d6c',
    violet: '#9677ff', cyan: '#2fc2dc', node: '#4d8dff', edge: '#8193b8', label: '#8a9bbd',
    dim: '#56617a', white: '#ffffff', ghost: '#9fb0d0',
  });
  D3.layerColors = ['#ffad3b', '#29c993', '#2fc2dc', '#4d8dff', '#9677ff', '#ff5d6c', '#f472b6', '#a3e635'];

  let webgl = null;
  D3.ok = function () {
    if (!window.THREE || !THREE.OrbitControls) return false;
    if (webgl === null) {
      try { const c = document.createElement('canvas'); webgl = !!(c.getContext('webgl2') || c.getContext('webgl')); }
      catch (e) { webgl = false; }
    }
    return webgl;
  };

  const ease = (D3.ease = {
    linear: (t) => t,
    inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    out: (t) => 1 - Math.pow(1 - t, 3),
    back: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  });

  /* ------------------------------------------------------- canvas labels */
  function drawLabel(canvas, text, o) {
    const px = 96;
    const family = o.family || '"JetBrains Mono", ui-monospace, Consolas, monospace';
    const font = `${o.weight || 700} ${px}px ${family}`;
    const c = canvas.getContext('2d');
    c.font = font;
    const tw = Math.ceil(c.measureText(text).width);
    const padX = o.bg ? 34 : 10, padY = o.bg ? 16 : 6;
    canvas.width = Math.max(tw + padX * 2, o.bg ? px + padY * 2 : 1);
    canvas.height = px + padY * 2;
    c.font = font;
    if (o.bg) {
      const r = canvas.height / 2.6, w = canvas.width, hh = canvas.height;
      c.beginPath();
      c.moveTo(r, 0); c.lineTo(w - r, 0); c.quadraticCurveTo(w, 0, w, r); c.lineTo(w, hh - r); c.quadraticCurveTo(w, hh, w - r, hh);
      c.lineTo(r, hh); c.quadraticCurveTo(0, hh, 0, hh - r); c.lineTo(0, r); c.quadraticCurveTo(0, 0, r, 0); c.closePath();
      c.fillStyle = o.bg; c.fill();
      if (o.border) { c.lineWidth = 6; c.strokeStyle = o.border; c.stroke(); }
    }
    c.fillStyle = o.color || '#ffffff';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(text, canvas.width / 2, canvas.height / 2 + px * 0.04);
  }

  const geoCache = {};
  function roundedBoxGeo(w, hgt, d, r) {
    const key = [w, hgt, d, r].join(':');
    if (geoCache[key]) return geoCache[key];
    const s = new THREE.Shape();
    const x = -w / 2, y = -hgt / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + hgt - r); s.quadraticCurveTo(x + w, y + hgt, x + w - r, y + hgt);
    s.lineTo(x + r, y + hgt); s.quadraticCurveTo(x, y + hgt, x, y + hgt - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    const bev = Math.min(r * 0.6, d * 0.2);
    const g = new THREE.ExtrudeGeometry(s, { depth: d - bev * 2, bevelEnabled: true, bevelThickness: bev, bevelSize: bev * 0.8, bevelSegments: 3, curveSegments: 6 });
    g.center();
    geoCache[key] = g;
    return g;
  }

  /* ---------------------------------------------------------------- stage */
  D3.stage = function (container, o) {
    o = o || {};
    const fig = o.hero ? null : DSA.figure({ kicker: o.kicker, title: o.title, hint: o.hint || 'Drag to orbit · scroll to zoom', caption: o.caption, height: o.height || 420 });
    const stageEl = o.hero ? container.querySelector('.fig-stage') || container.appendChild(h('div', { class: 'fig-stage' })) : fig.stage;
    if (!o.hero) container.append(fig.root);
    const ctx = { fig, stageEl, alive: true, speed: 1, busy: false, PAL };
    const noop = () => {};
    if (!D3.ok()) {
      stageEl.append(h('div', { class: 'fig-fallback' }, '3D view unavailable: it needs WebGL and an internet connection to load three.js. The explanation and the other figures on this page still work.'));
      return Object.assign(ctx, { fallback: true, destroy: noop, say: (x) => fig && fig.say(x), stat: noop, button: () => h('span'), run: noop });
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, o.hero ? 1.25 : 1.75));
    const useShadows = o.ground !== false && !o.hero;
    renderer.shadowMap.enabled = useShadows;
    if (useShadows) renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);
    stageEl.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(o.fov || 38, 1, 0.1, 800);
    const camPos = o.camera || [0, 7, 15];
    camera.position.set(camPos[0], camPos[1], camPos[2]);
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    const tgt = o.target || [0, 1, 0];
    controls.target.set(tgt[0], tgt[1], tgt[2]);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 2.5;
    controls.maxDistance = 90;
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.enablePan = true;
    if (o.autoRotate) { controls.autoRotate = true; controls.autoRotateSpeed = o.autoRotate; }
    if (o.hero) controls.enableZoom = false;

    scene.add(new THREE.HemisphereLight(0xe4ecff, 0x2a3350, 0.72));
    const key = new THREE.DirectionalLight(0xffffff, 0.82);
    key.position.set(7, 14, 9);
    key.castShadow = useShadows;
    if (useShadows) {
      key.shadow.mapSize.set(1024, 1024);
      const sc = key.shadow.camera; sc.left = -22; sc.right = 22; sc.top = 22; sc.bottom = -22; sc.near = 1; sc.far = 60;
      key.shadow.bias = -0.0006;
      key.shadow.radius = 4;
    }
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x8fb2ff, 0.38);
    rim.position.set(-9, 7, -10);
    scene.add(rim);
    if (o.ground !== false) {
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), new THREE.ShadowMaterial({ opacity: 0.2 }));
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = o.groundY || 0;
      ground.receiveShadow = true;
      scene.add(ground);
      const grid = new THREE.GridHelper(80, 80, 0x7f93ba, 0x7f93ba);
      grid.material.transparent = true;
      grid.material.opacity = 0.13;
      grid.position.y = (o.groundY || 0) + 0.002;
      scene.add(grid);
    }
    const root = new THREE.Group();
    scene.add(root);

    /* -- tweens -- */
    const tweens = [];
    function tween(target, to, ms, ez, onUpdate) {
      return new Promise((resolve) => {
        if (!ctx.alive) return resolve();
        const from = {};
        for (const k in to) from[k] = target[k];
        tweens.push({ target, from, to, start: performance.now(), dur: Math.max(1, (ms == null ? 500 : ms) / ctx.speed), ease: ez || ease.inOut, onUpdate, resolve });
        kick();
      });
    }
    function stepTweens(now) {
      for (let i = tweens.length - 1; i >= 0; i--) {
        const tw = tweens[i];
        const p = Math.min(1, (now - tw.start) / tw.dur);
        const e = tw.ease(p);
        for (const k in tw.to) tw.target[k] = tw.from[k] + (tw.to[k] - tw.from[k]) * e;
        if (tw.onUpdate) tw.onUpdate(e);
        if (p >= 1) { tweens.splice(i, 1); tw.resolve(); }
      }
    }
    const moveTo = (obj, pos, ms, ez) => tween(obj.position, { x: pos.x != null ? pos.x : obj.position.x, y: pos.y != null ? pos.y : obj.position.y, z: pos.z != null ? pos.z : obj.position.z }, ms, ez);
    const scaleTo = (obj, s, ms, ez) => tween(obj.scale, { x: s, y: s, z: s }, ms, ez);
    function colorTo(mat, hex, ms) {
      const c0 = mat.color.clone(), c1 = new THREE.Color(hex), p = { t: 0 };
      return tween(p, { t: 1 }, ms == null ? 300 : ms, ease.inOut, () => mat.color.copy(c0).lerp(c1, p.t));
    }
    function emissiveTo(mat, hex, intensity, ms) {
      const c0 = mat.emissive.clone(), c1 = new THREE.Color(hex), i0 = mat.emissiveIntensity, p = { t: 0 };
      return tween(p, { t: 1 }, ms == null ? 300 : ms, ease.inOut, () => { mat.emissive.copy(c0).lerp(c1, p.t); mat.emissiveIntensity = i0 + (intensity - i0) * p.t; });
    }
    const wait = (ms) => new Promise((r) => setTimeout(r, (ms || 0) / ctx.speed));

    /* -- objects -- */
    function label(text, lo) {
      lo = Object.assign({ size: 0.45 }, lo || {});
      const canvas = document.createElement('canvas');
      const tex = new THREE.CanvasTexture(canvas);
      tex.minFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: !!lo.depthTest, depthWrite: false });
      const sp = new THREE.Sprite(mat);
      sp.renderOrder = lo.renderOrder != null ? lo.renderOrder : 20;
      sp.userData.set = (t, more) => {
        Object.assign(lo, more || {});
        drawLabel(canvas, String(t), lo);
        tex.needsUpdate = true;
        sp.scale.set((lo.size * canvas.width) / canvas.height, lo.size, 1);
      };
      sp.userData.set(text);
      return sp;
    }
    function stdMat(color, extra) {
      return new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.38, metalness: 0.05, emissive: 0x000000 }, extra || {}));
    }
    function block(value, bo) {
      bo = Object.assign({ w: 1, h: 1, d: 1, r: 0.16, color: PAL.ink, labelSize: 0.44, labelColor: '#ffffff' }, bo || {});
      const g = new THREE.Group();
      const mat = stdMat(bo.color, bo.opacity != null ? { transparent: true, opacity: bo.opacity } : null);
      const mesh = new THREE.Mesh(roundedBoxGeo(bo.w, bo.h, bo.d, bo.r), mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      g.add(mesh);
      let lbl = null;
      if (value != null) {
        lbl = label(String(value), { size: bo.labelSize, color: bo.labelColor });
        lbl.position.set(0, 0, 0);
        g.add(lbl);
      }
      g.userData = { mesh, mat, lbl, value };
      g.setValue = (v) => { g.userData.value = v; if (lbl) lbl.userData.set(String(v)); };
      return g;
    }
    function ball(value, bo) {
      bo = Object.assign({ r: 0.5, color: PAL.ink, labelSize: 0.42, labelColor: '#ffffff' }, bo || {});
      const g = new THREE.Group();
      const mat = stdMat(bo.color, { roughness: 0.3 });
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(bo.r, 32, 22), mat);
      mesh.castShadow = true;
      g.add(mesh);
      let lbl = null;
      if (value != null) { lbl = label(String(value), { size: bo.labelSize, color: bo.labelColor }); g.add(lbl); }
      g.userData = { mesh, mat, lbl, value };
      g.setValue = (v) => { g.userData.value = v; if (lbl) lbl.userData.set(String(v)); };
      return g;
    }
    const UP = new THREE.Vector3(0, 1, 0);
    function arrow(color, ao) {
      ao = Object.assign({ r: 0.04, head: 0.26, headR: 0.12 }, ao || {});
      const g = new THREE.Group();
      const mat = stdMat(color || PAL.edge, { roughness: 0.5 });
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(ao.r, ao.r, 1, 10), mat);
      const head = ao.head ? new THREE.Mesh(new THREE.ConeGeometry(ao.headR, ao.head, 16), mat) : null;
      shaft.castShadow = true;
      g.add(shaft);
      if (head) { head.castShadow = true; g.add(head); }
      g.userData.mat = mat;
      g.set = (a, b) => {
        const dir = new THREE.Vector3().subVectors(b, a);
        const len = dir.length();
        if (len < 1e-4) { g.visible = false; return; }
        g.visible = true;
        dir.normalize();
        const hl = head ? Math.min(ao.head, len * 0.5) : 0;
        const sl = Math.max(0.001, len - hl);
        const q = new THREE.Quaternion().setFromUnitVectors(UP, dir);
        shaft.scale.set(1, sl, 1);
        shaft.position.copy(a).addScaledVector(dir, sl / 2);
        shaft.quaternion.copy(q);
        if (head) { head.position.copy(a).addScaledVector(dir, sl + hl / 2); head.quaternion.copy(q); }
      };
      return g;
    }
    const edge = (color, r) => arrow(color, { r: r || 0.035, head: 0 });
    /* Curved arrow along a quadratic bezier (used for pointers that jump backwards). */
    function curve(color, co) {
      co = Object.assign({ r: 0.035 }, co || {});
      const g = new THREE.Group();
      const mat = stdMat(color || PAL.edge, { roughness: 0.5 });
      let tube = null;
      const head = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.24, 14), mat);
      g.add(head);
      g.userData.mat = mat;
      g.set = (a, b, lift) => {
        const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
        mid.y += lift == null ? 1.1 : lift;
        const crv = new THREE.QuadraticBezierCurve3(a.clone(), mid, b.clone());
        if (tube) { g.remove(tube); tube.geometry.dispose(); }
        tube = new THREE.Mesh(new THREE.TubeGeometry(crv, 28, co.r, 8, false), mat);
        g.add(tube);
        const end = crv.getPoint(1), before = crv.getPoint(0.94);
        const dir = new THREE.Vector3().subVectors(end, before).normalize();
        head.position.copy(end).addScaledVector(dir, -0.1);
        head.quaternion.setFromUnitVectors(UP, dir);
      };
      return g;
    }

    /* -- render loop -- */
    let visible = true, raf = 0, idleFrames = 0, usingTimer = false;
    const tickers = new Set();
    /* D3.forceTimers drives frames from setTimeout (used for automated testing in hidden windows). */
    function schedule() { usingTimer = !!D3.forceTimers; raf = usingTimer ? setTimeout(() => frame(performance.now()), 16) : requestAnimationFrame(frame); }
    function unschedule() { if (!raf) return; if (usingTimer) clearTimeout(raf); else cancelAnimationFrame(raf); raf = 0; }
    function frame(now) {
      raf = 0;
      if (!ctx.alive) return;
      stepTweens(now);
      for (const fn of tickers) fn(now);
      const moved = controls.update();
      renderer.render(scene, camera);
      if (tweens.length || tickers.size || moved || controls.autoRotate) idleFrames = 0; else idleFrames++;
      if (visible && !document.hidden && idleFrames < 90) schedule();
    }
    function kick() {
      idleFrames = 0;
      if (D3.forceTimers && raf && !usingTimer) unschedule();
      if (!raf && visible && !document.hidden && ctx.alive) schedule();
    }
    function onVisChange() {
      if (document.hidden) unschedule();
      else if (visible && ctx.alive) kick();
    }
    document.addEventListener('visibilitychange', onVisChange);
    controls.addEventListener('start', kick);
    controls.addEventListener('change', kick);
    renderer.domElement.addEventListener('wheel', kick, { passive: true });
    function resize() {
      const w = stageEl.clientWidth || 600, hh = stageEl.clientHeight || 400;
      renderer.setSize(w, hh, false);
      camera.aspect = w / Math.max(1, hh);
      camera.updateProjectionMatrix();
      kick();
    }
    const ro = new ResizeObserver(resize);
    ro.observe(stageEl);
    const io = new IntersectionObserver((ents) => { visible = D3.forceTimers || ents.some((e) => e.isIntersecting); if (visible) kick(); });
    io.observe(stageEl);
    resize();

    /* -- picking -- */
    const ray = new THREE.Raycaster();
    let downAt = null;
    const pickers = [];
    renderer.domElement.addEventListener('pointerdown', (e) => { downAt = [e.clientX, e.clientY]; });
    renderer.domElement.addEventListener('pointerup', (e) => {
      if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 5 || !pickers.length) return;
      const r = renderer.domElement.getBoundingClientRect();
      const m = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(m, camera);
      for (const pk of pickers) {
        const objs = pk.objects();
        const hit = ray.intersectObjects(objs, true)[0];
        if (hit) {
          let o2 = hit.object;
          while (o2 && !objs.includes(o2)) o2 = o2.parent;
          if (o2) { pk.fn(o2); break; }
        }
      }
    });

    /* -- toolbar -- */
    const buttons = [];
    function setBusy(b) {
      ctx.busy = b;
      for (const bt of buttons) if (!bt.dataset.always) bt.disabled = b;
    }
    async function run(fn) {
      if (ctx.busy) return;
      setBusy(true);
      try { await fn(); } catch (e) { if (ctx.alive) console.error(e); }
      if (ctx.alive) setBusy(false);
    }
    function button(text, fn, bo) {
      bo = bo || {};
      const b = h('button', { class: 'btn sm ' + (bo.primary ? 'primary' : bo.accent ? 'accent' : ''), type: 'button', html: (bo.icon ? DSA.icon(bo.icon) : '') + '<span>' + DSA.esc(text) + '</span>' });
      b.addEventListener('click', () => (bo.always ? fn() : run(fn)));
      if (bo.always) b.dataset.always = '1';
      if (bo.title) b.title = bo.title;
      buttons.push(b);
      return b;
    }
    function input(value, io2) {
      io2 = io2 || {};
      const el = h('input', { type: io2.type || 'text', value: String(value), id: io2.id, 'aria-label': io2.label || 'value', style: io2.width ? { width: io2.width } : null });
      if (io2.min != null) el.min = io2.min;
      if (io2.max != null) el.max = io2.max;
      return el;
    }
    function select(options, so) {
      so = so || {};
      const el = h('select', { id: so.id, 'aria-label': so.label || 'choose' }, options.map(([v, t]) => h('option', { value: v }, t)));
      if (so.value) el.value = so.value;
      return el;
    }
    function speedControl() {
      const r = h('input', { type: 'range', min: '0.25', max: '3', step: '0.25', value: '1', 'aria-label': 'Animation speed' });
      r.addEventListener('input', () => { ctx.speed = parseFloat(r.value); });
      return h('label', null, 'speed', r);
    }

    function disposeObj(obj) {
      if (!obj) return;
      obj.traverse((child) => {
        if (child.geometry && !Object.values(geoCache).includes(child.geometry)) child.geometry.dispose();
        if (child.material) {
          const ms = Array.isArray(child.material) ? child.material : [child.material];
          for (const m of ms) { if (m.map) m.map.dispose(); m.dispose(); }
        }
      });
    }

    function destroy() {
      if (!ctx.alive) return;
      ctx.alive = false;
      unschedule();
      document.removeEventListener('visibilitychange', onVisChange);
      ro.disconnect();
      io.disconnect();
      for (const tw of tweens.splice(0)) tw.resolve();
      controls.dispose();
      scene.traverse((obj) => {
        if (obj.geometry && !Object.values(geoCache).includes(obj.geometry)) obj.geometry.dispose();
        if (obj.material) {
          const ms = Array.isArray(obj.material) ? obj.material : [obj.material];
          for (const m of ms) { if (m.map) m.map.dispose(); m.dispose(); }
        }
      });
      renderer.dispose();
      if (renderer.forceContextLoss) renderer.forceContextLoss();
      renderer.domElement.remove();
    }

    return Object.assign(ctx, {
      THREE, renderer, scene, camera, controls, root,
      tween, moveTo, scaleTo, colorTo, emissiveTo, wait, kick,
      label, block, ball, arrow, edge, curve, stdMat,
      dispose: disposeObj,
      remove: (...objs) => { for (const obj of objs) { if (!obj) continue; ctx.root.remove(obj); disposeObj(obj); } },
      isVisible: () => visible && !document.hidden,
      onTick: (fn) => { tickers.add(fn); kick(); return () => tickers.delete(fn); },
      onPick: (objects, fn) => pickers.push({ objects, fn }),
      say: (html, cx) => fig && fig.say(html, cx),
      stat: (k, l, v) => fig && fig.stat(k, l, v),
      legend: (items) => fig && fig.legend(items),
      group: (...kids) => fig && fig.group(...kids),
      button, input, select, speedControl, run, setBusy, destroy,
      vec: (x, y, z) => new THREE.Vector3(x, y, z),
      lookAt(target, pos, ms) {
        const t0 = controls.target;
        const ps = [];
        if (target) ps.push(tween(t0, { x: target[0], y: target[1], z: target[2] }, ms || 700));
        if (pos) ps.push(tween(camera.position, { x: pos[0], y: pos[1], z: pos[2] }, ms || 700));
        return Promise.all(ps);
      },
    });
  };

  /* Simple pausable "player" for 3D scenes that replay a list of operations. */
  D3.flow = function (ctx) {
    const f = { paused: false, stepOnce: false, cancelled: false, waiters: [] };
    f.gate = () => new Promise((resolve) => {
      const check = () => {
        if (f.cancelled || !ctx.alive) return resolve(false);
        if (!f.paused || f.stepOnce) { f.stepOnce = false; return resolve(true); }
        f.waiters.push(check);
      };
      check();
    });
    f.release = () => { const w = f.waiters.splice(0); w.forEach((fn) => fn()); };
    f.pause = () => { f.paused = true; };
    f.play = () => { f.paused = false; f.release(); };
    f.step = () => { f.paused = true; f.stepOnce = true; f.release(); };
    f.cancel = () => { f.cancelled = true; f.release(); };
    return f;
  };
})();
