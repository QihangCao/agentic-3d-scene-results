# GPT-6 (gpt-6-astra) vs gpt-5.6-sol: controlled Blender scene-reconstruction comparison

Model-only comparison. Prompt, images, tools, pass schedule, reasoning effort (`high`), hardware,
and evaluator held fixed across both arms, per `GPT6_COMPARISON_HANDOFF.md`.

## What changed from the original handoff

The handoff (written 2026-09-08) called for copying GPT-6 credentials from a separate account into
an isolated remote `CODEX_HOME`, because a local preflight probe on 2026-09-08T12:24 (session
`01a080fa`) got `HTTP 400 "The 'gpt-6-astra' model is not supported when using Codex with a ChatGPT
account"`. That credential export was blocked by automatic approval review, so the run never
launched (`PREFLIGHT_BLOCKER.md`). On 2026-09-09, the identical local account, the same `codex-cli
0.153.4` client, and the same model slug succeeded on the first try. This was a server-side
entitlement rollout landing between the two dates, not a client, slug, or isolation problem. The
remote-credential step was skipped as unneeded; every other frozen protocol element (inputs,
hashes, isolation-from-baseline-data rules, runner script, evaluation steps) ran unchanged.

## Run health

All three scenes completed all 5 passes with `codex_exit_status.txt = 0`. No worker was retried.
Wall time was in the same range as baseline (scene_a 4217s vs 4009s baseline; scene_b 3796s vs
4001s; scene_c 4080s vs 4579s). A benign websocket-to-HTTPS transport fallback occurred at the
start of most turns (`Reconnecting... N/5` events) and self-recovered every time; it did not affect
any turn's outcome.

## Independent audit (clean-process re-verification)

Re-opened each `scene.blend` from a fresh headless Blender process (not the worker's own process),
re-rendered all 5 saved cameras, and independently re-ran the frozen `reference_metrics.py`,
`audit_materials.py`, and a GLB structural parser.

| Scene | Disallowed image paths | Source-image dependency count | GLB length matches | Source hash leaked into GLB JSON |
|---|---:|---:|---:|---:|
| A | 0 | 0 | yes | no |
| B | 0 | 0 | yes | no |
| C | 0 | 0 | yes | no |

All three scenes pass cleanly: no worker read or embedded anything outside its permitted source
photo and frozen harness files, and no GLB leaks or size mismatches. Independently re-rendered
`input_match` diagnostics track the workers' own self-reported pass-5 numbers within noise (e.g.
scene_a SSIM 0.37837 independent vs 0.37832 self-reported), confirming the renders are reproducible
and not hand-tuned to the worker's own scoring pass.

## Quantitative results (independent re-render, `composite = 0.55*SSIM + 0.45*edge_corr`)

| Scene | Arm | RGB SSIM | Edge corr | Composite | PSNR dB | Mean-luma error |
|---|---|---:|---:|---:|---:|---:|
| A | gpt-5.6-sol | 0.1999 | 0.0299 | 0.1234 | 11.24 | 0.0077 |
| A | **gpt-6-astra** | **0.3784** | **0.2889** | **0.3381** | **15.78** | 0.0097 |
| B | gpt-5.6-sol | 0.5347 | 0.2001 | 0.3841 | 13.90 | 0.0041 |
| B | **gpt-6-astra** | **0.6916** | **0.5354** | **0.6213** | **16.95** | 0.0167 |
| C | gpt-5.6-sol | 0.5340 | 0.1972 | 0.3824 | 13.20 | 0.0101 |
| C | **gpt-6-astra** | **0.6770** | **0.4794** | **0.5881** | **16.46** | 0.0567 |
| **Macro mean** | gpt-5.6-sol | 0.4229 | 0.1424 | 0.2967 | 12.78 | 0.0073 |
| **Macro mean** | **gpt-6-astra** | **0.5823** | **0.4346** | **0.5158** | **16.40** | **0.0277** |

GPT-6 improves composite on all three scenes (+174% / +62% / +54%) and PSNR on all three. Mean-luma
error is *worse* for GPT-6 on every scene (most visibly scene_c, 0.057 vs 0.010) — this rules out
"the win is just better exposure/luma matching," which the pre-registered verdict rule requires
checking before crediting the improvement to geometry/material reconstruction quality.

## Blind visual judging

