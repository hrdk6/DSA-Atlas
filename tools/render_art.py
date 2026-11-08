"""Render the DSA Atlas card art with Blender (headless).

    "C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe" -b --factory-startup -P tools/render_art.py

Builds one small 3D scene per chapter (and one per study plan) out of the same
glossy primitives the in-browser 3D figures use, and renders transparent PNGs
into assets/art/. Starts from an empty factory scene, so no user files are touched.
"""
import math
import os
import sys

import bpy
from mathutils import Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'art')
os.makedirs(OUT, exist_ok=True)
ONLY = set(sys.argv[sys.argv.index('--') + 1:]) if '--' in sys.argv else set()

PAL = {
    'ink': '#4d8dff', 'deep': '#2d5fd0', 'accent': '#ffad3b', 'mint': '#29c993', 'violet': '#9677ff',
    'coral': '#ff5d6c', 'cyan': '#2fc2dc', 'white': '#e9f0ff', 'slate': '#7f8fb0', 'dark': '#22314f',
    'gold': '#ffb84d', 'pale': '#a8caff',
}

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
for engine in ('BLENDER_EEVEE', 'BLENDER_EEVEE_NEXT', 'CYCLES'):
    try:
        scene.render.engine = engine
        break
    except TypeError:
        continue
print('engine:', scene.render.engine)
if scene.render.engine == 'CYCLES':
    scene.cycles.samples = 48
    scene.cycles.use_denoising = True
else:
    try:
        scene.eevee.taa_render_samples = 48
    except AttributeError:
        pass
    for attr in ('use_raytracing', 'use_gtao', 'use_shadows'):
        if hasattr(scene.eevee, attr):
            setattr(scene.eevee, attr, True)
try:
    scene.view_settings.view_transform = 'Standard'
except TypeError:
    pass
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'

world = bpy.data.worlds.new('World')
scene.world = world
world.use_nodes = True
bg = next(n for n in world.node_tree.nodes if n.type == 'BACKGROUND')
bg.inputs[0].default_value = (0.20, 0.23, 0.32, 1)
bg.inputs[1].default_value = 0.9


def lin(hexstr):
    h = hexstr.lstrip('#')
    out = []
    for i in (0, 2, 4):
        c = int(h[i:i + 2], 16) / 255
        out.append(((c + 0.055) / 1.055) ** 2.4 if c > 0.04045 else c / 12.92)
    return (*out, 1.0)


_mats = {}


def M(name, rough=0.32, metal=0.0, coat=0.5):
    key = (name, rough, metal, coat)
    if key in _mats:
        return _mats[key]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    p.inputs['Base Color'].default_value = lin(PAL.get(name, name))
    p.inputs['Roughness'].default_value = rough
    p.inputs['Metallic'].default_value = metal
    for nm, v in (('Coat Weight', coat), ('Coat Roughness', 0.12)):
        if nm in p.inputs:
            p.inputs[nm].default_value = v
    _mats[key] = m
    return m


def finish(o, col, bev=0.0, seg=4, **mk):
    if bev:
        b = o.modifiers.new('bevel', 'BEVEL')
        b.width = bev
        b.segments = seg
        try:
            b.harden_normals = True
        except AttributeError:
            pass
    try:
        o.data.shade_smooth()
    except AttributeError:
        for poly in o.data.polygons:
            poly.use_smooth = True
    o.data.materials.append(M(col, **mk))
    return o


def cube(x, y, z, sx=1, sy=1, sz=1, col='ink', bev=0.12, **mk):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, z))
    o = bpy.context.active_object
    o.scale = (sx, sy, sz)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return finish(o, col, min(bev, sx / 2.2, sy / 2.2, sz / 2.2), **mk)


def sphere(x, y, z, r=0.5, col='ink', **mk):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=r, location=(x, y, z))
    return finish(bpy.context.active_object, col, **mk)


def cyl(x, y, z, r=0.5, depth=0.3, col='ink', bev=0.05, rot=(0, 0, 0), verts=64, **mk):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth, location=(x, y, z), rotation=rot)
    return finish(bpy.context.active_object, col, min(bev, depth / 2.2), **mk)


def cone(x, y, z, r=0.3, depth=0.6, col='accent', rot=(math.pi, 0, 0), **mk):
    bpy.ops.mesh.primitive_cone_add(vertices=48, radius1=r, depth=depth, location=(x, y, z), rotation=rot)
    return finish(bpy.context.active_object, col, **mk)


