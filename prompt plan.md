# KrishiVision — Antigravity Build Plan
### Master Prompt + 20-Task Breakdown (with model assignment)

---

## 0. How to use this document

1. Paste **Section 1 (Master Orchestrator Prompt)** into Antigravity's **Manager Surface** first, using **Gemini 3 Pro** — this gets one agent to lay down the skeleton and shared contracts (folder structure, interfaces, naming conventions) that every other task depends on.
2. Once the skeleton exists, spawn the tasks in **Section 2** as separate parallel/sequential agents (Antigravity's Manager view supports up to 5 parallel agents). Respect the **Dependency** column — don't start a dependent task until its prerequisite is merged.
3. Each task card is self-contained: paste it as-is into a new agent conversation, on the model listed.
4. Model choice is based on task shape, not brand loyalty:
   - **Gemini 3 Pro** → architecture, planning, cross-cutting contracts (native browser + terminal control, best for orchestration).
   - **Gemini 3.5 Flash** → fast, mechanical, well-specified scaffolding and UI iteration (4–12x faster, still frontier-grade coding).
   - **Claude Sonnet 4.6** → careful factual/domain writing, backend logic, anything where correctness and restraint (not inventing facts) matters.
   - **Claude Opus 4.6** → the hardest reasoning tasks — ML inference correctness, explainability (Grad-CAM), and end-to-end integration debugging.
   - Claude models require your own Anthropic API key in Antigravity settings; Gemini models work out of the box.

---

## 1. Master Orchestrator Prompt
**Model: Gemini 3 Pro** — run this once, first.

```
You are the lead architect agent for a project called KrishiVision.

PROBLEM:
Farmers struggle to manually identify crop leaf diseases from spots, discoloration,
or lesions. Delayed or wrong identification leads to disease spread and crop loss.

SOLUTION:
KrishiVision is a leaf disease detection + agricultural guidance system for
Citrus and Guava leaves. It follows a strict pipeline:

Leaf Image Upload
    → Image Preprocessing
    → Disease Classification (ResNet50, 84.09% accuracy — already selected as best
      model over EfficientNet-B0 [77.53%] and MobileNetV3 [62.12%])
    → Crop + Disease + Confidence Score
    → Visual Explanation of Prediction (Grad-CAM style heatmap over the leaf)
    → Agricultural Guidance, which must ALWAYS include:
        - Simple-language explanation of the disease
        - Immediate actions the farmer can take
        - Disease spread prevention steps
        - Long-term prevention & monitoring suggestions
        - A clear uncertainty warning when confidence is low
    → The advisory layer must NEVER invent treatments, chemical names, or
      dosages — it only rephrases verified disease-knowledge entries into
      farmer-friendly language. Detection and advisory are DELIBERATELY separate
      concerns; do not merge them into one module.

TRAINED CLASSES (the system must never claim anything outside this list):
  Citrus: Black spot, Melanose, Canker, Greening, Healthy
  Guava: Disease Free, Phytopthora, Red rust, Scab, Styler and Root

MODEL STATUS — READ CAREFULLY:
Training is ALREADY COMPLETE. This was done separately in Google Colab on the
full Citrus + Guava dataset. Three models were compared and ResNet50 was
selected (84.09% test accuracy, beating EfficientNet-B0 at 77.53% and
MobileNetV3 at 62.12%). The trained model file `KrishiVision_ResNet50.keras`
already exists and will be placed directly into disease-detection/models/.

DO NOT design any training pipeline, DO NOT create or reference any training
dataset inside this repo, and DO NOT ask for retraining. This project is
INFERENCE-ONLY: it loads the existing .keras file and predicts on new,
single leaf images the user uploads at runtime. The full dataset stays
external (wherever it lived for the Colab training) and is never copied in.

YOUR JOB RIGHT NOW (scaffolding pass only — do not implement business logic yet):
1. Create this exact folder structure at the project root "KrishiVision/":

KrishiVision/
├── frontend/
│   ├── pages/
│   ├── components/
│   └── assets/
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── services/
├── disease-detection/
│   ├── models/
│   │   └── KrishiVision_ResNet50.keras   (placeholder — real file dropped in later)
│   ├── prediction/
│   ├── preprocessing/
│   └── explanation/
├── agricultural-advisor/
│   ├── disease-knowledge/
│   ├── recommendations/
│   └── prevention/
├── data/
│   └── README.md
├── documentation/
│   ├── methodology/
│   ├── model-results/
│   └── project-flow/
└── README.md

2. Do NOT place any training dataset anywhere in this repo — not even a
   sample/demo subset. `data/README.md` should only note that the dataset was
   used externally in Colab for training/evaluation and is not part of this
   codebase; this repo only consumes the resulting trained model file.
3. Write a short top-level `README.md` describing the project, the pipeline
   (Detect → Explain → Advise → Prevent), the two supported crops, the
   10 supported classes, and the fact that this app runs inference only
   against an already-trained ResNet50 model.
4. In `documentation/project-flow/`, add a single markdown file describing the
   full pipeline diagram in text form (the arrow flow above) so every
   downstream agent can reference the same contract.
5. Define (as markdown, not code yet) the shared JSON contract that
   disease-detection hands to agricultural-advisor, e.g.:
   { "crop": "citrus", "disease": "canker", "status": "diseased",
     "confidence": 0.91, "is_confident": true, "heatmap_path": "..." }
   `status` is derived from disease: "healthy" only for Citrus "Healthy" or
   Guava "Disease Free", "diseased" for every other class. Save this as
   documentation/methodology/prediction-contract.md — every other agent must
   conform to this exact shape.
6. Keep everything minimal, clean, and modular. No extra frameworks, no
   placeholder business logic, no premature optimization, and absolutely no
   training code. Just structure + contracts for an inference pipeline.

Confirm the structure back with a directory tree once done.
```

---

## 2. Task Breakdown (Tasks 1–20)

| # | Task | Model | Depends on |
|---|------|-------|------------|
| 1 | Repo scaffolding (already covered by Master Prompt) | Gemini 3 Pro | — |
| 2 | Top-level README + project-flow docs | Gemini 3.5 Flash | 1 |
| 3 | `data/README.md` — external dataset note (no training pipeline) | Gemini 3.5 Flash | 1 |
| 4 | Image preprocessing module | Claude Sonnet 4.6 | 1 |
| 5 | Load & run the already-trained ResNet50 `.keras` model | Claude Opus 4.6 | 4 |
| 6 | *(Optional / deferred)* Document Colab training results (no re-run) | Claude Sonnet 4.6 | 5 |
| 7 | Grad-CAM visual explanation module | Claude Opus 4.6 | 5 |
| 8 | Confidence & uncertainty policy | Claude Sonnet 4.6 | 5 |
| 9 | Disease knowledge base (Citrus) | Claude Sonnet 4.6 | 1 |
| 10 | Disease knowledge base (Guava) | Claude Sonnet 4.6 | 1 |
| 11 | Recommendation engine | Claude Sonnet 4.6 | 9, 10 |
| 12 | Prevention & monitoring module | Claude Sonnet 4.6 | 9, 10 |
| 13 | Backend data models/schemas | Gemini 3.5 Flash | 1 |
| 14 | Backend routes | Gemini 3.5 Flash | 13 |
| 15 | Backend controllers | Claude Sonnet 4.6 | 14 |
| 16 | Backend orchestration service | Claude Opus 4.6 | 5, 7, 8, 11, 12, 15 |
| 17 | Frontend upload + result pages | Gemini 3.5 Flash | 16 |
| 18 | Frontend components (confidence bar, heatmap viewer, advisory cards) | Gemini 3.5 Flash | 17 |
| 19 | End-to-end integration + browser-verified test pass | Claude Opus 4.6 | 16, 18 |
| 20 | Documentation: methodology, model results, final README polish | Claude Sonnet 4.6 | 19 |

> Task 6 is now optional and deferred — it only *documents* the accuracy
> numbers already produced in Colab (84.09% / 77.53% / 62.12%). It does not
> run, re-run, or require any training data, and can be skipped entirely for
> the current build without blocking anything else.

---

### Task 2 — Top-level docs
**Model: Gemini 3.5 Flash**
```
Using the existing prediction-contract.md and project-flow docs as ground truth,
write a clear top-level README.md for KrishiVision covering: problem, solution,
supported crops/classes, pipeline diagram (text form), and folder structure
overview. Keep it under one page. Do not describe features that don't exist yet.
```

### Task 3 — Dataset guide
**Model: Gemini 3.5 Flash**
```
Write data/README.md explaining: the Citrus and Guava dataset was already used
externally in Google Colab to train and evaluate the model, and is NOT stored
in this repo and never will be (no sample subset, no demo folder — nothing).
List the 10 classes for reference only (Citrus - Black spot, Melanose, Canker,
Greening, Healthy; Guava - Disease Free, Phytopthora, Red rust, Scab, Styler
and Root). State plainly that this repo is inference-only: it consumes the
already-trained checkpoint at disease-detection/models/KrishiVision_ResNet50.keras
and does not include or require any training pipeline. Do not describe how to
retrain — only note that if retraining is ever needed later, it would happen
externally, the same way it did originally.
```

### Task 4 — Preprocessing module
**Model: Claude Sonnet 4.6**
```
In disease-detection/preprocessing/, implement image preprocessing for leaf
images: resize/normalize to match ResNet50 input requirements, basic validation
(reject non-image files, reject unreasonably small/corrupt images), and a single
clean function `preprocess(image) -> tensor` that prediction/ can call. Add
input validation errors that are informative for the API layer to surface to
the user. No training code here — inference-time preprocessing only.
```

### Task 5 — Load & run the already-trained ResNet50 model
**Model: Claude Opus 4.6**
```
The model is ALREADY TRAINED. Do not build a training loop, do not touch any
dataset, and do not ask for one. A file named KrishiVision_ResNet50.keras
already exists (or will be dropped in) at
disease-detection/models/KrishiVision_ResNet50.keras.

In disease-detection/prediction/, implement a clean inference wrapper that:
1. Loads KrishiVision_ResNet50.keras once (e.g. via tf.keras.models.load_model),
   with a clear error if the file is missing — do not silently fall back to a
   random/untrained model.
2. Exposes `predict(preprocessed_tensor) -> {crop, disease, status, confidence}`
   where:
   - `disease` is exactly one of the 10 trained labels:
     Citrus: Black spot, Melanose, Canker, Greening, Healthy
     Guava: Disease Free, Phytopthora, Red rust, Scab, Styler and Root
   - `crop` is "citrus" or "guava", derived from whichever label group won
   - `status` is "healthy" if disease is Citrus "Healthy" or Guava
     "Disease Free", otherwise "diseased"
   - `confidence` is the softmax probability of the winning class
3. Be explicit in code comments about how crop is determined (single combined
   10-way head vs. two separate heads) based on however the model was actually
   trained in Colab — do not assume, ask if the label ordering isn't obvious
   from the model's output shape.
Output must conform exactly to documentation/methodology/prediction-contract.md.
This is inference-only code — no fit(), no training data loading, anywhere in
this file.
```

### Task 6 — *(Optional, deferred)* Document existing Colab training results
**Model: Claude Sonnet 4.6**
```
This task does NOT run any training or evaluation — it only writes down results
that were already produced separately in Google Colab. Create
documentation/model-results/model-comparison.md recording: ResNet50 84.09%,
EfficientNet-B0 77.53%, MobileNetV3 62.12%, with ResNet50 marked as the
selected production model and a one-line rationale (highest accuracy). If exact
methodology details (dataset split, epochs, augmentation) aren't available,
leave clearly marked placeholders rather than inventing numbers. This task can
be skipped entirely without affecting the running application.
```

### Task 7 — Grad-CAM explanation module
**Model: Claude Opus 4.6**
```
In disease-detection/explanation/, implement Grad-CAM (or equivalent) visual
explanation that highlights the region of the leaf image that most influenced
the ResNet50 prediction. Input: the model, the preprocessed tensor, the
predicted class index. Output: a heatmap overlaid on the original image, saved
to a path, matching the "heatmap_path" field in prediction-contract.md. Keep
this decoupled from the prediction wrapper — it should accept a model + tensor,
not re-run preprocessing itself.
```

### Task 8 — Confidence & uncertainty policy
**Model: Claude Sonnet 4.6**
```
Define a single, shared confidence-thresholding policy (e.g. a config-driven
threshold, not hardcoded magic numbers scattered across files) that marks
predictions as "is_confident": false when below threshold. Document the
rationale in documentation/methodology/. This flag must propagate into
prediction-contract.md output so both backend and frontend can react to it
(e.g. show "uncertain — please retake photo in better light" warnings).
```

### Task 9 — Disease knowledge base (Citrus)
**Model: Claude Sonnet 4.6**
```
In agricultural-advisor/disease-knowledge/, create structured, verifiable
knowledge entries (plain data files, e.g. JSON/YAML) for each Citrus class:
Black spot, Melanose, Canker, Greening, Healthy. Tag the "Healthy" entry with
status: "healthy" and all others with status: "diseased", matching
prediction-contract.md. Each entry must include: simple-language description
of the problem, general immediate actions, general disease-spread-prevention
guidance, and long-term monitoring suggestions. For the Healthy entry, keep
these sections short and focused on maintenance/monitoring rather than
treatment. Do NOT include specific chemical names, brand names, or dosages —
keep guidance general and safe (e.g. "consult a local agricultural extension
officer for approved treatment options" rather than naming a chemical). Cite
that this is general guidance, not a substitute for expert advice.
```

### Task 10 — Disease knowledge base (Guava)
**Model: Claude Sonnet 4.6**
```
Same as Task 9, but for Guava classes: Disease Free, Phytopthora, Red rust,
Scab, Styler and Root. Tag "Disease Free" with status: "healthy" and all
others with status: "diseased". Follow the exact same data schema used for
Citrus in agricultural-advisor/disease-knowledge/ so the recommendation
engine can treat both crops identically.
```

### Task 11 — Recommendation engine
**Model: Claude Sonnet 4.6**
```
In agricultural-advisor/recommendations/, implement a function that takes the
prediction-contract.md JSON (crop, disease, confidence, is_confident) and looks
up the matching disease-knowledge entry, returning a farmer-friendly structured
response: explanation, immediate actions, prevention steps. If is_confident is
false, prepend a clear uncertainty warning and soften the specificity of
advice (e.g. suggest re-photographing or consulting an expert first). Never
fabricate advice for classes outside the 10 trained categories.
```

### Task 12 — Prevention & monitoring module
**Model: Claude Sonnet 4.6**
```
In agricultural-advisor/prevention/, implement the long-term prevention and
monitoring layer — recurring practices (e.g. periodic leaf inspection
schedule, general hygiene practices) tied to each disease-knowledge entry,
separate from the "immediate action" content in Task 11 so short-term and
long-term advice stay cleanly separated in the API response.
```

### Task 13 — Backend data models/schemas
**Model: Gemini 3.5 Flash**
```
In backend/models/, define the data schemas for: incoming image upload
request, the prediction result (matching prediction-contract.md exactly), and
the final advisory response (explanation + immediate action + spread
prevention + long-term prevention + confidence warning). Keep schemas
framework-appropriate but minimal — no ORM/database modeling needed yet, this
is a stateless pipeline for now.
```

### Task 14 — Backend routes
**Model: Gemini 3.5 Flash**
```
In backend/routes/, define REST endpoints: POST /predict (accepts an image,
returns the full pipeline result), and GET /health. Wire routes to controllers
(to be implemented in Task 15) but stub the controller calls for now if
controllers aren't ready yet.
```

### Task 15 — Backend controllers
**Model: Claude Sonnet 4.6**
```
In backend/controllers/, implement the controller for POST /predict: validate
the uploaded image, call the orchestration service (Task 16), and shape the
final JSON response per the schema in backend/models/. Handle and clearly
surface errors (bad image, unsupported crop, low-confidence warning) without
leaking internal stack traces to the client.
```

### Task 16 — Backend orchestration service
**Model: Claude Opus 4.6**
```
In backend/services/, implement the service that ties the full pipeline
together in order: preprocessing → prediction → explanation (heatmap) →
confidence check → recommendation engine → prevention module → final combined
response. This is the most critical integration point — make sure each stage's
output exactly matches what the next stage expects, per
prediction-contract.md. Add clear error boundaries so a failure in one stage
(e.g. explanation generation) doesn't silently corrupt the rest of the
response — degrade gracefully (e.g. return prediction + advice even if the
heatmap fails, with a note that visual explanation is unavailable).
```

### Task 17 — Frontend upload + result pages
**Model: Gemini 3.5 Flash**
```
In frontend/pages/, build an upload page (drag-and-drop or file picker for a
leaf image) and a results page that calls POST /predict and renders: crop,
disease, confidence %, the heatmap image, and the four advisory sections
(explanation, immediate action, spread prevention, long-term prevention). Show
a distinct visual warning state when is_confident is false. Keep styling
clean and simple — this is for farmers/field use, prioritize clarity over
decoration.
```

### Task 18 — Frontend components
**Model: Gemini 3.5 Flash**
```
In frontend/components/, extract reusable pieces from Task 17's pages:
ConfidenceBar, HeatmapViewer (image + overlay toggle), AdvisoryCard (one per
section: explanation/immediate/spread-prevention/long-term), and an
UncertaintyBanner shown only when is_confident is false. Use
frontend/assets/ for any icons/illustrations needed (leaf icons, warning
icons) — keep it minimal.
```

### Task 19 — End-to-end integration + verification
**Model: Claude Opus 4.6**
```
Run the full pipeline end-to-end: upload a sample leaf image through the
frontend, confirm it hits POST /predict, flows through preprocessing →
prediction → explanation → advisory, and renders correctly including the
uncertainty-warning path (simulate a low-confidence case). Use
Antigravity's browser-in-the-loop verification to capture a screenshot of the
working result page as proof. Fix any contract mismatches found between
disease-detection, agricultural-advisor, backend, and frontend. Do not modify
business logic beyond what's needed to fix integration bugs.
```

### Task 20 — Final documentation polish
**Model: Claude Sonnet 4.6**
```
Consolidate documentation/methodology/ (pipeline + contracts + confidence
policy), documentation/model-results/ (ResNet50 84.09% vs EfficientNet-B0
77.53% vs MobileNetV3 62.12%, with ResNet50 marked as the already-trained,
selected model — if Task 6 was skipped, just carry these three numbers as
given, don't re-derive them), and documentation/project-flow/ into a coherent
set. Update the top-level README.md to reflect the final, working structure
and state clearly that this is an inference-only application: it loads
KrishiVision_ResNet50.keras and does not include, reference, or require the
training dataset (see data/README.md). Keep tone factual — no marketing
language, this is an engineering + agricultural-guidance project.
```

---

## 3. Notes on sequencing in Antigravity's Manager view

- Tasks **4, 9, 10, 13** have no interdependencies once Task 1 is done — run these three in parallel.
- Tasks **5 → 7 → 8** and **9,10 → 11 → 12** are two independent chains — run each chain in parallel with the other.
- Task **6 is optional** — skip it entirely if you just want the app working; it produces no code the app depends on.
- Task **16** is a hard convergence point — don't start it until 5, 7, 8, 11, 12, and 15 are all merged.
- Task **19** should always run last on Opus 4.6, since it's the one place where a strong reasoning model earns its keep debugging cross-module contract mismatches rather than writing net-new code.
- **Nowhere in this plan is there a training step.** If any agent proposes writing a training loop, downloading the dataset, or retraining the model, that's out of scope — stop it and point it back to disease-detection/models/KrishiVision_ResNet50.keras as the only source of truth for the model.