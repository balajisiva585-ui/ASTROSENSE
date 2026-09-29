import { OpenCVDiagnosticsData } from '../../types';

declare global {
  interface Window {
    cv: any;
    Module?: any;
  }
}

export interface OpenCVFrameMetrics {
  brightness: number; // 0-255
  contrast: number; // std dev
  lightQuality: 'GOOD' | 'LOW' | 'BRIGHT';
  blurVariance: number; // Laplacian variance
  imageQuality: 'GOOD' | 'BLURRY' | 'SUB-OPTIMAL';
  motionMagnitude: number; // 0.0 - 1.0+
  motionLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  latencyMs: number;
}

export class OpenCVVisionService {
  private static instance: OpenCVVisionService | null = null;
  private isLoaded: boolean = false;
  private isLoading: boolean = false;
  private offscreenCanvas: HTMLCanvasElement | null = null;
  private offscreenCtx: CanvasRenderingContext2D | null = null;

  // Previous grayscale frame for motion & optical flow
  private prevGrayMat: any = null;
  private prevPointsMat: any = null;

  // Real measured frame metrics
  private lastMetrics: OpenCVFrameMetrics = {
    brightness: 128,
    contrast: 40,
    lightQuality: 'GOOD',
    blurVariance: 120,
    imageQuality: 'GOOD',
    motionMagnitude: 0,
    motionLevel: 'LOW',
    latencyMs: 0,
  };

  private frameCount: number = 0;
  private lastProcessedTime: number = 0;