def torus(x, y, z, R=0.8, r=0.12, col='mint', rot=(0, 0, 0), seg=64, **mk):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, major_segments=seg, minor_segments=24, location=(x, y, z), rotation=rot)
    return finish(bpy.context.active_object, col, **mk)


def rod(a, b, r=0.07, col='slate', **mk):
    a, b = Vector(a), Vector(b)
    d = b - a
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=r, depth=d.length, location=(a + b) / 2)
    o = bpy.context.active_object
    o.rotation_mode = 'QUATERNION'
    o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d.normalized())
    return finish(o, col, **mk)


def arrow(a, b, r=0.06, col='slate', head=0.32):
    a, b = Vector(a), Vector(b)
    d = (b - a).normalized()
    tip_base = b - d * head
    rod(a, tip_base, r, col)
    bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=r * 3, depth=head, location=b - d * head / 2)
    o = bpy.context.active_object
    o.rotation_mode = 'QUATERNION'
    o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d)
    finish(o, col)


def text(body, x=0, y=0, z=0, size=2.0, col='white', extrude=0.22):
    cu = bpy.data.curves.new('txt', 'FONT')
    cu.body = body
    cu.align_x = 'CENTER'
    cu.align_y = 'CENTER'
    cu.size = size
    cu.extrude = extrude
    cu.bevel_depth = 0.035
    cu.bevel_resolution = 4
    for path in ('C:/Windows/Fonts/ariblk.ttf', 'C:/Windows/Fonts/arialbd.ttf'):
        if os.path.exists(path):
            cu.font = bpy.data.fonts.load(path, check_existing=True)
            break
    o = bpy.data.objects.new('txt', cu)
    scene.collection.objects.link(o)
    o.location = (x, y, z)
    o.rotation_euler = (math.pi / 2, 0, 0)
    o.data.materials.append(M(col, rough=0.25, coat=0.8))
    return o


# --------------------------------------------------------------- lights, camera
def add_light(name, loc, energy, size, color=(1, 1, 1)):
    ld = bpy.data.lights.new(name, 'AREA')
    ld.energy = energy
    ld.size = size
    ld.color = color
    lo = bpy.data.objects.new(name, ld)
    scene.collection.objects.link(lo)
    lo.location = loc
    lo.rotation_euler = (-Vector(loc)).to_track_quat('-Z', 'Y').to_euler()


add_light('key', (6, -7, 9), 1500, 6)
add_light('fill', (-8, -4, 4), 500, 8, (0.85, 0.9, 1.0))
add_light('rim', (-2, 9, 7), 1100, 6, (0.75, 0.85, 1.0))
cam_data = bpy.data.cameras.new('cam')
cam_data.type = 'ORTHO'
cam_data.clip_end = 500
cam = bpy.data.objects.new('cam', cam_data)
scene.collection.objects.link(cam)
scene.camera = cam


def frame(direction=(1.0, -1.25, 0.95), margin=1.18):
    d = Vector(direction).normalized()
    q = (-d).to_track_quat('-Z', 'Y')
    right, up = q @ Vector((1, 0, 0)), q @ Vector((0, 1, 0))
    pts = []
    dg = bpy.context.evaluated_depsgraph_get()
    for o in scene.objects:
        if o.type not in ('MESH', 'FONT'):
            continue
        oe = o.evaluated_get(dg)
        pts += [oe.matrix_world @ Vector(c) for c in oe.bound_box]
    us, vs, ws = [p.dot(right) for p in pts], [p.dot(up) for p in pts], [p.dot(d) for p in pts]
    cu, cv = (min(us) + max(us)) / 2, (min(vs) + max(vs)) / 2
    cam.rotation_mode = 'QUATERNION'
    cam.rotation_quaternion = q
    cam.location = right * cu + up * cv + d * (max(ws) + 30)
    cam_data.ortho_scale = max(max(us) - min(us), max(vs) - min(vs)) * margin


def clear():
    for o in list(scene.objects):
        if o.type in ('MESH', 'FONT', 'CURVE', 'EMPTY'):
            bpy.data.objects.remove(o, do_unlink=True)


# --------------------------------------------------------------------- builders
def b_arrays():
    for i in range(5):
        cube((i - 2) * 1.12, 0, 0.5, col='accent' if i == 2 else 'ink')


def b_hashing():
    heights = [2, 0, 3, 1]
    cols = ['ink', 'violet', 'mint', 'cyan']
    for i, hgt in enumerate(heights):
        x = (i - 1.5) * 1.25
        cube(x, 0, 0.06, 1.05, 1.05, 0.12, col='slate', bev=0.04)
        for k in range(hgt):
            cube(x, 0, 0.42 + k * 0.62, 0.86, 0.86, 0.56, col=cols[(i + k) % 4], bev=0.1)


