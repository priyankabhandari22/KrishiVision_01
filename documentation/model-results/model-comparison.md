# KrishiVision — Model Comparison Results

Results recorded from external training and evaluation conducted in Google Colab.
No training or evaluation is performed in this repository.

## Summary

| Model            | Accuracy   | Selected for Production |
|------------------|------------|-------------------------|
| **ResNet50**     | **84.09%** | ✅ Yes                  |
| EfficientNet-B0  | 77.53%     | No                      |
| MobileNetV3      | 62.12%     | No                      |

**Selected model:** ResNet50 — highest classification accuracy across the 10 trained classes.

## Metric policy

The official production accuracy used throughout KrishiVision is **84.09%**.
The official evaluation report contains 396 labeled samples, with weighted
precision **86.05%**, weighted recall **84.09%**, weighted F1 **84.46%**, and
macro F1 **85.17%**. The per-class report and exact confusion matrix are stored
in `backend/data/evaluation_metrics.json`.

## Training Methodology

> **Note:** Exact methodology details were not formally recorded at time of training.
> If retrieved from the Colab notebook, fill in the placeholders below.

| Parameter            | Value                              |
|----------------------|------------------------------------|
| Dataset              | Citrus + Guava leaf images         |
| Number of classes    | 10 (5 Citrus, 5 Guava)             |
| Train/Val/Test split | `[PLACEHOLDER — e.g. 80/10/10 %]`  |
| Epochs               | `[PLACEHOLDER]`                    |
| Batch size           | `[PLACEHOLDER]`                    |
| Augmentation         | `[PLACEHOLDER]`                    |
| Optimiser            | `[PLACEHOLDER]`                    |
| Loss function        | Categorical cross-entropy (assumed)|
| Framework            | TensorFlow / Keras (Google Colab)  |

## Checkpoint

The selected model checkpoint is stored at:
```
disease-detection/models/KrishiVision_ResNet50.keras
```
This file is **not** committed to the repository. It must be placed there manually before the inference server is started.
