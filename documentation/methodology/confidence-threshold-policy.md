# KrishiVision — Confidence Threshold Policy

## Overview

KrishiVision attaches a boolean `is_confident` flag to every prediction. When
`is_confident` is `false`, the system surfaces an uncertainty warning to the farmer
instead of presenting the prediction result as authoritative.

This document explains what the threshold is, where it lives, and why it exists.

---

## Single Source of Truth

The threshold is defined **once** at:

```
disease-detection/config.py  →  CONFIDENCE_THRESHOLD = 0.70
```

No other file in this repository may define or duplicate this value. All modules that need it must import from `disease_detection.config`.

### Files that consume the threshold

| File | Role |
|------|------|
| `disease-detection/prediction/classifier.py` | Sets `is_confident` on the prediction result |
| `backend/` (API layer) | Reads `is_confident` and attaches `low_confidence_warning` to the response |
| `frontend/` | Reads `is_confident` and conditionally renders the uncertainty UI |

---

## How `is_confident` Is Computed

```python
is_confident = confidence >= CONFIDENCE_THRESHOLD
```

Where `confidence` is the softmax probability of the winning class (0.0–1.0), as output by the ResNet50 model.

---

## Why 70%?

The model achieves **84.09% overall accuracy** on its test set. A threshold of 70% was chosen based on the following reasoning:

- **Below the model's average accuracy**: The model's base rate is 84%. A threshold lower than that would mark as uncertain predictions the model is typically correct about. 70% sets a meaningful floor — predictions below it are outliers where the model is notably less sure than usual.
- **Practical field conditions**: Farmers photograph leaves in variable lighting, at irregular angles, and with partial occlusion. The threshold is intentionally not set too high (e.g. 90%) to avoid over-triggering warnings under normal field conditions.
- **Conservative default**: For a crop disease advisory system, a false negative (confident wrong answer) is more harmful than a false positive (unnecessary uncertainty warning). 70% is a conservative starting point that can be tuned upward once real-world false-negative rates are measured.

> **Note:** If in production the warning fires too often or too rarely, update
> `CONFIDENCE_THRESHOLD` in `disease-detection/config.py` only — no other files need to change.

---

## Propagation Through the Pipeline

```
predict() in classifier.py
    │
    ├── confidence = softmax_max_prob
    ├── is_confident = (confidence >= CONFIDENCE_THRESHOLD)
    │
    ▼
Prediction Contract JSON
    {
      "confidence": 0.61,
      "is_confident": false,
      ...
    }
    │
    ▼
Backend API layer
    → if not is_confident: attach LOW_CONFIDENCE_WARNING to response
    │
    ▼
Frontend
    → render yellow warning banner with LOW_CONFIDENCE_WARNING text
    → suggest farmer retake photo in better lighting
```

---

## Warning Message

The default warning message is also defined in `disease-detection/config.py` as `LOW_CONFIDENCE_WARNING`:

> *"Prediction confidence is low. The result may not be reliable. Please retake the photo in better lighting with the full leaf clearly visible, then try again."*

Defining it alongside the threshold ensures the copy and the logic stay in sync and don't drift independently.