def b_linkedlist():
    xs = [-2.4, 0, 2.4]
    for i, x in enumerate(xs):
        sphere(x, 0, 0.6, 0.6, col='mint' if i == 0 else 'ink')
    for a, b in zip(xs, xs[1:]):
        arrow((a + 0.62, 0, 0.6), (b - 0.66, 0, 0.6), col='white')


def b_stackqueue():
    for i in range(4):
        cyl(0, 0, 0.16 + i * 0.36, 1.25, 0.3, col='accent' if i == 3 else ('ink' if i % 2 == 0 else 'deep'), bev=0.08)


def b_trees():
    pts = {0: (0, 0, 2.5), 1: (-1.7, 0, 1.25), 2: (1.7, 0, 1.25), 3: (-2.55, 0, 0), 4: (-0.85, 0, 0), 5: (0.85, 0, 0), 6: (2.55, 0, 0)}
    for c, p in ((1, 0), (2, 0), (3, 1), (4, 1), (5, 2), (6, 2)):
        rod(pts[p], pts[c], 0.075, 'slate')
    for k, p in pts.items():
        sphere(*p, r=0.5, col='accent' if k == 0 else ('mint' if k in (4, 6) else 'ink'))


def b_heaps():
    r = 0.5
    for i in range(3):
        for j in range(3):
            sphere((i - 1) * 1.0, (j - 1) * 1.0, r, r, col='ink')
    for i in range(2):
        for j in range(2):
            sphere((i - 0.5) * 1.0, (j - 0.5) * 1.0, r + 0.71, r, col='violet')
    sphere(0, 0, r + 1.42, r, col='accent')


def b_graphs():
    pts = [(-2.2, -0.4, 0.6), (-0.6, 0.8, 2.0), (1.2, -0.6, 1.6), (2.4, 0.6, 0.4), (0.2, -1.2, 0.2), (-1.4, 1.0, -0.6), (1.0, 1.2, -0.4)]
    edges = [(0, 1), (1, 2), (2, 3), (0, 4), (4, 2), (1, 5), (5, 0), (3, 6), (6, 2), (4, 3)]
    for a, b in edges:
        rod(pts[a], pts[b], 0.06, 'slate')
    for i, p in enumerate(pts):
        sphere(*p, r=0.44, col='mint' if i == 0 else ('accent' if i == 3 else 'ink'))


def b_tries():
    root = (0, 0, 2.6)
    kids = [(-1.8, 0, 1.4), (0, 0, 1.4), (1.8, 0, 1.4)]
    grand = [(-2.4, 0, 0.2), (-1.2, 0, 0.2), (1.8, 0, 0.2)]
    for k in kids:
        rod(root, k, 0.06)
    for g, k in zip(grand, (kids[0], kids[0], kids[2])):
        rod(k, g, 0.06)
    sphere(*root, r=0.48, col='accent')
    for k in kids:
        cube(*k, 0.72, 0.72, 0.72, col='ink', bev=0.14)
    for g in grand:
        cube(*g, 0.72, 0.72, 0.72, col='ink', bev=0.14)
        torus(*g, R=0.62, r=0.07, col='mint', rot=(math.pi / 2, 0, 0))
    torus(*kids[1], R=0.62, r=0.07, col='mint', rot=(math.pi / 2, 0, 0))


def b_two_pointers():
    for i in range(6):
        cube((i - 2.5) * 1.1, 0, 0.5, col='ink')
    cone(-2.75, 0, 1.75, 0.32, 0.65, col='accent')
    cone(2.75, 0, 1.75, 0.32, 0.65, col='violet')


def b_sliding_window():
    for i in range(7):
        cube((i - 3) * 1.1, 0, 0.5, col='mint' if 2 <= i <= 4 else 'ink')
    x0, x1, z0, z1, y = -1.75, 1.75, -0.12, 1.12, -0.62
    for a, b in (((x0, y, z0), (x1, y, z0)), ((x0, y, z1), (x1, y, z1)), ((x0, y, z0), (x0, y, z1)), ((x1, y, z0), (x1, y, z1))):
        rod(a, b, 0.07, 'accent')
    for a, b in (((x0, -y, z1), (x1, -y, z1)), ((x0, y, z1), (x0, -y, z1)), ((x1, y, z1), (x1, -y, z1))):
        rod(a, b, 0.07, 'accent')


