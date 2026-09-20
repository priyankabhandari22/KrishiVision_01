# KrishiVision Pipeline Flow

This document establishes the pipeline contract for KrishiVision. All downstream agents must adhere to this flow to ensure clean separation of concerns.

## Full Pipeline Diagram

```
Leaf Image Upload
    │
    ▼
Image Preprocessing
    │
    ▼
Disease Classification
    (Per-crop ResNet50 models - 90.5% combined accuracy selected)
    │
    ├── Output: Crop + Disease + Confidence Score
    │
    ▼
Visual Explanation of Prediction
    (Grad-CAM style heatmap over the leaf)
    │
    ▼
Agricultural Guidance Layer
```

## Guidance Constraints

The Agricultural Guidance Layer must ALWAYS include:
1. **Simple-language explanation** of the disease.
2. **Immediate actions** the farmer can take.
3. **Disease spread prevention steps**.
4. **Long-term prevention & monitoring suggestions**.
5. **A clear uncertainty warning** when confidence is low.

**CRITICAL RULES:**
- The advisory layer must NEVER invent treatments, chemical names, or dosages.
- It ONLY rephrases verified disease-knowledge entries into farmer-friendly language.
- Detection and advisory are DELIBERATELY separate concerns. Do not merge them into one module.
