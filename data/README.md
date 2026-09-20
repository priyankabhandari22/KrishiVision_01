# KrishiVision Data & Dataset Policy

## Dataset Storage

The Citrus and Guava leaf image dataset was used externally in Google Colab to train and evaluate the model. **No dataset files are stored in this repository, nor will they ever be committed here** (including no sample subsets, demo folders, or test images).

## Supported Dataset Classes (Reference Only)

For reference, the model was trained on the following 10 classes across two crops:

- **Citrus**: Black spot, Melanose, Canker, Greening, Healthy
- **Guava**: Disease Free, Phytopthora, Red rust, Scab, Styler and Root

## Inference-Only Repository

This repository is designed **strictly for inference**. 

- It consumes the pre-trained per-crop model checkpoints located at `disease-detection/models/best_guava_ResNet50.keras` and `disease-detection/models/best_citrus_ResNet50.keras`.
- It does not contain, require, or maintain any model training pipeline.
- If retraining is ever required in the future, it must be performed externally (e.g., in Google Colab) in the same manner as the original model training.
