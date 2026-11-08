"""Shared registry for problem write-ups. Each content module calls P(...)."""
import textwrap

PROBLEMS = {}


def P(id, slug, title, diff, topic, pattern, *, hook, insight, steps, code, time, space, run, expect,
      brute=None, tip=None, tests=None, why=None):
    if id in PROBLEMS:
        raise ValueError(f'duplicate problem {id}')
    if diff not in ('Easy', 'Medium', 'Hard'):
        raise ValueError(f'bad difficulty for {id}: {diff}')
    PROBLEMS[id] = {
        'id': id, 'slug': slug, 'title': title, 'diff': diff, 'topic': topic, 'pattern': pattern,
        'hook': hook.strip(), 'brute': brute.strip() if brute else None, 'insight': insight.strip(),
        'steps': [s.strip() for s in steps],
        'code': textwrap.dedent(code).strip('\n'),
        'time': time, 'space': space, 'cxWhy': why,
        'run': textwrap.dedent(run).strip(), 'expect': expect,
        'tip': tip.strip() if tip else None,
        'tests': tests or [],
    }
