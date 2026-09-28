# ASTROSENSE Embedded Edge Hardware Deployment Guide

This document outlines how AstroSense can be deployed on real-world spaceflight edge computing hardware.

## 1. Candidate Spaceflight Edge Hardware

### A. Unibap SpaceCloud (Space-Qualified Commercial Off-The-Shelf)
- **Architecture**: AMD x86 / eGPU or Microchip PolarFire SoC.
- **Flight Readiness**: TRL 8/9, flight-proven on ISS and smallsat missions.
- **OS**: Linux with SpaceCloud Framework.
- **Deployment**: Docker container or native statically linked binary.

### B. NVIDIA Jetson Orin Industrial (Extreme Environment)
- **Compute**: 275 TOPS INT8 AI compute.
- **Form Factor**: Ruggedized, operating temp -40°C to 85°C.
- **Runtime**: NVIDIA TensorRT embedded engine.

### C. Raspberry Pi CM4 Class / Microcontroller DSP
- **Target**: Low-power secondary sensor nodes in individual bunks/gloveboxes.
- **Runtime**: TensorFlow Lite Micro with ARM CMSIS-NN kernels.

---

## 2. Compilation and Quantization Steps

```bash
# Export trained PyTorch ST-GCN model to ONNX
python export_onnx.py --weights checkpoint_best.pth --output astrosense_stgcn.onnx --dynamic-batch

# Run INT8 Post-Training Quantization (PTQ) via ONNX Runtime
python quantize_model.py \
  --input astrosense_stgcn.onnx \
  --output astrosense_stgcn_int8.onnx \
  --calibration-dataset ./data/calib_poses.npz
```

---

## 3. Delay-Tolerant Networking Integration
AstroSense can directly interface with NASA's Interplanetary Overlay Network (ION) implementation of the Delay-Tolerant Networking (DTN) Bundle Protocol (RFC 5050).
