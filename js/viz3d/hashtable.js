/* 3D: hash table with separate chaining. A key is hashed, reduced modulo the
   bucket count, and dropped into that bucket. Collisions stack up as chains;
   when the load factor passes 0.75 the table doubles and re-hashes. */
(function () {
  'use strict';
  const DSA = window.DSA;
  function toyHash(s) {
    let hsh = 7;
    for (const ch of String(s)) hsh = (hsh * 31 + ch.charCodeAt(0)) % 1000003;
    return hsh;
  }
  DSA.scenes3d.hashtable = function (container, o) {
    const D3 = DSA.d3;
    const ctx = D3.stage(container, Object.assign({ title: 'Hash table: hash(key) % buckets tells you where to look', camera: [0, 6.4, 12.5], target: [0, 1.3, 0], height: 450 }, o));
    if (ctx.fallback) return ctx;
    const { THREE, PAL } = ctx;
    const SP = 1.3, IH = 0.55;
    let m = 8, buckets = [], pads = [], steps = 0;
    const bx = (i, mm) => (i - ((mm || m) - 1) / 2) * SP;
    const iy = (k) => 0.12 + IH / 2 + k * (IH + 0.05);

    function makePads(mm) {
      for (const p of pads) ctx.root.remove(p.pad, p.lbl);
      pads = [];
      for (let i = 0; i < mm; i++) {
        const pad = ctx.block(null, { w: 1.12, h: 0.1, d: 1.12, r: 0.08, color: PAL.ghost, opacity: 0.38 });
        pad.position.set(bx(i, mm), 0.05, 0);
        const lbl = ctx.label(String(i), { size: 0.32, color: PAL.label, weight: 600 });
        lbl.position.set(bx(i, mm), 0.14, 0.95);
        ctx.root.add(pad, lbl);
        pads.push({ pad, lbl });
      }
    }
    const machine = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.09, 16, 48), ctx.stdMat(PAL.accent, { emissive: PAL.accent, emissiveIntensity: 0.25 }));
    machine.position.set(0, 4.3, 0);
    const mLbl = ctx.label('hash()', { size: 0.32, color: PAL.accent, weight: 700 });
    mLbl.position.set(0, 5.35, 0);
    ctx.root.add(machine, mLbl);
    const count = () => buckets.reduce((a, b) => a + b.length, 0);
    function stats() {
      ctx.stat('steps', 'steps', steps);
      ctx.stat('lf', 'load factor', (count() / m).toFixed(2) + '  (' + count() + '/' + m + ')');
    }
    const tick = () => { steps++; stats(); };

    function makeItem(key) {
      const b = ctx.block(key, { w: 1.05, h: IH, d: 1.0, r: 0.12, color: PAL.ink, labelSize: 0.3 });
      b.userData.key = key;
      ctx.root.add(b);
      return b;
    }
    async function through(key) {
      const tok = makeItem(key);
      tok.position.set(-0.1, 6.6, 0);
      await ctx.moveTo(tok, { x: 0, y: 4.3 }, 420);
      const hv = toyHash(key), idx = hv % m;
      tick();
      ctx.tween(machine.rotation, { z: machine.rotation.z + Math.PI }, 500);
      ctx.say(`<code>hash("${key}") = ${hv}</code> → <code>${hv} % ${m} = ${idx}</code>. Bucket <b>${idx}</b>.`, 'O(1)');
      await ctx.wait(650);
      return { tok, idx };
    }
    async function insert(key) {
      steps = 0; stats();
      const { tok, idx } = await through(key);
      const chain = buckets[idx];
      for (const it of chain) {
        tick();
        await ctx.colorTo(it.userData.mat, PAL.accent, 140);
        if (it.userData.key === key) {
          ctx.say(`"${key}" is already in bucket ${idx}. A dict would just update its value; a set ignores the duplicate.`, 'O(1)');
          await ctx.colorTo(it.userData.mat, PAL.mint, 200);
          await ctx.scaleTo(tok, 0.01, 250); ctx.root.remove(tok);
          await ctx.colorTo(it.userData.mat, PAL.ink, 300);
          return;
        }
        await ctx.colorTo(it.userData.mat, PAL.ink, 120);
      }
      const collided = chain.length > 0;
      await ctx.moveTo(tok, { x: bx(idx), y: iy(chain.length) + 1.2 }, 420);
      await ctx.moveTo(tok, { y: iy(chain.length) }, 300, D3.ease.back);
      chain.push(tok);
      stats();
      ctx.say(collided ? `<b>Collision!</b> Bucket ${idx} already holds ${chain.length - 1} key${chain.length > 2 ? 's' : ''}. With chaining the key joins that bucket's list, so lookups here check ${chain.length} items. Good hash functions keep chains short, which keeps the average at O(1).`
        : `Stored "${key}" in bucket ${idx}. Finding it later repeats the same math: no searching.`, 'O(1)');
      if (count() / m > 0.75) { await ctx.wait(900); await resize(); }
    }
    async function lookup(key, del) {
      steps = 0; stats();
      const { tok, idx } = await through(key);
      await ctx.moveTo(tok, { x: bx(idx) + 0.0, y: iy(buckets[idx].length) + 1.0 }, 400);
      const chain = buckets[idx];
      for (let k = 0; k < chain.length; k++) {
        const it = chain[k];
        tick();
        await ctx.colorTo(it.userData.mat, PAL.accent, 160);
        if (it.userData.key === key) {
          await ctx.colorTo(it.userData.mat, del ? PAL.coral : PAL.mint, 200);
          ctx.root.remove(tok);
          if (del) {
            await ctx.moveTo(it, { y: it.position.y + 2, x: it.position.x + 1.2 }, 350);
            ctx.root.remove(it);
            chain.splice(k, 1);
            await Promise.all(chain.map((c, j) => ctx.moveTo(c, { y: iy(j) }, 300)));
            ctx.say(`Deleted "${key}" from bucket ${idx} after checking ${steps - 1} item${steps > 2 ? 's' : ''}.`, 'O(1)');
          } else {
            ctx.say(`<code>"${key}" in table</code> → <b>True</b>. We went straight to bucket ${idx} and checked ${steps - 1} item${steps > 2 ? 's' : ''}, not the whole table.`, 'O(1)');
            await ctx.wait(500);
            await ctx.colorTo(it.userData.mat, PAL.ink, 300);
          }
          stats();
          return;
        }
        await ctx.colorTo(it.userData.mat, PAL.ink, 120);
      }
      await ctx.colorTo(tok.userData.mat, PAL.coral, 200);
      ctx.say(`<code>"${key}" in table</code> → <b>False</b>. Bucket ${idx} doesn't have it, so it isn't anywhere.`, 'O(1)');
      await ctx.wait(600);
      await ctx.scaleTo(tok, 0.01, 250);
      ctx.root.remove(tok);
    }
    async function resize() {
      if (m >= 16) { ctx.say('Load factor is high, but this demo stops at 16 buckets.'); return; }
      const items = buckets.flat();
      ctx.say(`Load factor passed <b>0.75</b>, so chains would start getting long. The table <b>doubles to ${m * 2} buckets</b> and re-hashes every key, since <code>% ${m * 2}</code> gives new positions. Rare, so inserts stay O(1) on average.`, 'O(n)');
      await Promise.all(items.map((it) => ctx.moveTo(it, { y: it.position.y + 2.2 }, 450)));
      m *= 2;
      makePads(m);
      buckets = Array.from({ length: m }, () => []);
      ctx.lookAt([0, 1.2, 0], [0, 9, 19], 800);
      for (const it of items) {
        const idx = toyHash(it.userData.key) % m;
        tick();
        await ctx.moveTo(it, { x: bx(idx), y: iy(buckets[idx].length) }, 300);
        buckets[idx].push(it);
      }
      stats();
    }
    function reset(keys) {
      for (const it of buckets.flat()) ctx.root.remove(it);
      m = 8; makePads(m);
      buckets = Array.from({ length: m }, () => []);
      for (const k of keys) {
        const idx = toyHash(k) % m;
        const it = makeItem(k);
        it.position.set(bx(idx), iy(buckets[idx].length), 0);
        buckets[idx].push(it);
      }
      steps = 0; stats(); ctx.kick();
      ctx.lookAt([0, 1.3, 0], [0, 6.4, 12.5], 600);
    }

    const kIn = ctx.input('owl', { label: 'key', width: '110px' });
    const key = () => (kIn.value.trim() || 'owl').slice(0, 6);
    ctx.group(DSA.h('label', null, 'key', kIn));
    ctx.group(
      ctx.button('Insert', () => insert(key()), { primary: true }),
      ctx.button('Lookup', () => lookup(key(), false)),
      ctx.button('Delete', () => lookup(key(), true)));
    ctx.group(
      ctx.button('Insert 4 random', async () => { const pool = ['ant', 'bee', 'cat', 'dog', 'elk', 'fox', 'gnu', 'hen', 'jay', 'koi', 'lynx', 'mole', 'newt', 'orca', 'pig', 'ram', 'yak', 'emu']; for (let i = 0; i < 4; i++) { if (!ctx.alive) return; await insert(pool[Math.floor(Math.random() * pool.length)]); } }),
      ctx.button('Reset', async () => reset(['cat', 'dog', 'fox']), { icon: 'reset' }),
      ctx.speedControl());
    ctx.legend([[PAL.ink, 'stored key'], [PAL.accent, 'being compared'], [PAL.mint, 'found'], [PAL.coral, 'missing / deleted']]);
    reset(['cat', 'dog', 'fox']);
    ctx.say('Type a key and press <b>Insert</b>. Watch the hash decide the bucket, then try <b>Insert 4 random</b> to cause collisions and a resize.');
    return ctx;
  };
})();
