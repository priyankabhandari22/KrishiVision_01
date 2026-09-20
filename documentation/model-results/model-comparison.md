# KrishiVision — Model Comparison Results

Results recorded from the `test3` training run (ks project). The production
pipeline uses two per-crop ResNet50 checkpoints; the legacy single 10-class
checkpoint (84.09%) has been retired.

## Summary

| Model            | Combined Accuracy | Guava | Citrus | Selected for Production |
|------------------|-------------------|-------|--------|-------------------------|
| **ResNet50**     | **90.52%**        | 93.75% | 88.82% | ✅ Yes                  |
| EfficientNet-B0  | 82.76%            | 88.75% | 79.61% | No                      |
| MobileNetV3      | 80.61%            | 88.75% | 76.32% | No                      |

**Selected model:** ResNet50 — highest combined classification accuracy across
both crops (one 5-class model per crop).

## Metric policy

The official production accuracy used throughout KrishiVision is **90.52%**
(combined across the guava test set of 80 images and the citrus test set of
152 images; per-crop: guava **93.75%**, citrus **88.82%**).

The official evaluation report contains 232 labeled test samples, with weighted
precision **91.10%**, weighted recall **90.52%**, weighted F1 **90.46%**, and
macro F1 **91.07%**. The per-class report and exact confusion matrices are
stored in `backend/data/evaluation_metrics.json`.

## Training Methodology

Training and evaluation for `test3` (also runnable from
`research/notebooks/test3.ipynb`):

| Parameter            | Value                            |
|----------------------|----------------------------------|
| Dataset              | Citrus + Guava leaf images       |
| Number of classes    | 5 per crop (10 total across crops) |
| Train/Val/Test split | 70/15/15 (stratified, seed 42)   |
| Epochs               | 15                               |
| Batch size           | 16                               |
| Input size           | 224 × 224                        |
| Augmentation         | None (plain resizing)            |
| Optimiser            | Adam (lr 0.0001)                 |
| Loss function        | Sparse categorical cross-entropy |
| Head                 | GAP → Dropout(0.3) → Dense(5, softmax), frozen base |
| Framework            | TensorFlow / Keras               |

## Checkpoint

The selected per-crop model checkpoints are stored at:

```
disease-detection/models/best_guava_ResNet50.keras
disease-detection/models/best_citrus_ResNet50.keras
```

These files are **not** committed to the repository. Copy them from the `ks`
training outputs (see `scripts/setup_models.py`) before the inference server
is started.