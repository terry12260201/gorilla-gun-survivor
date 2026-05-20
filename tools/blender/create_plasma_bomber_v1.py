import math
import os

import bpy
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_GLB = os.path.join(ROOT, "public", "assets", "custom", "plasma_bomber_v1.glb")
OUT_BLEND = os.path.join(ROOT, "art", "blockouts", "plasma_bomber_v1.blend")
OUT_PREVIEW = os.path.join(ROOT, "art", "previews", "plasma_bomber_v1.png")

os.makedirs(os.path.dirname(OUT_GLB), exist_ok=True)
os.makedirs(os.path.dirname(OUT_BLEND), exist_ok=True)
os.makedirs(os.path.dirname(OUT_PREVIEW), exist_ok=True)

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete()


def mat(name, base, roughness=0.7, metallic=0.0, emission=None, strength=0.0):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = base
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
        if emission:
            bsdf.inputs["Emission Color"].default_value = emission
            bsdf.inputs["Emission Strength"].default_value = strength
    return material


mat_shell = mat("mat_charcoal_shell", (0.035, 0.035, 0.045, 1), 0.62, 0.45)
mat_edge = mat("mat_worn_edge", (0.18, 0.17, 0.18, 1), 0.58, 0.55)
mat_core = mat("mat_plasma_core", (1.0, 0.32, 0.02, 1), 0.25, 0.0, (1.0, 0.22, 0.02, 1), 4.0)
mat_hot = mat("mat_warning_nodes", (1.0, 0.08, 0.02, 1), 0.3, 0.0, (1.0, 0.08, 0.02, 1), 5.0)
mat_flame = mat("mat_fuse_flame", (1.0, 0.72, 0.04, 1), 0.18, 0.0, (1.0, 0.45, 0.02, 1), 7.0)
mat_scorch = mat("mat_scorch", (0.015, 0.012, 0.01, 1), 0.9, 0.0)


def ico(name, loc, radius, material, scale=(1, 1, 1), subdiv=2):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=subdiv, radius=radius, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    obj.data.materials.append(material)
    obj.modifiers.new(name="weighted normals", type="WEIGHTED_NORMAL")
    return obj


def cube(name, loc, scale, material, rot=(0, 0, 0), bevel=0.015):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    obj.data.materials.append(material)
    if bevel:
        mod = obj.modifiers.new(name="small bevel", type="BEVEL")
        mod.width = bevel
        mod.segments = 1
    obj.modifiers.new(name="weighted normals", type="WEIGHTED_NORMAL")
    return obj


def cyl(name, loc, radius, depth, material, vertices=12, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=loc, rotation=rot)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(material)
    obj.modifiers.new(name="weighted normals", type="WEIGHTED_NORMAL")
    return obj


