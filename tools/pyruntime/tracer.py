# DSA Atlas Python runner + line-by-line tracer.
# Runs inside Pyodide (browser) and inside tools/build.py (tests), so both
# use exactly the same rules. Expects PRELUDE_SRC to be defined first.
import sys, io, json, time, ast, builtins, types, math
from collections import deque as _deque

_CO_OPTIMIZED = 1
_SKIP = (types.ModuleType, type)
_PRELUDE_CODE = compile(PRELUDE_SRC, '<prelude>', 'exec')  # noqa: F821 (defined by the loader)


class _StepLimit(BaseException):
    """Raised when the tracer records too many steps (BaseException so `except Exception` can't swallow it)."""


def _short(v, n=80):
    try:
        s = repr(v)
    except Exception:
        s = '<' + type(v).__name__ + '>'
    return s if len(s) <= n else s[: n - 1] + '…'


def _approx_equal(a, b):
    if isinstance(a, bool) or isinstance(b, bool):
        return a == b
    if isinstance(a, float) or isinstance(b, float):
        try:
            return math.isclose(a, b, rel_tol=1e-5, abs_tol=1e-6)
        except TypeError:
            return False
    if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
        return len(a) == len(b) and all(_approx_equal(x, y) for x, y in zip(a, b))
    return a == b


class _Tracer:
    def __init__(self, max_steps, base_names, out, trace_module):
        self.max_steps = max_steps
        self.base = base_names
        self.out = out
        self.trace_module = trace_module
        self.steps = []
        self.ids = {}
        self.keep = []  # keep traced objects alive so id() values are never reused
        self.pending = []

    def sid(self, obj):
        k = id(obj)
        if k not in self.ids:
            self.ids[k] = len(self.ids) + 1
            self.keep.append(obj)
        return self.ids[k]

    def wanted(self, code):
        if code.co_filename != '<solution>':
            return False
        if code.co_name == '<module>':
            return self.trace_module
        return bool(code.co_flags & _CO_OPTIMIZED) and not code.co_name.startswith('<')

    def enc(self, v, depth=0):
        t = type(v)
        if v is None or t is bool or t is int or t is float or t is complex:
            r = repr(v)
            return ['n', r if len(r) <= 40 else r[:39] + '…']
        if t is str:
            return ['s', v if len(v) <= 120 else v[:119] + '…']
        if depth > 3:
            return ['o', _short(v, 30)]
        if isinstance(v, (list, tuple, _deque, set, frozenset)):
            if isinstance(v, list):
                kind = 'l'
            elif isinstance(v, tuple):
                kind = 't'
            elif isinstance(v, _deque):
                kind = 'q'
            else:
                kind = 'S'
            if kind == 'S':
                try:
                    items = sorted(v)
                except TypeError:
                    items = list(v)
            else:
                items = list(v)
            res = [kind, self.sid(v), [self.enc(x, depth + 1) for x in items[:64]]]
            if len(items) > 64:
                res.append(len(items))
            return res
        if isinstance(v, dict):
            items = list(v.items())
            return ['d', self.sid(v), [[self.enc(k, depth + 1), self.enc(x, depth + 1)] for k, x in items[:48]], len(items), t.__name__]
        if hasattr(v, '__dict__') and not isinstance(v, _SKIP) and not callable(v):
            self.pending.append(v)
            return ['r', self.sid(v)]
        return ['o', _short(v, 60)]

    def heap(self):
        h = {}
        while self.pending and len(h) < 160:
            v = self.pending.pop(0)
            k = self.sid(v)
            if k in h:
                continue
            h[k] = None
            d = vars(v)
            if 'val' in d and 'next' in d and 'left' not in d:
                rec = ['L', self.enc(d['val'], 2), self.enc(d['next'], 2)]
                if 'random' in d:
                    rec.append(self.enc(d['random'], 2))
                h[k] = rec
            elif 'val' in d and 'left' in d and 'right' in d:
                rec = ['T', self.enc(d['val'], 2), self.enc(d['left'], 2), self.enc(d['right'], 2)]
                if 'next' in d:
                    rec.append(self.enc(d['next'], 2))
                h[k] = rec
            else:
                attrs = [[a, self.enc(x, 1)] for a, x in list(d.items())[:16] if not a.startswith('__')]
                h[k] = ['O', type(v).__name__, attrs]
        self.pending = []
        return {str(k): v for k, v in h.items() if v is not None}

    def local_vars(self, fr):
        is_mod = fr.f_code.co_name == '<module>'
        out = []
        for k, v in list(fr.f_locals.items()):
            if k.startswith('__') or (is_mod and k in self.base):
                continue
            if isinstance(v, (types.ModuleType, type)) or callable(v):
                continue
            if k == 'self' and type(v).__name__ == 'Solution':
                try:
                    if not vars(v):
                        continue
                except TypeError:
                    continue
            out.append((k, v))
        return out

    def snapshot(self, frame, event, arg):
        if len(self.steps) >= self.max_steps:
            raise _StepLimit()
        frames = []
        f = frame
        while f is not None:
            if self.wanted(f.f_code):
                frames.append(f)
            f = f.f_back
        frames.reverse()
        self.pending = []
        fr_out = []
        for fr in frames:
            fr_out.append({'n': fr.f_code.co_name, 'l': fr.f_lineno, 'v': [[k, self.enc(v)] for k, v in self.local_vars(fr)]})
        st = {'e': event, 'l': frame.f_lineno, 'f': fr_out, 'o': len(self.out.getvalue())}
        if event == 'return':
            st['r'] = self.enc(arg)
        elif event == 'exception':
            et, ev = arg[0], arg[1]
            st['x'] = et.__name__ + (': ' + str(ev) if str(ev) else '')
        st['h'] = self.heap()
        self.steps.append(st)

    def dispatch(self, frame, event, arg):
        if event == 'call' and self.wanted(frame.f_code):
            self.snapshot(frame, 'call', None)
            return self.local
        return None

    def local(self, frame, event, arg):
        if event == 'line':
            self.snapshot(frame, 'line', None)
        elif event == 'return':
            self.snapshot(frame, 'return', arg)
        elif event == 'exception':
            self.snapshot(frame, 'exception', arg)
        return self.local


