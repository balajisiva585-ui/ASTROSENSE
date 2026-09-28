# ASTROSENSE Onboard Machine Learning Model Layer

## Model Architecture: AstroSense-STGCN-Quantized

AstroSense incorporates a modular Human Activity Recognition (HAR) layer designed for **radiation-tolerant embedded edge systems** aboard spacecraft and planetary habitats.

### Key Architecture Components
1. **Pose Extractor Backbone**: 17 Keypoints (COCO Topology) extracted at 30 FPS.
2. **Spatial-Temporal Graph Convolutional Network (ST-GCN)**: Captures spatial kinematic joint relationships across microgravity biomechanical frames.
3. **Temporal Residual Blocks (ConvLSTM)**: Identifies temporal cadence over a sliding 1.0-second time window (30 frames).
4. **Quantization**: INT8 Symmetric Per-Channel Quantization minimizing RAM footprint to **4.6 MB** with **24.5 ms** inference latency.

---

## 12 Recognized Astronaut Activity Classes
1. `WALKING` - Habitat translation and corridor movement
2. `STANDING` - Neutral microgravity posture watch
3. `SITTING` - Console and terminal operations
4. `SLEEPING_RESTING` - Bunk restraint rest cycle
5. `EATING` - Galley food pack intake
6. `DRINKING` - Hydration fluid pouch consumption
7. `EXERCISING` - Countermeasure workout (ARED / cycle ergometer)
8. `WORKING` - Glovebox research and scientific assays
9. `OPERATING_EQUIPMENT` - Hardware toggles and valve operations
10. `PICKING_CARRYING` - Cargo Transfer Bag (CTB) stowage
11. `FALL_ABNORMAL_MOVEMENT` - Kinetic collision, sudden tumble, or erratic displacement
12. `LONG_INACTIVITY` - Motionless hold exceeding configurable safety threshold

---

## Drop-in Flight Replacement

To replace the simulation inference engine with a compiled ONNX runtime model:

```typescript
import * as ort from 'onnxruntime-node';
import { IActivityInferenceEngine, FrameInput } from './ActivityInferenceEngine';

export class OnnxFlightEngine implements IActivityInferenceEngine {
  private session: ort.InferenceSession | null = null;

  async initializeModel() {
    this.session = await ort.InferenceSession.create('./models/astrosense_stgcn.onnx', {
      executionProviders: ['cpu'],
      graphOptimizationLevel: 'all'
    });
    return true;
  }
  // ... processFrame and evaluate
}
```
