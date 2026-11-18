# Real-world open-source GitHub projects — learning references only

Verified on GitHub **2026-10-17**. Reference links are deliberately kept OUT of the public website. Each has a publicly accessible repository. Check the latest license before reuse, and inspect third-party models, datasets and dependencies separately.

## TrafficFlow — Intelligent Traffic Monitoring

**Main implemented reference:** https://github.com/gurugaurav/python-vehicle-counting-YOLOv8 — **MIT**

- Working YOLOv8 + ByteTrack application for directional counting, IP-camera/RTSP support, CSV event logging, CLI, GUI, and a test script.
- Learn: consistent track IDs, line-crossing geometry, low-confidence association, stream handling and counting tests.

**Deeper tracking algorithm:** https://github.com/FoundationVision/ByteTrack — **MIT**

- Research implementation of a multi-object tracker, with reproducible tutorials.

## CropGuard — AI Plant Disease Detection

**Main implemented reference:** https://github.com/dovh25/plantdoc-live-demo — **MIT**

- PlantDoc sample product: FastAPI + ONNX Runtime leaf disease detection, containerized, with training notebooks, class index and an example browser interface.
- Learn: model export/ONNX, request validation, detection postprocessing, crop label interpretation, Docker deployment.

Be aware that the example uses Ultralytics models and a plant-disease dataset; the repository's MIT license does not replace separate licenses for model code, weights, and datasets.

## FieldManual AI — Technical Document Search

**Main implemented reference:** https://github.com/zylon-ai/private-gpt — **Apache-2.0**

- Mature local AI application/API project with file ingestion, retrieval, citations, and a local model-backend integration.
- Learn: indexing, retrieval, evidence-backed answers, privacy architecture, and evaluation of unsupported outputs.

**Alternative reference:** https://github.com/infiniflow/ragflow — **Apache-2.0**

- End-to-end open-source RAG engine with a production-focused document pipeline.

## Note on the portfolio demos

The supplied portfolio demos are original, independent browser-only **concept simulations**. To show actual ML/DL projects, implement, test and deploy the real models, then add authentic output, code links, and real evaluation data.