def b_prefix_sum():
    cols = ['ink', 'ink', 'cyan', 'cyan', 'mint']
    for i in range(5):
        for k in range(i + 1):
            cube((i - 2) * 1.05, 0, 0.45 + k * 0.92, 0.9, 0.9, 0.86, col=cols[i], bev=0.12)


def b_binary_search():
    for i in range(7):
        col = 'accent' if i == 3 else ('slate' if i < 3 else 'ink')
        cube((i - 3) * 1.1, 0, 0.5 + (0.35 if i == 3 else 0), col=col)
    torus(0, -0.2, 2.6, R=0.75, r=0.13, col='white', rot=(math.pi / 2, 0, 0))
    rod((0.55, -0.2, 2.05), (1.25, -0.2, 1.35), 0.12, 'deep')


def b_monotonic_stack():
    hs = [4.0, 3.2, 2.4, 1.6, 0.9]
    for i, hgt in enumerate(hs):
        cube((i - 2) * 1.12, 0, hgt / 2, 0.9, 0.9, hgt, col='violet' if i < 4 else 'accent', bev=0.14)


def b_intervals():
    bars = [(-1.2, 0.0, 1.8, 'ink'), (0.6, 0.5, 2.6, 'mint'), (-0.6, 1.0, 1.6, 'accent'), (1.4, 1.5, 1.2, 'violet')]
    for x, z, length, col in bars:
        cyl(x, 0, z + 0.3, 0.3, length, col=col, bev=0.14, rot=(0, math.pi / 2, 0))


def b_backtracking():
    root, left, right, leaf = (0, 0, 2.5), (-1.5, 0, 1.2), (1.5, 0, 1.2), (-2.2, 0, 0)
    for a, b in ((root, left), (root, right), (left, leaf)):
        rod(a, b, 0.07)
    sphere(*root, r=0.48, col='accent')
    sphere(*left, r=0.45, col='ink')
    sphere(*leaf, r=0.45, col='mint')
    for ang in (math.pi / 4, -math.pi / 4):
        o = cube(right[0], 0, right[2], 1.2, 0.3, 0.3, col='coral', bev=0.12)
        o.rotation_euler = (0, ang, 0)


def b_dp():
    for i in range(4):
        for j in range(4):
            hgt = 0.25 + 0.38 * (i + j)
            col = 'accent' if (i, j) == (3, 3) else ('mint' if i + j >= 4 else ('cyan' if i + j >= 2 else 'ink'))
            cube(i * 1.02, j * 1.02, hgt / 2, 0.9, 0.9, hgt, col=col, bev=0.1)


def b_greedy():
    for (x, y, n) in ((-1.0, 0.3, 5), (0.6, -0.3, 3), (1.9, 0.5, 1)):
        for k in range(n):
            cyl(x + 0.04 * ((k % 2) * 2 - 1), y, 0.13 + k * 0.27, 0.62, 0.24, col='gold', bev=0.05, rough=0.22, metal=0.55)


def b_bits():
    pattern = [1, 0, 1, 1, 0, 1, 0, 0]
    for i, bit in enumerate(pattern):
        hgt = 0.75 if bit else 0.18
        cube((i - 3.5) * 0.82, 0, hgt / 2, 0.7, 0.7, hgt, col='ink' if bit else 'slate', bev=0.08)


def b_sorting():
    for i in range(7):
        hgt = 0.6 + i * 0.42
        cube((i - 3) * 0.86, 0, hgt / 2, 0.68, 0.68, hgt, col='accent' if i == 6 else ('cyan' if i >= 4 else 'ink'), bev=0.1)


def b_cheatsheet():
    card = cube(0, 0, 0.08, 3.0, 3.8, 0.16, col='white', bev=0.08)
    rows = [(1.2, 2.2, 'ink'), (0.6, 1.6, 'slate'), (0.0, 2.0, 'slate'), (-0.6, 1.2, 'mint'), (-1.2, 1.8, 'slate')]
    for y, w, col in rows:
        cube(-1.15 + w / 2, y, 0.2, w, 0.22, 0.08, col=col, bev=0.04)
    cube(1.25, 1.95, 0.24, 0.5, 0.5, 0.12, col='accent', bev=0.06)
    _ = card


def b_bigo():
    for i, (hgt, col) in enumerate(((0.5, 'mint'), (1.0, 'cyan'), (2.0, 'ink'), (3.8, 'coral'))):
        cube((i - 1.5) * 1.15, 0, hgt / 2, 0.92, 0.92, hgt, col=col, bev=0.14)