def cone(name, loc, radius1, radius2, depth, material, vertices=8, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cone_add(
        vertices=vertices,
        radius1=radius1,
        radius2=radius2,
        depth=depth,
        location=loc,
        rotation=rot,
    )
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(material)
    obj.modifiers.new(name="weighted normals", type="WEIGHTED_NORMAL")
    return obj


# Blender is Z-up. GLB export_yup converts this to the game-friendly Y-up model.
# Main low squat body.
ico("PlasmaCore", (0, 0, 0.72), 0.48, mat_core, scale=(1.08, 0.92, 0.82), subdiv=2)

# Armored shell plates wrap the core while leaving orange gaps readable from top-down.
cube("BodyShell_Top", (0, 0, 1.12), (0.54, 0.42, 0.10), mat_shell, (math.radians(4), 0, 0), 0.035)
cube("BodyShell_Front", (0, -0.48, 0.72), (0.45, 0.10, 0.28), mat_shell, (math.radians(-10), 0, 0), 0.035)
cube("BodyShell_Back", (0, 0.44, 0.72), (0.48, 0.10, 0.27), mat_shell, (math.radians(10), 0, 0), 0.035)
cube("BodyShell_Left", (-0.48, 0, 0.72), (0.10, 0.38, 0.30), mat_shell, (0, math.radians(8), 0), 0.035)
cube("BodyShell_Right", (0.48, 0, 0.72), (0.10, 0.38, 0.30), mat_shell, (0, math.radians(-8), 0), 0.035)
cube("BodyShell_Bottom", (0, 0, 0.35), (0.40, 0.34, 0.08), mat_edge, (0, 0, 0), 0.025)

# Front warning triangle, built with geometry rather than texture labels.
cube("WarningTriangle_Plate", (0, -0.575, 0.72), (0.24, 0.035, 0.19), mat_edge, (math.radians(-12), 0, 0), 0.012)
for name, x, z, rz in [
    ("WarningTriangle_Bar_Top", 0, 0.80, 0),
    ("WarningTriangle_Bar_Left", -0.07, 0.69, 58),
    ("WarningTriangle_Bar_Right", 0.07, 0.69, -58),
]:
    cube(name, (x, -0.615, z), (0.095, 0.012, 0.014), mat_hot, (0, 0, math.radians(rz)), 0.004)

# Side nodes and ring housings.
for x, side in [(-0.59, "L"), (0.59, "R")]:
    cyl(f"WarningNodeRing_{side}", (x, -0.03, 0.76), 0.13, 0.05, mat_edge, vertices=16, rot=(0, math.radians(90), 0))
    cyl(f"WarningNode_{side}", (x * 1.01, -0.03, 0.76), 0.09, 0.06, mat_hot, vertices=16, rot=(0, math.radians(90), 0))

# Four short legs with glowing knee/foot markers.
for name, x, y, yaw in [
    ("Leg_FL", -0.36, -0.38, -35),
    ("Leg_FR", 0.36, -0.38, 35),
    ("Leg_BL", -0.36, 0.36, 35),
    ("Leg_BR", 0.36, 0.36, -35),
]:
    cube(f"{name}_Upper", (x, y, 0.28), (0.08, 0.10, 0.22), mat_shell, (math.radians(10), 0, math.radians(yaw)), 0.018)
    cone(
        f"{name}_Foot",
        (x * 1.18, y * 1.18, 0.12),
        0.08,
        0.035,
        0.30,
        mat_edge,
        vertices=6,
        rot=(0, math.radians(68), math.radians(yaw)),
    )
    cube(f"{name}_Glow", (x * 1.08, y * 1.08, 0.30), (0.035, 0.025, 0.025), mat_hot, (0, 0, math.radians(yaw)), 0.004)

# Curved segmented fuse tail rising from the rear.
tail = [
    (0.00, 0.33, 1.08, 18),
    (0.00, 0.40, 1.23, 28),
    (0.00, 0.43, 1.38, 38),
    (0.00, 0.41, 1.53, 50),
    (0.00, 0.34, 1.66, 62),
]
for i, (x, y, z, rx) in enumerate(tail):
    cyl(
        f"FuseTail_Segment_{i + 1}",
        (x, y, z),
        0.083 - i * 0.004,
        0.16,
        mat_shell if i % 2 == 0 else mat_edge,
        vertices=10,
        rot=(math.radians(rx), 0, 0),
    )
    cube(f"FuseTail_Glow_{i + 1}", (x, y - 0.035, z), (0.04, 0.012, 0.018), mat_hot, (math.radians(rx), 0, 0), 0.003)

cone("FuseFlame_Core", (0, 0.29, 1.82), 0.12, 0.01, 0.22, mat_flame, vertices=8, rot=(math.radians(14), 0, 0))
for i, (x, y) in enumerate([(-0.04, 0.27), (0.05, 0.30), (0, 0.24)]):
    cone(
        f"FuseFlame_Shard_{i + 1}",
        (x, y, 1.78 + 0.03 * i),
        0.045,
        0.0,
        0.14,
        mat_flame,
        vertices=5,
        rot=(math.radians(20 + 8 * i), math.radians(10 * (i - 1)), 0),
    )

# Scorch marks on shell plates.
for i, (x, y, z, sx, sz, rz) in enumerate([
    (-0.24, -0.16, 1.20, 0.10, 0.035, 18),
    (0.24, 0.16, 1.18, 0.09, 0.03, -18),
    (0.0, -0.56, 0.58, 0.08, 0.025, 0),
]):
    cube(f"ScorchMark_{i + 1}", (x, y, z), (sx, 0.006, sz), mat_scorch, (0, 0, math.radians(rz)), 0)

bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, -0.62, 0.72))
bpy.context.object.name = "explosion_warning_origin"

# Preview lighting and camera.
bpy.ops.object.light_add(type="AREA", location=(-2.2, -3.0, 3.5))
key = bpy.context.object
key.name = "Preview_Key_Light"
key.data.energy = 620
key.data.size = 4.0

bpy.ops.object.light_add(type="POINT", location=(0.8, -1.4, 1.1))
glow = bpy.context.object
glow.name = "Core_Glow_Helper"
glow.data.energy = 110
glow.data.color = (1.0, 0.35, 0.04)

bpy.ops.object.camera_add(location=(2.7, -4.8, 2.55))
camera = bpy.context.object
camera.name = "Preview_Camera"
direction = Vector((0, 0, 0.82)) - camera.location
camera.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
camera.data.lens = 48
bpy.context.scene.camera = camera

for obj in bpy.context.scene.objects:
    obj.select_set(obj.type in {"MESH", "EMPTY"})

bpy.ops.wm.save_as_mainfile(filepath=OUT_BLEND)
bpy.ops.export_scene.gltf(filepath=OUT_GLB, export_format="GLB", export_yup=True)

bpy.context.scene.render.resolution_x = 1200
bpy.context.scene.render.resolution_y = 800
if hasattr(bpy.context.scene, "eevee"):
    bpy.context.scene.eevee.taa_render_samples = 48
bpy.context.scene.render.filepath = OUT_PREVIEW
bpy.ops.render.render(write_still=True)

print(f"Exported {OUT_GLB}")
print(f"Saved {OUT_BLEND}")
print(f"Rendered {OUT_PREVIEW}")
