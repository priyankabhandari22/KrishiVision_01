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
7. Select the per-crop trained ResNet50 checkpoints used by this application.

The dataset, training loop, augmentation, and model evaluation are not run by
the application and are not included in this repository.

## Runtime Inference

The production request flow is:

```text
Uploaded leaf image
    -> validation
    -> resize to 224 x 224
    -> ResNet50 normalization
    -> best_guava_ResNet50.keras / best_citrus_ResNet50.keras
    -> one of 5 labels from the winning crop's model
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

The application uses two per-crop ResNet50 models, each with its own 5-class
output head. The crop whose model produces the highest winning softmax score
decides the prediction.

Guava model (`best_guava_ResNet50.keras`):

| Index | Class |
|---:|---|
| 0 | Phytopthora |
| 1 | Red rust |
| 2 | Scab |
| 3 | Styler and Root |
| 4 | Disease Free |

Citrus model (`best_citrus_ResNet50.keras`):

| Index | Class |
|---:|---|
| 0 | Black spot |
| 1 | Canker |
| 2 | Greening |
| 3 | Healthy |
| 4 | Melanose |

The application does not retrain or modify the checkpoints.