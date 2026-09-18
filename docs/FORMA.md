# FORMA — vertical slice

FORMA turns the Human Atlas renderer into an exercise-learning experience without
throwing away the atlas' anatomy, batching, picking, or mobile rendering work.

## First target: barbell squat

The first vertical slice is intentionally one exercise. It must prove the core
product interaction before more exercises are added.

### Product invariant

There is **one athlete and one timeline**.

Switching between `Movimiento`, `Músculos`, and `360°` must never swap the
person, reset the frame, or stop playback.

- **Movimiento**: same athlete, normal surface/material presentation.
- **Músculos**: same athlete, same frame, active muscles emphasized.
- **360°**: same athlete, same frame, camera interaction emphasized.

Tabs change the information layer, not the underlying motion state.

## Architecture

Human Atlas already provides:

- BodyParts3D anatomy and semantic concepts.
- efficient batched Three.js rendering.
- structure selection and highlighting.
- responsive orbit controls.
- mobile-friendly loading of geometry chunks.

FORMA adds:

1. exercise metadata and muscle-group mappings;
2. a rigged athlete asset derived from anatomy suitable for deformation;
3. a persistent motion controller;
4. exercise animations;
5. muscle highlighting tied to the same animated meshes;
6. biomechanical overlays once motion data is validated.

## Squat muscle mapping

`app/exercises.ts` contains semantic concept names rather than hard-coded atlas
part IDs. At runtime the names are resolved against `atlas.concepts`. This lets
us inspect what BodyParts3D actually contains and report unresolved structures
instead of silently highlighting an approximate mesh.

The first mapping includes:

- gluteus maximus;
- quadriceps;
- adductors;
- hamstrings;
- gastrocnemius / soleus;
- erector spinae;
- anterior core.

The exact primary/secondary/stabilizer labels are presentation metadata, not
claims of measured activation. Quantitative activation must come from validated
biomechanical or EMG data later.

## Blender pipeline

The atlas is static. We should not fake motion by moving batched anatomy chunks.

The animation pipeline is:

```text
BodyParts3D / selected FORMA anatomy
              ↓
            Blender
              ↓
        armature + skinning
              ↓
     squat animation / mocap
              ↓
     optimized animated GLB
              ↓
           Three.js
```

The first Blender deliverable is a rigged lower-body/torso athlete that can
perform a deep barbell squat without visible mesh separation or implausible
joint deformation.

## Acceptance criteria for the first interactive slice

- The same athlete remains mounted across all three modes.
- Playback continues when changing modes.
- Timeline position is preserved across modes.
- Orbiting the camera does not affect playback.
- Muscle mode highlights real named muscle geometry.
- No placeholder primitive is presented as anatomical geometry.
- If a muscle cannot be mapped, the UI reports it as unresolved.
- Mobile is the primary layout; desktop expands around the same viewer.
- A visible disclaimer distinguishes anatomical visualization from measured
  muscle activation until validated data is integrated.

## Licensing

Keep the existing Human Atlas / BodyParts3D attribution and licensing material
intact. Any derived anatomical asset produced in Blender must preserve the
required source attribution in the project documentation and distribution.