def b_python():
    cube(0, 0, 0.12, 4.2, 3.0, 0.24, col='dark', bev=0.1)
    lines = [(1.0, 0.0, 2.6, 'violet'), (0.45, 0.4, 1.6, 'mint'), (-0.1, 0.4, 2.2, 'accent'), (-0.65, 0.0, 1.2, 'ink')]
    for y, indent, w, col in lines:
        cube(-1.7 + indent + w / 2, y, 0.3, w, 0.26, 0.12, col=col, bev=0.05)
    for i, col in enumerate(('coral', 'accent', 'mint')):
        sphere(-1.7 + i * 0.35, 1.25, 0.32, 0.1, col=col)


def b_recursion():
    for i, (R, col) in enumerate(((1.9, 'deep'), (1.45, 'ink'), (1.0, 'cyan'), (0.58, 'accent'))):
        torus(0, 0, 0.2 + i * 0.42, R=R, r=0.18, col=col, seg=4, rot=(0, 0, math.pi / 4))


def b_roadmap():
    for i in range(4):
        cube(i * 1.15, -i * 0.25, 0.15 + i * 0.32, 1.0, 1.0, 0.3 + i * 0.64, col='ink' if i < 3 else 'mint', bev=0.1)
    top_z = 0.15 + 3 * 0.32 + (0.3 + 3 * 0.64) / 2
    rod((3.45, -0.75, top_z), (3.45, -0.75, top_z + 1.7), 0.05, 'white')
    cube(3.85, -0.75, top_z + 1.4, 0.8, 0.06, 0.5, col='accent', bev=0.03)


def b_interview():
    a = cube(-0.6, 0, 1.6, 2.6, 0.4, 1.5, col='ink', bev=0.18)
    cone(-1.3, 0, 0.62, 0.28, 0.6, col='ink', rot=(math.pi, 0.3, 0))
    for k in range(3):
        sphere(-1.2 + k * 0.6, -0.24, 1.6, 0.14, col='white')
    cube(1.0, 0.7, 0.75, 2.0, 0.4, 1.2, col='mint', bev=0.18)
    cone(1.6, 0.7, -0.05, 0.24, 0.5, col='mint', rot=(math.pi, -0.3, 0))
    _ = a


def b_lc75():
    text('75', 0, 0, 1.2, size=2.6, col='white', extrude=0.32)
    cone(1.65, -0.3, 2.55, 0.28, 0.58, col='accent')
    sphere(-1.6, -0.2, 2.35, 0.3, col='mint')
    cube(1.7, 0.2, 0.45, 0.55, 0.55, 0.55, col='accent', bev=0.1)
    cube(-1.5, 0.3, 0.4, 0.45, 0.45, 0.45, col='ink', bev=0.1)


def b_top150():
    text('150', 0, 0, 1.25, size=2.2, col='white', extrude=0.32)
    cube(0, 0.15, -0.05, 4.4, 1.3, 0.3, col='mint', bev=0.1)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.4, location=(2.0, -0.3, 2.45))
    finish(bpy.context.active_object, 'gold', rough=0.2, metal=0.6)
    sphere(-2.0, -0.2, 2.3, 0.26, col='accent')


ICONS = {
    'roadmap': b_roadmap, 'interview': b_interview, 'bigo': b_bigo, 'python': b_python, 'recursion': b_recursion,
    'arrays': b_arrays, 'hashing': b_hashing, 'linkedlist': b_linkedlist, 'stackqueue': b_stackqueue,
    'trees': b_trees, 'heaps': b_heaps, 'graphs': b_graphs, 'tries': b_tries,
    'two-pointers': b_two_pointers, 'sliding-window': b_sliding_window, 'prefix-sum': b_prefix_sum,
    'binary-search': b_binary_search, 'monotonic-stack': b_monotonic_stack, 'intervals': b_intervals,
    'backtracking': b_backtracking, 'dp': b_dp, 'greedy': b_greedy, 'bits': b_bits, 'sorting': b_sorting,
    'cheatsheet': b_cheatsheet, 'lc75': b_lc75, 'top150': b_top150,
}
FRONTAL = {'lc75', 'top150', 'trees', 'tries', 'backtracking', 'interview'}

for name, build in ICONS.items():
    if ONLY and name not in ONLY:
        continue
    clear()
    build()
    big = name in ('lc75', 'top150')
    frame((0.55, -1.0, 0.42) if name in FRONTAL else (1.0, -1.25, 0.95), margin=1.12 if big else 1.16)
    scene.render.resolution_x = scene.render.resolution_y = 768 if big else 512
    scene.render.filepath = os.path.join(OUT, name + '.png')
    bpy.ops.render.render(write_still=True)
    print('rendered', name)
print('done')