  private constructor() {
    if (typeof document !== 'undefined') {
      this.offscreenCanvas = document.createElement('canvas');
      this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });
    }
  }

  public static getInstance(): OpenCVVisionService {
    if (!OpenCVVisionService.instance) {
      OpenCVVisionService.instance = new OpenCVVisionService();
    }
    return OpenCVVisionService.instance;
  }

  /**
   * Load OpenCV.js asynchronously into the browser
   */
  public async loadOpenCV(): Promise<boolean> {
    if (this.isLoaded && window.cv && window.cv.Mat) return true;
    if (this.isLoading) {
      return new Promise((resolve) => {
        const check = setInterval(() => {
          if (this.isLoaded) {
            clearInterval(check);
            resolve(true);
          }
        }, 100);
      });
    }

    this.isLoading = true;

    // Check if OpenCV is already on window
    if (window.cv && window.cv.Mat) {
      this.isLoaded = true;
      this.isLoading = false;
      return true;
    }

    return new Promise((resolve) => {
      const existingScript = document.getElementById('opencv-script');
      if (existingScript) {
        const checkReady = () => {
          if (window.cv && window.cv.Mat) {
            this.isLoaded = true;
            this.isLoading = false;
            resolve(true);
          } else {
            setTimeout(checkReady, 100);
          }
        };
        checkReady();
        return;
      }

      const script = document.createElement('script');
      script.id = 'opencv-script';
      script.src = '/js/opencv.js';
      script.async = true;
      script.type = 'text/javascript';

      script.onload = () => {
        const checkCv = () => {
          if (window.cv && window.cv.Mat && typeof window.cv.cvtColor === 'function') {
            this.isLoaded = true;
            this.isLoading = false;
            console.log('✅ OpenCV.js successfully initialized in client browser runtime');
            resolve(true);
          } else {
            setTimeout(checkCv, 100);
          }
        };
        checkCv();
      };

      script.onerror = (err) => {
        console.warn('⚠️ OpenCV.js failed to load from /js/opencv.js:', err);
        this.isLoading = false;
        resolve(false);
      };

      document.body.appendChild(script);
    });
  }

  public isOpenCVReady(): boolean {
    return this.isLoaded && !!window.cv && !!window.cv.Mat;
  }

  public getLastMetrics(): OpenCVFrameMetrics {
    return this.lastMetrics;
  }

  /**
   * Process a live video frame using OpenCV.js
   * - Resolution normalization (scaled down for fast WebAssembly throughput)
   * - Brightness calculation (mean intensity)
   * - Blur estimation (Laplacian variance)
   * - Frame difference and Optical Flow motion estimation
   * - Strict memory cleanup (calling .delete() on all Mats)
   */
  public processVideoFrame(video: HTMLVideoElement): OpenCVFrameMetrics {
    if (!this.isOpenCVReady() || !this.offscreenCanvas || !this.offscreenCtx) {
      return this.lastMetrics;
    }

    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      return this.lastMetrics;
    }

    const tStart = performance.now();
    const cv = window.cv;

    // Throttle OpenCV processing to ~20-25 FPS to save CPU
    const targetW = 320;
    const targetH = 180;

    this.offscreenCanvas.width = targetW;
    this.offscreenCanvas.height = targetH;
    this.offscreenCtx.drawImage(video, 0, 0, targetW, targetH);

    let srcMat: any = null;
    let grayMat: any = null;
    let laplacianMat: any = null;
    let meanMat: any = null;
    let stdDevMat: any = null;
    let diffMat: any = null;
    let threshMat: any = null;

    try {
      // 1. Read pixel buffer into OpenCV Mat
      const imageData = this.offscreenCtx.getImageData(0, 0, targetW, targetH);
      srcMat = cv.matFromImageData(imageData);

      // 2. Convert to Grayscale
      grayMat = new cv.Mat();
      cv.cvtColor(srcMat, grayMat, cv.COLOR_RGBA2GRAY);

      // 3. Brightness and Contrast via mean & meanStdDev
      meanMat = new cv.Mat();
      stdDevMat = new cv.Mat();
      cv.meanStdDev(grayMat, meanMat, stdDevMat);
      const brightnessVal = Math.round(meanMat.data64F[0]);
      const contrastVal = Math.round(stdDevMat.data64F[0]);

      let lightQual: 'GOOD' | 'LOW' | 'BRIGHT' = 'GOOD';
      if (brightnessVal < 45) lightQual = 'LOW';
      else if (brightnessVal > 215) lightQual = 'BRIGHT';

      // 4. Blur detection using Laplacian filter variance
      laplacianMat = new cv.Mat();
      cv.Laplacian(grayMat, laplacianMat, cv.CV_64F);
      const lapMean = new cv.Mat();
      const lapStdDev = new cv.Mat();
      cv.meanStdDev(laplacianMat, lapMean, lapStdDev);
      const blurVariance = Math.round(lapStdDev.data64F[0] * lapStdDev.data64F[0] * 10) / 10;
      lapMean.delete();
      lapStdDev.delete();

      let imgQual: 'GOOD' | 'BLURRY' | 'SUB-OPTIMAL' = 'GOOD';
      if (blurVariance < 50) imgQual = 'BLURRY';
      else if (blurVariance < 85) imgQual = 'SUB-OPTIMAL';

      // 5. Motion Estimation (Frame Differencing + Lucas-Kanade Optical Flow)
      let motionMag = 0;

      if (this.prevGrayMat && !this.prevGrayMat.isDeleted()) {
        // Frame Absolute Difference
        diffMat = new cv.Mat();
        cv.absdiff(grayMat, this.prevGrayMat, diffMat);

        threshMat = new cv.Mat();
        cv.threshold(diffMat, threshMat, 25, 255, cv.THRESH_BINARY);

        const diffMean = cv.mean(threshMat);
        // Non-zero pixel ratio mapped to 0.0 - 1.0
        const frameDiffRatio = diffMean[0] / 255;

        // Optical Flow via PyrLK on good features if available
        let opticalFlowMag = 0;
        try {
          if (this.frameCount % 5 === 0 || !this.prevPointsMat || this.prevPointsMat.rows === 0) {
            if (this.prevPointsMat && !this.prevPointsMat.isDeleted()) {
              this.prevPointsMat.delete();
            }
            this.prevPointsMat = new cv.Mat();
            cv.goodFeaturesToTrack(this.prevGrayMat, this.prevPointsMat, 20, 0.05, 10);
          }

          if (this.prevPointsMat && this.prevPointsMat.rows > 0) {
            const nextPoints = new cv.Mat();
            const status = new cv.Mat();
            const err = new cv.Mat();
            const winSize = new cv.Size(15, 15);
            const criteria = new cv.TermCriteria(cv.TERM_CRITERIA_EPS | cv.TERM_CRITERIA_COUNT, 10, 0.03);

            cv.calcOpticalFlowPyrLK(this.prevGrayMat, grayMat, this.prevPointsMat, nextPoints, status, err, winSize, 2, criteria);

            let totalDisplacement = 0;
            let validPoints = 0;
            for (let i = 0; i < status.rows; i++) {
              if (status.data[i] === 1) {
                const x0 = this.prevPointsMat.data32F[i * 2];
                const y0 = this.prevPointsMat.data32F[i * 2 + 1];
                const x1 = nextPoints.data32F[i * 2];
                const y1 = nextPoints.data32F[i * 2 + 1];
                const dist = Math.hypot(x1 - x0, y1 - y0);
                totalDisplacement += dist;
                validPoints++;
              }
            }

            if (validPoints > 0) {
              opticalFlowMag = totalDisplacement / (validPoints * 10);
            }

            nextPoints.delete();
            status.delete();
            err.delete();
          }
        } catch {
          // Optical flow fallback
          opticalFlowMag = frameDiffRatio * 2;
        }

        // Weighted motion combination
        motionMag = Math.round((frameDiffRatio * 0.6 + opticalFlowMag * 0.4) * 100) / 100;
      }

      let motionLvl: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
      if (motionMag > 0.22) motionLvl = 'HIGH';
      else if (motionMag > 0.06) motionLvl = 'MEDIUM';

      // Update previous gray frame (cleanup old one)
      if (this.prevGrayMat && !this.prevGrayMat.isDeleted()) {
        this.prevGrayMat.delete();
      }
      this.prevGrayMat = grayMat.clone();

      const tEnd = performance.now();
      const latencyMs = Math.round((tEnd - tStart) * 10) / 10;

      this.lastMetrics = {
        brightness: brightnessVal,
        contrast: contrastVal,
        lightQuality: lightQual,
        blurVariance,
        imageQuality: imgQual,
        motionMagnitude: motionMag,
        motionLevel: motionLvl,
        latencyMs,
      };

      this.frameCount++;
      this.lastProcessedTime = tEnd;
      return this.lastMetrics;
    } catch (err) {
      console.warn('OpenCV frame processing dropped:', err);
      return this.lastMetrics;
    } finally {
      // Memory cleanup: Delete all allocated Mats in finally block
      if (srcMat && !srcMat.isDeleted()) srcMat.delete();
      if (grayMat && !grayMat.isDeleted()) grayMat.delete();
      if (laplacianMat && !laplacianMat.isDeleted()) laplacianMat.delete();
      if (meanMat && !meanMat.isDeleted()) meanMat.delete();
      if (stdDevMat && !stdDevMat.isDeleted()) stdDevMat.delete();
      if (diffMat && !diffMat.isDeleted()) diffMat.delete();
      if (threshMat && !threshMat.isDeleted()) threshMat.delete();
    }
  }

  /**
   * Release all cached OpenCV matrices
   */
  public cleanup(): void {
    if (this.prevGrayMat && !this.prevGrayMat.isDeleted()) {
      this.prevGrayMat.delete();
      this.prevGrayMat = null;
    }
    if (this.prevPointsMat && !this.prevPointsMat.isDeleted()) {
      this.prevPointsMat.delete();
      this.prevPointsMat = null;
    }
  }
}

export const openCVVisionService = OpenCVVisionService.getInstance();
