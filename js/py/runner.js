/* Runs Python in the browser with Pyodide, inside a Web Worker made from a
   Blob (so it works from file:// too). A run that takes too long is assumed
   to be an infinite loop: the worker is terminated and recreated next time. */
(function () {
  'use strict';
  const DSA = window.DSA;
  const VERSION = '0.26.4';
  const URLS = [`https://cdn.jsdelivr.net/pyodide/v${VERSION}/full/`, `https://cdn.jsdelivr.net/npm/pyodide@${VERSION}/`];

  const WORKER_SRC = `
    let py = null;
    async function init(urls, setup) {
      let last = null;
      for (const u of urls) {
        try { importScripts(u + 'pyodide.js'); py = await loadPyodide({ indexURL: u }); break; }
        catch (e) { last = e; py = null; }
      }
      if (!py) throw last || new Error('Pyodide did not load');
      py.runPython(setup);
    }
    self.onmessage = async (e) => {
      const { id, cmd, args } = e.data;
      try {
        if (cmd === 'init') { await init(args.urls, args.setup); self.postMessage({ id, ok: true }); return; }
        if (cmd === 'run') {
          const fn = py.globals.get('api_run');
          const out = fn(args.code, args.driver, args.mode, args.maxSteps, args.expect);
          fn.destroy();
          self.postMessage({ id, ok: true, data: out });
        }
      } catch (err) { self.postMessage({ id, ok: false, error: String((err && err.message) || err) }); }
    };`;

  let worker = null, initP = null, seq = 0, mainPy = null;
  const pending = new Map();

  function makeWorker() {
    const url = URL.createObjectURL(new Blob([WORKER_SRC], { type: 'text/javascript' }));
    const w = new Worker(url);
    w.onmessage = (e) => { const p = pending.get(e.data.id); if (p) { pending.delete(e.data.id); p(e.data); } };
    w.onerror = (e) => { for (const p of pending.values()) p({ ok: false, error: 'The Python worker crashed: ' + (e.message || 'unknown error') }); pending.clear(); };
    return w;
  }
  function call(cmd, args, timeoutMs) {
    return new Promise((resolve) => {
      const id = ++seq;
      let t = null;
      if (timeoutMs) t = setTimeout(() => { pending.delete(id); resolve({ ok: false, timeout: true }); }, timeoutMs);
      pending.set(id, (d) => { clearTimeout(t); resolve(d); });
      worker.postMessage({ id, cmd, args });
    });
  }
  /* Fallback when workers are blocked: load Pyodide on the page itself (no infinite-loop protection). */
  function loadScript(src) {
    return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('could not load ' + src)); document.head.appendChild(s); });
  }
  async function initMain() {
    let last = null;
    for (const u of URLS) {
      try { await loadScript(u + 'pyodide.js'); mainPy = await window.loadPyodide({ indexURL: u }); break; } catch (e) { last = e; mainPy = null; }
    }
    if (!mainPy) throw last || new Error('Pyodide did not load');
    mainPy.runPython(DSA.PY_SETUP);
  }
  function ensure() {
    if (initP) return initP;
    initP = (async () => {
      if (!DSA.PY_SETUP) throw new Error('data/pyruntime.js is missing');
      let useWorker = true;
      try { worker = makeWorker(); } catch (e) { useWorker = false; }
      if (useWorker) {
        const r = await call('init', { urls: URLS, setup: DSA.PY_SETUP }, 120000);
        if (!r.ok) {
          worker.terminate(); worker = null;
          if (r.timeout) throw new Error('timed out while downloading Python');
          try { await initMain(); } catch (e2) { throw new Error(r.error); }
        }
      } else await initMain();
      DSA.py.ready = true;
    })();
    initP.catch(() => { initP = null; });
    return initP;
  }
  async function exec(mode, code, driver, expect, maxSteps, timeoutMs) {
    try { await ensure(); }
    catch (e) {
      return { ok: false, error: 'Python could not start in this browser: ' + e.message + '. The first run downloads about 10 MB from cdn.jsdelivr.net, so it needs an internet connection (afterwards it is cached).' };
    }
    const args = { code: String(code || ''), driver: String(driver || ''), mode, maxSteps: maxSteps || 1200, expect: expect == null || expect === '' ? null : String(expect) };
    DSA.store.touch();
    if (!worker && mainPy) {
      try {
        const fn = mainPy.globals.get('api_run');
        const out = fn(args.code, args.driver, args.mode, args.maxSteps, args.expect);
        fn.destroy();
        return JSON.parse(out);
      } catch (e) { return { ok: false, error: String(e.message || e) }; }
    }
    const r = await call('run', args, timeoutMs);
    if (r.timeout) {
      worker.terminate(); worker = null; initP = null; DSA.py.ready = false;
      return { ok: false, error: `Stopped after ${timeoutMs / 1000} seconds. That usually means an infinite loop (a while-loop whose condition never becomes false). Python will restart on the next run.` };
    }
    if (!r.ok) return { ok: false, error: r.error };
    try { return JSON.parse(r.data); } catch (e) { return { ok: false, error: 'Unexpected response from Python: ' + e.message }; }
  }

  DSA.py = Object.assign(DSA.py || {}, {
    ready: false,
    warm() { ensure().catch(() => {}); },
    run: (code, driver, expect) => exec('run', code, driver, expect, 0, 12000),
    trace: (code, driver, expect, maxSteps) => exec('trace', code, driver, expect, maxSteps || 1200, 25000),
  });
})();