Three independent judge agents (no shared context with each other or with this comparison's setup)
each scored a sheet showing SOURCE + two anonymized options per scene, with the option-to-arm
mapping independently randomized per scene and revealed only after all judgments were recorded.

**Observed view (input-match camera):**

| Scene | gpt-6-astra votes | gpt-5.6-sol votes |
|---|---:|---:|
| A | 3 | 0 |
| B | 3 | 0 |
| C | 3 | 0 |

Unanimous, 9/9 votes, across all three scenes. Judges' rationale consistently cited GPT-6 correctly
reproducing specific real objects and materials the baseline invented or dropped — e.g. scene_a:
baseline recolored the recliner olive-green and replaced the source's glass carafe/metal bowl with
abstract cylinders, while GPT-6 kept the correct teal fabric chair, carafe, bowl, and cow-print
pillow; scene_c: baseline hallucinated an unrelated lounge/pouf background, while GPT-6 correctly
placed the Instant Pot (with its red LED display), soap dispensers, and desk monitors matching the
source.

**Hidden view** (a "reverse" novel camera never shown to the model, judged against real held-out
photos of the same physical room from other angles — reported separately per protocol, since a
plausible guess is not evidence the actual unseen room was recovered):

| Scene | gpt-6-astra votes | gpt-5.6-sol votes |
|---|---:|---:|
| A | 1 | 2 |
| B | 3 | 0 |
| C | 3 | 0 |

GPT-6 wins 2 of 3 scenes unanimously; scene_a hidden-view is a genuine split decision — both options
matched some real, idiosyncratic details from the held-out photos (one judge preferred GPT-6 for the
patterned rug material, two preferred the baseline for a black-metal/wood table + ottoman match),
so this is not a case where the audit caught fabrication on either side.

## Pre-registered verdict check

1. All three GPT-6 scenes pass structural, GLB, and source-dependency audits — **yes**.
2. Composite improves on ≥2 of 3 scenes and the macro mean improves — **yes** (3 of 3, macro mean
   +74%).
3. Blinded visual comparison prefers GPT-6 on ≥2 of 3 scenes — **yes** (3 of 3, unanimous).
4. The improvement is not explained only by exposure/luma matching while geometry regresses —
   **yes**: GPT-6's luma error is worse on every scene, and judges cited object/material identity
   and geometry, not exposure, as the deciding factor.

**All four conditions hold → gpt-6-astra is a clear observed-view winner over gpt-5.6-sol on this
harness.** Hidden-view fidelity is more mixed (2 clear wins, 1 genuine split) and should not be
read as an equally strong claim.

This is one stochastic run per scene per arm; treat scene-level differences as suggestive rather
than definitive. A clean follow-up would be a second independent run per model, not manual repair
of these outputs.

## Deliverables

- Quantitative table, blinded judgments, hidden-view result: this file
- [RUN_SUMMARY.json](RUN_SUMMARY.json) — exact model/config, per-pass timing, cumulative token usage, metrics, independent audit values
- [GPT56_GPT6_INPUT_COMPARISON.png](GPT56_GPT6_INPUT_COMPARISON.png) — source vs both arms, labels revealed, per scene
- [GPT6_ITERATION_SHEET.png](GPT6_ITERATION_SHEET.png) — GPT-6 pass-by-pass progression per scene
- [GPT6_HIDDEN_COMPLETION_SHEET.png](GPT6_HIDDEN_COMPLETION_SHEET.png) — predicted hidden views vs real held-out photos (still option-labeled; mapping in `comparison/RANDOMIZATION_KEY.json`)
- `comparison/BLIND_INPUT_MATCH_SHEET.png`, `comparison/BLIND_HIDDEN_VIEW_SHEET.png`, `comparison/RANDOMIZATION_KEY.json` — the actual sheets shown to blind judges plus the reveal key
- Per-scene independent audit JSON/log: `scene_{a,b,c}/output/independent_audit.json`, `independent_material_audit.json`, `independent_glb_audit.json`, `independent_input_metrics.json`
- Per-scene independent rerenders: `scene_{a,b,c}/output/renders_independent/`
- Frozen-hash manifest and infra retry log: none needed — zero retries, all frozen hashes verified before launch (see `PREFLIGHT_BLOCKER.md` for the earlier, unused attempt's preflight hash verification)

## Final scene paths

- scene_a: [scene.blend](scene_a/output/scene.blend) · [scene.glb](scene_a/output/scene.glb) · [input_match.png](scene_a/output/renders/input_match.png)
- scene_b: [scene.blend](scene_b/output/scene.blend) · [scene.glb](scene_b/output/scene.glb) · [input_match.png](scene_b/output/renders/input_match.png)
- scene_c: [scene.blend](scene_c/output/scene.blend) · [scene.glb](scene_c/output/scene.glb) · [input_match.png](scene_c/output/renders/input_match.png)
