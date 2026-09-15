# Prediction Contract

This shared JSON contract represents the data handed off from the `disease-detection` module to the `agricultural-advisor` module. 

Every agent working on this project must conform to this exact shape when passing prediction data between these systems.

```json
{
  "crop": "citrus",
  "disease": "Canker",
  "status": "diseased",
  "confidence": 0.91,
  "is_confident": true,
  "heatmap_path": "/path/to/generated/heatmap.jpg"
}
```

## Field Definitions

- `crop` (string): The detected crop. Allowed values: `"citrus"`, `"guava"`. Derived from the winning class index (see class-index table below).
- `disease` (string): The exact trained class label. Must be one of the 10 supported classes.
- `status` (string): `"healthy"` if disease is `"Healthy"` (Citrus) or `"Disease Free"` (Guava); `"diseased"` otherwise.
- `confidence` (float): The softmax probability of the winning class, rounded to 4 decimal places (0.0–1.0).
- `is_confident` (boolean): `true` if `confidence >= 0.70`. The agricultural-advisor uses this to trigger an uncertainty warning to the farmer.
- `heatmap_path` (string): The local path or URL to the generated Grad-CAM visual explanation.

## Class-Index Ordering (Single 10-way Softmax Head)

Confirmed against the Google Colab training notebook. The model uses a **single 10-class output** — `crop` is derived from the winning index range alone.

| Index | Crop   | Disease Label    |
|-------|--------|------------------|
| 0     | Guava  | Disease Free     |
| 1     | Guava  | Phytopthora      |
| 2     | Guava  | Red rust         |
| 3     | Guava  | Scab             |
| 4     | Guava  | Styler and Root  |
| 5     | Citrus | Black spot       |
| 6     | Citrus | Melanose         |
| 7     | Citrus | Canker           |
| 8     | Citrus | Greening         |
| 9     | Citrus | Healthy          |
