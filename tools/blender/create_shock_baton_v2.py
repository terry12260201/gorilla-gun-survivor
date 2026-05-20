import math
import os

import bpy

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_GLB = os.path.join(ROOT, "public", "assets", "custom", "shock_baton_v2.glb")
OUT_BLEND = os.path.join(ROOT, "art", "blockouts", "shock_baton_v2.blend")
OUT_PREVIEW = os.path.join(ROOT, "art", "previews", "shock_baton_v2.png")

os.makedirs(os.path.dirname(OUT_GLB), exist_ok=True)
os.makedirs(os.path.dirname(OUT_BLEND), exist_ok=True)
os.makedirs(os.path.dirname(OUT_PREVIEW), exist_ok=True)

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete()


def material_principled(name, base, roughness=0.62, metallic=0.0, emission=None, strength=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = base
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
        if emission:
            bsdf.inputs["Emission Color"].default_value = emission
            bsdf.inputs["Emission Strength"].default_value = strength
    return mat


mat_dark_metal = material_principled("mat_dark_metal", (0.028, 0.03, 0.032, 1), 0.48, 0.65)
mat_worn_edge = material_principled("mat_worn_edge", (0.22, 0.22, 0.21, 1), 0.5, 0.75)
mat_grip = material_principled("mat_ribbed_grip", (0.018, 0.019, 0.018, 1), 0.9, 0.05)
mat_purple_energy = material_principled(
    "mat_purple_energy", (0.34, 0.11, 0.95, 1), 0.25, 0.0, (0.42, 0.16, 1.0, 1), 2.8
)
mat_lime_emissive = material_principled(
    "mat_lime_emissive", (0.74, 1.0, 0.13, 1), 0.22, 0.0, (0.74, 1.0, 0.13, 1), 4.4
)
mat_warning = material_principled("mat_warning_stripe", (1.0, 0.86, 0.18, 1), 0.55, 0.0)


def cyl(name, loc, radius, depth, mat, vertices=32, rot_y=math.radians(90)):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=vertices,
        radius=radius,
        depth=depth,
        location=loc,
        rotation=(0, rot_y, 0),
    )
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    return obj


def cube(name, loc, scale, mat):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    obj.data.materials.append(mat)
    bevel = obj.modifiers.new(name="soft bevel", type="BEVEL")
    bevel.width = 0.025
    bevel.segments = 2
    obj.modifiers.new(name="weighted normals", type="WEIGHTED_NORMAL")
    return obj


def sphere(name, loc, radius, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=12, radius=radius, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    return obj


# Main silhouette: short baton / pistol hybrid, readable from a top-down camera.
cyl("Baton Spine", (0, 0, 0), 0.078, 1.42, mat_dark_metal, vertices=36)
cyl("Front Coil Housing", (0.78, 0, 0), 0.115, 0.24, mat_worn_edge, vertices=40)
cyl("Rear Counterweight", (-0.74, 0, 0), 0.105, 0.20, mat_worn_edge, vertices=36)
cyl("Purple Energy Tube", (0.16, 0, 0), 0.043, 0.82, mat_purple_energy, vertices=24)

# Handle and finger guard.
cube("Angled Grip", (-0.28, -0.26, 0), (0.12, 0.34, 0.095), mat_grip)
bpy.context.object.rotation_euler[2] = math.radians(-10)
cube("Trigger Guard", (-0.05, -0.19, 0), (0.17, 0.035, 0.11), mat_worn_edge)
cube("Top Rail", (0.05, 0.105, 0), (0.58, 0.028, 0.065), mat_worn_edge)

# Repeated grip ribs and coil rings.
for index, y in enumerate([-0.39, -0.32, -0.25, -0.18, -0.11]):
    rib = cube(f"Grip Rib {index + 1}", (-0.29, y, 0), (0.15, 0.012, 0.105), mat_worn_edge)
    rib.rotation_euler[2] = math.radians(-10)

for index, x in enumerate([0.61, 0.69, 0.77, 0.85]):
    cyl(f"Front Coil Ring {index + 1}", (x, 0, 0), 0.126, 0.032, mat_dark_metal, vertices=40)

# Forked electrodes and visible energy nodes.
for z, suffix in [(0.125, "Upper"), (-0.125, "Lower")]:
    cube(f"{suffix} Electrode Prong", (0.92, 0.008, z), (0.22, 0.028, 0.026), mat_lime_emissive)
    sphere(f"{suffix} Arc Node", (1.05, 0.008, z), 0.04, mat_lime_emissive)

for x in [-0.34, -0.08, 0.18, 0.43]:
    sphere(f"Lime Charge Cell {x:.2f}", (x, 0.006, 0.087), 0.024, mat_lime_emissive)
    sphere(f"Purple Charge Cell {x:.2f}", (x, 0.006, -0.087), 0.022, mat_purple_energy)

# Warning stripes on the shell, small but readable in card previews.
for index, x in enumerate([-0.52, -0.48, 0.50, 0.54]):
    stripe = cube(f"Warning Stripe {index + 1}", (x, 0.119, 0), (0.025, 0.012, 0.082), mat_warning)
    stripe.rotation_euler[0] = math.radians(0)

# A simple muzzle marker for game code / future VFX alignment.
bpy.ops.object.empty_add(type="PLAIN_AXES", location=(1.10, 0, 0))
bpy.context.object.name = "muzzle"

# Add procedural texture nodes to the grip so the GLB contains authored material detail without bitmap dependencies.
grip_nodes = mat_grip.node_tree.nodes
grip_links = mat_grip.node_tree.links
bsdf = grip_nodes.get("Principled BSDF")
if bsdf:
    noise = grip_nodes.new(type="ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 32
    noise.inputs["Detail"].default_value = 10
    noise.inputs["Roughness"].default_value = 0.64
    bump = grip_nodes.new(type="ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.09
    bump.inputs["Distance"].default_value = 0.045
    grip_links.new(noise.outputs["Fac"], bump.inputs["Height"])
    grip_links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])

# Lights and camera for preview.
bpy.ops.object.light_add(type="AREA", location=(0.1, -2.3, 2.1))
light = bpy.context.object
light.name = "Preview Softbox"
light.data.energy = 430
light.data.size = 4.0

bpy.ops.object.camera_add(location=(0.2, -2.6, 1.35), rotation=(math.radians(62), 0, math.radians(3)))
bpy.context.scene.camera = bpy.context.object

for obj in bpy.context.scene.objects:
    obj.select_set(obj.type in {"MESH", "EMPTY"})

bpy.ops.wm.save_as_mainfile(filepath=OUT_BLEND)
bpy.ops.export_scene.gltf(filepath=OUT_GLB, export_format="GLB", export_yup=True)

bpy.context.scene.render.resolution_x = 1200
bpy.context.scene.render.resolution_y = 800
bpy.context.scene.eevee.taa_render_samples = 48
bpy.context.scene.render.filepath = OUT_PREVIEW
bpy.ops.render.render(write_still=True)

print(f"Exported {OUT_GLB}")
print(f"Saved {OUT_BLEND}")
print(f"Rendered {OUT_PREVIEW}")
