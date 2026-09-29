import React, { useRef, useEffect } from 'react';
import { VisionLandmark, ActivityDetectionResult } from '../../types';

interface PoseOverlayProps {
  landmarks: VisionLandmark[][] | null;
  result: ActivityDetectionResult | null;
  showSkeleton?: boolean;
  showAngles?: boolean;
  mirror?: boolean;
}

const POSE_CONNECTIONS: [number, number][] = [
  // Torso
  [11, 12],
  [12, 24],
  [24, 23],
  [23, 11],
  // Left Arm
  [11, 13],
  [13, 15],
  [15, 17],
  [15, 19],
  [15, 21],
  // Right Arm
  [12, 14],
  [14, 16],
  [16, 18],
  [16, 20],
  [16, 22],
  // Left Leg
  [23, 25],
  [25, 27],
  [27, 29],
  [27, 31],
  // Right Leg
  [24, 26],
  [26, 28],
  [28, 30],
  [28, 32],
  // Face / Head
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 7],
  [0, 4],
  [4, 5],
  [5, 6],
  [6, 8],
  [9, 10],
];

export const PoseOverlay: React.FC<PoseOverlayProps> = ({
  landmarks,
  result,
  showSkeleton = true,
  showAngles = true,
  mirror = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dynamically match canvas internal resolution to rendered display size
    const rect = canvas.getBoundingClientRect();
    const width = Math.floor(rect.width) || 640;
    const height = Math.floor(rect.height) || 360;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    // 100% transparent clear
    ctx.clearRect(0, 0, width, height);

    if (!landmarks || landmarks.length === 0 || !showSkeleton) return;

    landmarks.forEach((personLandmarks, pIndex) => {
      if (!personLandmarks || personLandmarks.length < 15) return;

      const isPrimary = pIndex === 0;
      const isAnomaly = result?.isAnomaly ?? false;
      const mainColor = isAnomaly ? '#ef4444' : isPrimary ? '#00f0ff' : '#a855f7';
      const glowColor = isAnomaly
        ? 'rgba(239, 68, 68, 0.4)'
        : isPrimary
        ? 'rgba(0, 240, 255, 0.35)'
        : 'rgba(168, 85, 247, 0.3)';

      // Draw Sci-Fi Connection Bones
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = mainColor;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 8;

      POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
        const start = personLandmarks[startIdx];
        const end = personLandmarks[endIdx];

        if (
          start &&
          end &&
          (start.visibility ?? 1) > 0.35 &&
          (end.visibility ?? 1) > 0.35
        ) {
          const sx = mirror ? (1 - start.x) * width : start.x * width;
          const sy = start.y * height;
          const ex = mirror ? (1 - end.x) * width : end.x * width;
          const ey = end.y * height;

          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex, ey);
          ctx.stroke();
        }
      });

      // Draw Keypoint Landmarks
      personLandmarks.forEach((point, idx) => {
        if (!point || (point.visibility ?? 1) <= 0.35) return;

        const x = mirror ? (1 - point.x) * width : point.x * width;
        const y = point.y * height;

        const isMajorJoint = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].includes(idx);
        const radius = isMajorJoint ? 4.5 : 2.5;

        // Outer glow circle
        ctx.fillStyle = mainColor;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner white core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.45, 0, Math.PI * 2);
        ctx.fill();
      });

      // Bounding Box & HUD Marker for Primary Subject
      if (isPrimary && result) {
        let minX = 1;
        let maxX = 0;
        let minY = 1;
        let maxY = 0;

        personLandmarks.forEach((p) => {
          if ((p.visibility ?? 1) > 0.35) {
            const px = mirror ? 1 - p.x : p.x;
            minX = Math.min(minX, px);
            maxX = Math.max(maxX, px);
            minY = Math.min(minY, p.y);
            maxY = Math.max(maxY, p.y);
          }
        });

        if (maxX > minX && maxY > minY) {
          const pad = 14;
          const bx = Math.max(0, minX * width - pad);
          const by = Math.max(0, minY * height - pad);
          const bw = Math.min(width - bx, (maxX - minX) * width + pad * 2);
          const bh = Math.min(height - by, (maxY - minY) * height + pad * 2);

          // Sci-Fi Corner Brackets
          ctx.strokeStyle = mainColor;
          ctx.lineWidth = 2;
          ctx.shadowBlur = 6;
          const corner = 14;

          // Top Left
          ctx.beginPath();
          ctx.moveTo(bx, by + corner);
          ctx.lineTo(bx, by);
          ctx.lineTo(bx + corner, by);
          ctx.stroke();

          // Top Right
          ctx.beginPath();
          ctx.moveTo(bx + bw - corner, by);
          ctx.lineTo(bx + bw, by);
          ctx.lineTo(bx + bw, by + corner);
          ctx.stroke();

          // Bottom Left
          ctx.beginPath();
          ctx.moveTo(bx, by + bh - corner);
          ctx.lineTo(bx, by + bh);
          ctx.lineTo(bx + corner, by + bh);
          ctx.stroke();

          // Bottom Right
          ctx.beginPath();
          ctx.moveTo(bx + bw - corner, by + bh);
          ctx.lineTo(bx + bw, by + bh);
          ctx.lineTo(bx + bw, by + bh - corner);
          ctx.stroke();

          // Top Sci-Fi Tag
          ctx.fillStyle = isAnomaly ? 'rgba(239, 68, 68, 0.9)' : 'rgba(0, 240, 255, 0.85)';
          ctx.fillRect(bx, Math.max(0, by - 18), Math.min(bw, 200), 18);
          ctx.fillStyle = '#060d17';
          ctx.font = 'bold 10px monospace';
          ctx.shadowBlur = 0;
          ctx.fillText(
            `POSE LOCK // [${result.displayedActivity}] ${result.confidence}%`,
            bx + 4,
            Math.max(12, by - 5)
          );

          // Display Joint Angle annotations
          if (showAngles && result.features) {
            ctx.fillStyle = 'rgba(0, 240, 255, 0.95)';
            ctx.font = '9px monospace';

            // Knee Angle
            const lk = personLandmarks[25];
            if (lk && (lk.visibility ?? 1) > 0.4) {
              const kx = mirror ? (1 - lk.x) * width : lk.x * width;
              const ky = lk.y * height;
              ctx.fillText(`KNEE: ${result.features.avgKneeAngle}°`, kx + 8, ky);
            }

            // Torso Tilt
            const ls = personLandmarks[11];
            if (ls && (ls.visibility ?? 1) > 0.4) {
              const sx = mirror ? (1 - ls.x) * width : ls.x * width;
              const sy = ls.y * height;
              ctx.fillText(`TILT: ${result.features.torsoTiltAngle}°`, sx + 8, sy - 8);
            }
          }
        }
      }
    });
  }, [landmarks, result, showSkeleton, showAngles, mirror]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10 w-full h-full bg-transparent"
    />
  );
};
