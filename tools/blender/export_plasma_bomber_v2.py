import math
import os

import bpy
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
IN_BLEND = os.path.join(ROOT, "art", "blockouts", "plasma_bomber_v2.blend")
OUT_GLB = os.path.join(ROOT, "public", "assets", "custom", "plasma_bomber_v2.glb")
OUT_PREVIEW = os.path.join(ROOT, "art", "previews", "plasma_bomber_v2.png")

os.makedirs(os.path.dirname(OUT_GLB), exist_ok=True)
os.makedirs(os.path.dirname(OUT_PREVIEW), exist_ok=True)

bpy.ops.wm.open_mainfile(filepath=IN_BLEND)

meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
for obj in bpy.context.scene.objects:
    obj.select_set(obj.type in {"MESH", "EMPTY"})

if not any(obj.type == "LIGHT" for obj in bpy.context.scene.objects):
    bpy.ops.object.light_add(type="AREA", location=(-2.4, -3.0, 3.4))
    light = bpy.context.object
    light.name = "Preview_Key_Light"
    light.data.energy = 620
    light.data.size = 4.0

if meshes:
    bbox_min = Vector((min((obj.matrix_world @ Vector(corner)).x for obj in meshes for corner in obj.bound_box),
                       min((obj.matrix_world @ Vector(corner)).y for obj in meshes for corner in obj.bound_box),
                       min((obj.matrix_world @ Vector(corner)).z for obj in meshes for corner in obj.bound_box)))
    bbox_max = Vector((max((obj.matrix_world @ Vector(corner)).x for obj in meshes for corner in obj.bound_box),
                       max((obj.matrix_world @ Vector(corner)).y for obj in meshes for corner in obj.bound_box),
                       max((obj.matrix_world @ Vector(corner)).z for obj in meshes for corner in obj.bound_box)))
    center = (bbox_min + bbox_max) * 0.5
else:
    center = Vector((0, 0, 0.7))

if not bpy.context.scene.camera:
    bpy.ops.object.camera_add(location=(center.x + 2.8, center.y - 4.8, center.z + 2.4))
    camera = bpy.context.object
    camera.name = "Preview_Camera"
    direction = center - camera.location
    camera.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    camera.data.lens = 48
    bpy.context.scene.camera = camera

bpy.ops.export_scene.gltf(filepath=OUT_GLB, export_format="GLB", export_yup=True)

bpy.context.scene.render.resolution_x = 1200
bpy.context.scene.render.resolution_y = 800
if hasattr(bpy.context.scene, "eevee"):
    bpy.context.scene.eevee.taa_render_samples = 48
bpy.context.scene.render.filepath = OUT_PREVIEW
bpy.ops.render.render(write_still=True)

print(f"Loaded {IN_BLEND}")
print(f"Exported {OUT_GLB}")
print(f"Rendered {OUT_PREVIEW}")
