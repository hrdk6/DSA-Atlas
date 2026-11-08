/* 3D: stack (LIFO tower of plates) next to a queue (FIFO conveyor).
   The queue can be backed by list.pop(0) (shifts everything: O(n))
   or collections.deque (O(1) at both ends). */
(function () {
  'use strict';
  const DSA = window.DSA;
  DSA.scenes3d.stackqueue = function (container, o) {
    const D3 = DSA.d3;
    const ctx = D3.stage(container, Object.assign({ title: 'Stack (last in, first out) vs queue (first in, first out)', camera: [0.8, 6.2, 12.8], target: [0.8, 1.4, 0], height: 450 }, o));
    if (ctx.fallback) return ctx;
    const { THREE, PAL } = ctx;
    const SX = -3.6, QX0 = 0.6, QSP = 1.3, PH = 0.42;
    const stack = [], queue = [];
    let counter = 1, steps = 0, mode = 'deque';

    const sBase = ctx.block(null, { w: 2.3, h: 0.12, d: 2.3, r: 0.1, color: PAL.ghost, opacity: 0.4 });
    sBase.position.set(SX, 0.06, 0);
    const qBase = ctx.block(null, { w: QSP * 7 + 0.4, h: 0.12, d: 1.6, r: 0.1, color: PAL.ghost, opacity: 0.4 });
    qBase.position.set(QX0 + QSP * 3, 0.06, 0);
    ctx.root.add(sBase, qBase);
    const sTitle = ctx.label('STACK · LIFO', { size: 0.34, color: PAL.label, weight: 700 });
    sTitle.position.set(SX, 0.15, 1.75);
    const qTitle = ctx.label('QUEUE · FIFO', { size: 0.34, color: PAL.label, weight: 700 });
    qTitle.position.set(QX0 + QSP * 3, 0.15, 1.6);
    const frontL = ctx.label('front', { size: 0.28, color: '#ffffff', bg: PAL.mint });
    const backL = ctx.label('back', { size: 0.28, color: '#ffffff', bg: PAL.violet });
    const topL = ctx.label('top', { size: 0.3, color: '#1b1102', bg: PAL.accent });
    ctx.root.add(sTitle, qTitle, frontL, backL, topL);

    const plateY = (i) => 0.12 + PH / 2 + i * (PH + 0.04);
    const qx = (i) => QX0 + i * QSP;
    function marks() {
      topL.visible = stack.length > 0;
      if (stack.length) topL.position.set(SX + 1.65, plateY(stack.length - 1), 0);
      frontL.visible = backL.visible = queue.length > 0;
      if (queue.length) {
        frontL.position.set(queue[0].position.x, 1.45, 0);
        backL.position.set(queue[queue.length - 1].position.x, queue.length > 1 ? 1.45 : 1.95, 0);
      }
      ctx.stat('s', 'stack size', stack.length);
      ctx.stat('q', 'queue size', queue.length);
      ctx.kick();
    }
    const tick = () => { steps++; ctx.stat('steps', 'steps', steps); };

    async function push(v) {
      if (stack.length >= 9) { ctx.say('The tower is tall enough. Pop something first.'); return; }
      steps = 0;
      const p = ctx.block(v, { w: 1.8, h: PH, d: 1.8, r: 0.12, color: PAL.ink, labelSize: 0.36 });
      p.position.set(SX, plateY(stack.length) + 3, 0);
      ctx.root.add(p);
      stack.push(p);
      tick();
      ctx.say(`<code>stack.append(${v})</code>: the new plate goes on top.`, 'O(1)');
      await ctx.moveTo(p, { y: plateY(stack.length - 1) }, 450, D3.ease.back);
      marks();
    }
    async function pop() {
      steps = 0;
      if (!stack.length) { ctx.say('<code>stack.pop()</code> on an empty list raises <b>IndexError</b>. Always check <code>if stack:</code> first.'); return; }
      const p = stack.pop();
      tick();
      await ctx.colorTo(p.userData.mat, PAL.accent, 160);
      ctx.say(`<code>stack.pop()</code> returns <b>${p.userData.value}</b>, the most recently added item. Last in, first out.`, 'O(1)');
      await ctx.moveTo(p, { y: p.position.y + 2.5, x: SX - 1.5 }, 450);
      await ctx.scaleTo(p, 0.01, 200);
      ctx.root.remove(p);
      marks();
    }
    async function peek() {
      if (!stack.length) { ctx.say('Nothing to peek at: the stack is empty.'); return; }
      const p = stack[stack.length - 1];
      ctx.say(`<code>stack[-1]</code> is <b>${p.userData.value}</b>. Peeking reads the top without removing it.`, 'O(1)');
      await ctx.colorTo(p.userData.mat, PAL.mint, 200);
      await ctx.wait(500);
      await ctx.colorTo(p.userData.mat, PAL.ink, 300);
    }
    async function enqueue(v) {
      if (queue.length >= 7) { ctx.say('The conveyor is full for this demo. Dequeue first.'); return; }
      steps = 0;
      const b = ctx.block(v, { color: PAL.violet, labelSize: 0.4 });
      b.position.set(qx(7) + 1.5, 0.62, 0);
      ctx.root.add(b);
      queue.push(b);
      tick();
      ctx.say(`<code>q.append(${v})</code>: join at the back of the line.`, 'O(1)');
      await ctx.moveTo(b, { x: qx(queue.length - 1) }, 520, D3.ease.out);
      marks();
    }
    async function dequeue() {
      steps = 0;
      if (!queue.length) { ctx.say('The queue is empty: there is nobody to serve.'); return; }
      const b = queue.shift();
      tick();
      await ctx.colorTo(b.userData.mat, PAL.mint, 160);
      const fn = mode === 'deque' ? 'q.popleft()' : 'q.pop(0)';
      ctx.say(`<code>${fn}</code> returns <b>${b.userData.value}</b>, the item that waited longest. First in, first out.`, mode === 'deque' ? 'O(1)' : 'O(n)');
      await ctx.moveTo(b, { x: QX0 - 2.2, y: 1.4 }, 450);
      await ctx.scaleTo(b, 0.01, 200);
      ctx.root.remove(b);
      if (mode === 'list') {
        for (let i = 0; i < queue.length; i++) {
          await ctx.colorTo(queue[i].userData.mat, PAL.accent, 90);
          await ctx.moveTo(queue[i], { x: qx(i) }, 230);
          ctx.colorTo(queue[i].userData.mat, PAL.violet, 150);
          tick();
        }
        ctx.say(`With a plain list, <code>pop(0)</code> shifts every remaining item left: ${steps} steps. On a million-item queue that is a million moves per dequeue.`, 'O(n)');
      } else {
        await Promise.all(queue.map((x, i) => ctx.moveTo(x, { x: qx(i) }, 380)));
        ctx.say('<code>deque</code> just advances its front pointer. Nothing is copied (the boxes slide only to keep the picture tidy).', 'O(1)');
      }
      marks();
    }

    const vIn = ctx.input(counter, { type: 'number', label: 'value' });
    const nextVal = () => { const v = parseInt(vIn.value, 10); const r = Number.isFinite(v) ? v : counter; counter = r + 1; vIn.value = counter; return r; };
    const modeSel = ctx.select([['deque', 'queue = collections.deque()'], ['list', 'queue = []  (plain list)']], { label: 'queue implementation' });
    modeSel.addEventListener('change', () => { mode = modeSel.value; ctx.say(mode === 'deque' ? 'Using <code>deque</code>: O(1) at both ends.' : 'Using a plain list: <code>pop(0)</code> must shift everything. Try a dequeue.'); });
    ctx.group(DSA.h('label', null, 'value', vIn));
    ctx.group(ctx.button('Push', () => push(nextVal()), { primary: true }), ctx.button('Pop', pop), ctx.button('Peek', peek));
    ctx.group(ctx.button('Enqueue', () => enqueue(nextVal()), { primary: true }), ctx.button('Dequeue', dequeue), modeSel);
    ctx.group(ctx.speedControl());
    ctx.legend([[PAL.ink, 'stack item'], [PAL.violet, 'queue item'], [PAL.accent, 'moving'], [PAL.mint, 'leaving']]);

    /* starting state */
    [1, 2, 3].forEach((v, i) => { const p = ctx.block(v, { w: 1.8, h: PH, d: 1.8, r: 0.12, color: PAL.ink, labelSize: 0.36 }); p.position.set(SX, plateY(i), 0); ctx.root.add(p); stack.push(p); });
    [4, 5, 6].forEach((v, i) => { const b = ctx.block(v, { color: PAL.violet, labelSize: 0.4 }); b.position.set(qx(i), 0.62, 0); ctx.root.add(b); queue.push(b); });
    counter = 7; vIn.value = 7;
    marks();
    ctx.say('A stack is a pile of plates: you only touch the top. A queue is a line at a shop: join at the back, leave from the front.');
    return ctx;
  };
})();
