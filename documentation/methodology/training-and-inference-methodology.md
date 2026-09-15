# KrishiVision Methodology

The attached methodology diagram describes two different stages. Training and
evaluation happen externally; this repository runs inference only.

## Training and Evaluation (External)

The original training workflow is:

1. Collect Guava and Citrus leaf images.
2. Resize images to `224 x 224` and apply the model's normalization.
3. Segment the leaf when preparing the training data.
4. Apply training-only augmentation such as rotation, flipping, zoom,
   shifting, and brightness adjustment.
5. Split the dataset into training, validation, and test sets.
6. Compare transfer-learning models and evaluate accuracy, precision, recall,
   F1 score, and the confusion matrix.
7. Select the trained ResNet50 checkpoint used by this application.

The dataset, training loop, augmentation, and model evaluation are not run by
the application and are not included in this repository.

## Runtime Inference

The production request flow is:

```text
Uploaded leaf image
    -> validation
    -> resize to 224 x 224
    -> ResNet50 normalization
    -> KrishiVision_ResNet50.keras
    -> one of 10 class labels
    -> confidence and health status
    -> Grad-CAM explanation
    -> verified agricultural advisory
    -> MongoDB prediction history
```

Runtime preprocessing intentionally does not add new segmentation or random
augmentation. Those operations must match the training notebook exactly before
being introduced into production; otherwise the model would receive a
different input distribution than the one it learned.

## Class Contract

The combined model has one 10-class output head:

| Index | Crop | Class |
|---:|---|---|
| 0 | Guava | Disease Free |
| 1 | Guava | Phytopthora |
| 2 | Guava | Red rust |
| 3 | Guava | Scab |
| 4 | Guava | Styler and Root |
| 5 | Citrus | Black spot |
| 6 | Citrus | Melanose |
| 7 | Citrus | Canker |
| 8 | Citrus | Greening |
| 9 | Citrus | Healthy |

The application does not retrain or modify the checkpoint.