# Battle animation increment

Named rectangle poses are stored in each actor or enemy's existing BattlePresentation graphic configuration. No new assets or animation engine are introduced.

Este documento descreve o primeiro incremento. Os controles atuais também
incluem grade, arraste e prévia automática; consulte
[POSE_AUTHORING_INCREMENT.md](POSE_AUTHORING_INCREMENT.md).

## Editor workflow

Choose an explicit graphic type in Actors or Enemies, choose an image, and open Battler Options > Poses por retangulos. Enter a pose name and click Criar pose; edit each frame's X, Y, width, height and duration, then use Adicionar quadro, Remover quadro, Subir quadro or Descer quadro. Rename and remove controls act on the selected pose. Set playback and anchor X/Y, then use the preview time and Ver pose to inspect the exact frame. Changes use the existing database working copy and normal Save workflow.

Use idle for the resting state or a standard motion name such as attack to replace its frames. Custom names appear under Named Rectangle Poses in the action sequence motion selector for both actors and enemies. Renaming a pose does not rewrite previously authored sequence motion names; update those references when renaming. JSON is optional under Avancado: JSON and supports per-frame anchor overrides.

Coordinates are source image pixels. Rectangles and durations require integers; width, height and duration must be positive. Duration is measured in game frames (60 fps), independent of legacy sheet speed. Anchors are normalized within the cropped frame: (0,0) top left, (.5,1) feet; the default is (.5,1). Per-frame anchors override the pose anchor. Loop true repeats, "once" holds the final frame, and false returns transient runtime actions to the battler state when their total duration expires. Persistent idle/state poses hold their final frame when not looping. Held pose commands select the exact rectangle index.

The shared graphicFrame function drives editor previews and runtime. Runtime restores the original sprite anchor when a pose ends; shared room billboards apply anchor offsets in their geometry. Existing static, SV and character sheet configurations continue through their original path when no valid named pose matches. A crop outside its image falls back to that original path. There is no drag-to-crop tool or automatic preview playback in this increment; numeric rectangles and deterministic time scrubbing are available.

## Validation

- `node --test tests/battle-poses.test.cjs`: 13 passing tests, including executable visual form interactions, actors/enemies, runtime/template, crops, duration boundaries, loop policies, aliases, anchors, held poses, invalid data and legacy sheets.
- Existing battle-presentation, battle-sequence-expansion, diana-battle-held-poses, battler-box-title and enemy-model-battle suites: 92 passing tests.
- `patches/animation-poses.patch` reconstructs all nine changed upstream source files from pinned upstream `dc918245cbf8f10ae6eef4ed8cb54b850fed9caa` after `patches/held-poses.patch`. It excludes held-poses changes and contains no assets.
- Native editor/build smoke is owned by the coordinator; this worker did not run preparation or smoke scripts.

Smoke hooks: `details.rr-rectangle-poses`, `fieldset.rr-rectangle-pose-frame[data-frame-index]`; name fields have aria-label `Nome da nova pose` and `Nome da pose`. The UI method is `BattlePresentationEditor.rectanglePoseEditor(host, poses, onChange, onPreview)` and runtime helpers are `ReactorBattleData.graphicPose`, `graphicPoseDuration`, `validateGraphicPoses` and `graphicFrame`.
