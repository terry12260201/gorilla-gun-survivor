import bpy
from mathutils import Vector

OUT = "public/assets/custom/shock_baton_blockout.glb"

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete()

def mat(name, color, emission=False):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = color
        bsdf.inputs["Roughness"].default_value = 0.55
        if emission:
            bsdf.inputs["Emission Color"].default_value = color
            bsdf.inputs["Emission Strength"].default_value = 1.6
    return material

iron = mat("Dark Iron", (0.08, 0.075, 0.07, 1))
purple = mat("Purple Energy", (0.45, 0.22, 1.0, 1), True)

def cube(name, loc, scale, material):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    obj.data.materials.append(material)
    return obj

def cylinder(name, loc, radius, depth, material):
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=radius, depth=depth, location=loc, rotation=(0, 1.5708, 0))
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(material)
    return obj

cube("Grip", (0, -0.16, 0), (0.08, 0.22, 0.08), iron)
cube("Body", (0.18, 0, 0), (0.26, 0.10, 0.10), iron)
cylinder("Muzzle Coil", (0.46, 0, 0), 0.075, 0.16, iron)
cylinder("Energy Core", (0.31, 0, 0), 0.045, 0.32, purple)
cube("Top Rail", (0.18, 0.095, 0), (0.24, 0.025, 0.045), iron)
cube("Side Prong L", (0.43, 0.02, 0.09), (0.11, 0.025, 0.025), purple)
cube("Side Prong R", (0.43, 0.02, -0.09), (0.11, 0.025, 0.025), purple)

bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, 0, 0))
bpy.context.object.name = "muzzle"

for obj in bpy.context.scene.objects:
    obj.select_set(True)

bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB")