def _split(src, name):
    tree = ast.parse(src, name)
    last = None
    if tree.body and isinstance(tree.body[-1], ast.Expr):
        last = ast.Expression(tree.body.pop().value)
    return compile(tree, name, 'exec'), (compile(last, name, 'eval') if last is not None else None)


def api_run(code, driver='', mode='run', max_steps=1200, expect=None):
    """Run `code`, then the `driver` snippet (its last expression is the result).
    mode='trace' records every line executed in the solution. Returns JSON."""
    ns = {'__name__': '__main__', '__builtins__': builtins}
    exec(_PRELUDE_CODE, ns)
    base = set(ns)
    out = io.StringIO()
    res = {'ok': True, 'value': None, 'match': None}
    tracer = None
    old = sys.stdout
    t0 = time.perf_counter()
    has_driver = bool(driver and driver.strip())
    try:
        sys.stdout = out
        d_exec = d_eval = None
        if has_driver:
            sol = compile(code, '<solution>', 'exec')
            d_exec, d_eval = _split(driver, '<driver>')
        else:
            # no example call: behave like a REPL and show the value of a final expression
            sol, d_eval = _split(code, '<solution>')
        if mode == 'trace':
            tracer = _Tracer(int(max_steps or 1200), base, out, trace_module=not has_driver)
            sys.settrace(tracer.dispatch)
        try:
            exec(sol, ns)
            if d_exec is not None:
                exec(d_exec, ns)
            val = eval(d_eval, ns) if d_eval is not None else None
        finally:
            sys.settrace(None)
        if d_eval is not None and (has_driver or val is not None):
            shown = ns['show'](val)
            res['value'] = _short(shown, 4000)
            if expect is not None and str(expect).strip() != '':
                try:
                    res['match'] = bool(_approx_equal(shown, eval(expect, ns)))
                    res['expect'] = expect
                except Exception:
                    res['match'] = None
    except _StepLimit:
        res['ok'] = False
        res['limit'] = True
        res['error'] = 'Stopped after %d steps: the visualizer has a step limit. Try a smaller input.' % int(max_steps or 1200)
    except SyntaxError as e:
        res['ok'] = False
        res['errline'] = e.lineno if e.filename == '<solution>' else None
        res['error'] = 'SyntaxError: %s (line %s%s)' % (e.msg, e.lineno, '' if e.filename == '<solution>' else ' of the example call')
    except BaseException as e:  # report every error to the learner, including KeyboardInterrupt-style ones
        res['ok'] = False
        tb, line = e.__traceback__, None
        while tb is not None:
            if tb.tb_frame.f_code.co_filename == '<solution>':
                line = tb.tb_lineno
            tb = tb.tb_next
        res['errline'] = line
        res['error'] = '%s: %s%s' % (type(e).__name__, e, ('  (line %d)' % line) if line else '')
    finally:
        sys.settrace(None)
        sys.stdout = old
    res['stdout'] = out.getvalue()[:20000]
    res['ms'] = round((time.perf_counter() - t0) * 1000, 1)
    if tracer is not None:
        res['steps'] = tracer.steps
    return json.dumps(res)
