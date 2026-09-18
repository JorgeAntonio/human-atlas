# Blender agent pipeline for FORMA

## Decision

Use **Blender Agent Studio** as the primary Blender automation layer for the first
FORMA athlete prototype.

Why it fits this repository:

- Codex-native workflow.
- Can build and refine characters, rigs, animations, and scenes.
- Keeps both the `.blend` file and generated Python source.
- Includes visual review and exported-file validation.
- Good match for an iterative anatomical asset pipeline where every change must
  be reproducible.

Primary upstream:
https://github.com/ifBars/blender-agent-studio

## Secondary option

Keep **PoBruno/mcp-blender-agent** as the deterministic MCP fallback when we want
structured, typed Blender operations from Codex, OpenCode, Claude, or another MCP
client. It exposes dedicated rigging, animation, rendering, and glTF export tools.

https://github.com/PoBruno/mcp-blender-agent

For one-off Blender operations not covered by either workflow, the mature
`mcp-for-blender` project can execute Blender Python directly, but arbitrary code
execution should be treated as an escape hatch rather than the default pipeline.

https://github.com/ahujasid/mcp-for-blender

## First asset

Target file:

```text
assets/blender/forma-athlete-squat.blend
```

Web export:

```text
public/models/forma-athlete.glb
```

Required animation:

```text
squat_high_bar
```

## Non-negotiable acceptance criteria

The first exported athlete must:

1. use a real armature rather than shader deformation;
2. preserve anatomically identifiable muscle geometry;
3. keep feet planted through the full repetition;
4. flex hip, knee, and ankle through actual bones;
5. position shoulders, elbows, forearms, wrists, hands, and fingers for a high-bar
   back squat;
6. keep both hands attached to the bar throughout the animation;
7. avoid visible mesh tearing at hip, knee, shoulder, elbow, wrist, and fingers;
8. expose a named `squat_high_bar` animation clip in the GLB;
9. preserve semantic object names needed by the muscle-highlighting layer;
10. export as web-safe glTF/GLB and pass a re-import validation in Blender.

## First Codex / Blender Agent Studio brief

```text
Work on the FORMA athlete asset.

Goal:
Create a web-ready anatomical male athlete capable of a technically coherent
high-bar barbell squat.

Do not fake movement by translating mesh regions. Build and use an armature.

Start from the anatomical geometry provided for FORMA. Preserve named muscle
structures where possible. Create a humanoid rig with pelvis, spine, clavicles,
upper arms, forearms, hands, finger chains, thighs, shins, feet, and toes.

Create a barbell object and a squat_high_bar action:
- standing start/end;
- bar positioned across the upper trapezius;
- closed hand grip on both sides;
- wrists near neutral;
- elbows positioned consistently under/behind the bar;
- feet remain planted;
- hip, knee, and ankle flex during descent;
- controlled torso inclination;
- bottom position around parallel or slightly below;
- ascent returns to the exact initial pose.

Use IK/constraints where useful for hands-to-bar and feet-to-floor.

Render front, side, rear three-quarter, and close-up hand/wrist views at standing,
mid-descent, bottom, and mid-ascent. Review deformation and fix visible tearing.

Save the .blend and all Python used to build or modify it. Export GLB with the
squat_high_bar animation and verify by importing that GLB into a clean Blender
scene.
```

## Web integration rule

Until `forma-athlete.glb` exists, FORMA must display the static real anatomy only.
The movement controls remain disabled. No procedural squat deformation should be
presented as a real exercise animation.
