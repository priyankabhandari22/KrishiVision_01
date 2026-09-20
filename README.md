# KrishiVision

## Problem
Farmers struggle to manually identify crop leaf diseases from spots, discoloration, or lesions. Delayed or inaccurate identification leads to rapid disease spread and severe crop loss.

## Solution
KrishiVision is a leaf disease detection and agricultural guidance system for Citrus and Guava leaves. It classifies leaf diseases using per-crop ResNet50 models (90.5% combined test accuracy — guava 93.75%, citrus 88.82%), provides visual explanations via Grad-CAM heatmaps, and delivers verified, farmer-friendly agricultural advisory without inventing treatments or dosages.

## Supported Crops & Classes

- **Citrus**: Black spot, Melanose, Canker, Greening, Healthy
- **Guava**: Disease Free, Phytopthora, Red rust, Scab, Styler and Root

## Pipeline Architecture

```
Leaf Image Upload
    │
    ▼
Image Preprocessing
    │
    ▼
Disease Classification (ResNet50)
    │
    ├── Output: Crop + Disease + Confidence Score
    │
    ▼
Visual Explanation (Grad-CAM Heatmap)
    │
    ▼
Agricultural Guidance (Simple Explanation + Immediate & Long-term Actions)
```

## Folder Structure Overview

```
KrishiVision/
├── frontend/             # Web interface (pages, components, assets)
├── backend/              # API server & routing (routes, controllers, models, services)
├── disease-detection/    # ML classification (ResNet50), preprocessing, & Grad-CAM explanation
├── agricultural-advisor/ # Verified disease knowledge base, recommendations, & prevention
├── data/                 # Local data guidelines (external dataset handling)
└── documentation/        # Architectural flow, prediction contract, & model methodology
```
