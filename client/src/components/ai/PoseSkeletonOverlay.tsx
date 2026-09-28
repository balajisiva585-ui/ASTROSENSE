import React, { useEffect, useRef } from 'react';
import { ActivityType } from '../../types';

interface PoseSkeletonOverlayProps {
  activity: ActivityType;
  confidence: number;
  width?: number;
  height?: number;
  customVideoRef?: React.RefObject<HTMLVideoElement>;
}

export const PoseSkeletonOverlay: React.FC<PoseSkeletonOverlayProps> = ({
  activity,
  confidence,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const t = Date.now() / 1000;

      // Draw subtle futuristic scanlines & grid
      ctx.fillStyle = 'rgba(0, 242, 254, 0.015)';
      ctx.fillRect(0, 0, w, h);

      // Target bounding box calculations
      let bbox = { x: w * 0.3, y: h * 0.15, w: w * 0.4, h: h * 0.75 };
      if (activity === 'SLEEPING_RESTING') {
        bbox = { x: w * 0.15, y: h * 0.35, w: w * 0.7, h: h * 0.35 };
      } else if (activity === 'FALL_ABNORMAL_MOVEMENT') {
        bbox = { x: w * 0.25, y: h * 0.3, w: w * 0.55, h: h * 0.6 };
      }

      // Draw Bounding Box with corner brackets
      const isCritical = activity === 'FALL_ABNORMAL_MOVEMENT';
      const isWarning = activity === 'LONG_INACTIVITY';
      const themeColor = isCritical ? '#f43f5e' : isWarning ? '#f59e0b' : '#00f2fe';

      ctx.strokeStyle = themeColor;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([]);

      const cornerLen = 16;
      // Top-Left
      ctx.beginPath();
      ctx.moveTo(bbox.x, bbox.y + cornerLen);
      ctx.lineTo(bbox.x, bbox.y);
      ctx.lineTo(bbox.x + cornerLen, bbox.y);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(bbox.x + bbox.w - cornerLen, bbox.y);
      ctx.lineTo(bbox.x + bbox.w, bbox.y);
      ctx.lineTo(bbox.x + bbox.w, bbox.y + cornerLen);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(bbox.x, bbox.y + bbox.h - cornerLen);
      ctx.lineTo(bbox.x, bbox.y + bbox.h);
      ctx.lineTo(bbox.x + cornerLen, bbox.y + bbox.h);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(bbox.x + bbox.w - cornerLen, bbox.y + bbox.h);
      ctx.lineTo(bbox.x + bbox.w, bbox.y + bbox.h);
      ctx.lineTo(bbox.x + bbox.w, bbox.y + bbox.h - cornerLen);
      ctx.stroke();

      // Target Label
      ctx.fillStyle = themeColor;
      ctx.font = '10px ui-monospace, Menlo, monospace';
      ctx.fillText(
        `TARGET: AST-01 | CONF: ${confidence.toFixed(1)}%`,
        bbox.x + 4,
        bbox.y - 6 > 14 ? bbox.y - 6 : bbox.y + 14
      );

      // Skeleton Keypoints computation
      let head = { x: w * 0.5, y: h * 0.22 };
      let neck = { x: w * 0.5, y: h * 0.3 };
      let lShoulder = { x: w * 0.42, y: h * 0.32 };
      let rShoulder = { x: w * 0.58, y: h * 0.32 };
      let lElbow = { x: w * 0.36, y: h * 0.46 };
      let rElbow = { x: w * 0.64, y: h * 0.46 };
      let lWrist = { x: w * 0.32, y: h * 0.58 };
      let rWrist = { x: w * 0.68, y: h * 0.58 };
      let spine = { x: w * 0.5, y: h * 0.45 };
      let lHip = { x: w * 0.44, y: h * 0.6 };
      let rHip = { x: w * 0.56, y: h * 0.6 };
      let lKnee = { x: w * 0.43, y: h * 0.76 };
      let rKnee = { x: w * 0.57, y: h * 0.76 };
      let lAnkle = { x: w * 0.43, y: h * 0.9 };
      let rAnkle = { x: w * 0.57, y: h * 0.9 };

      // Activity-specific dynamic postures
      switch (activity) {
        case 'WALKING': {
          const swing = Math.sin(t * 3) * (w * 0.06);
          lAnkle = { x: w * 0.43 + swing, y: h * 0.88 - Math.abs(swing) * 0.3 };
          rAnkle = { x: w * 0.57 - swing, y: h * 0.88 + Math.abs(swing) * 0.3 };
          lKnee = { x: w * 0.43 + swing * 0.6, y: h * 0.75 };
          rKnee = { x: w * 0.57 - swing * 0.6, y: h * 0.75 };
          lWrist = { x: w * 0.34 - swing * 0.8, y: h * 0.55 };
          rWrist = { x: w * 0.66 + swing * 0.8, y: h * 0.55 };
          break;
        }
        case 'EXERCISING': {
          const squat = Math.sin(t * 2) * (h * 0.08);
          head = { x: w * 0.5, y: h * 0.22 + squat };
          neck = { x: w * 0.5, y: h * 0.3 + squat };
          lShoulder = { x: w * 0.4, y: h * 0.34 + squat };
          rShoulder = { x: w * 0.6, y: h * 0.34 + squat };
          lElbow = { x: w * 0.3, y: h * 0.28 + squat };
          rElbow = { x: w * 0.7, y: h * 0.28 + squat };
          lWrist = { x: w * 0.32, y: h * 0.2 + squat };
          rWrist = { x: w * 0.68, y: h * 0.2 + squat };
          spine = { x: w * 0.5, y: h * 0.46 + squat * 1.1 };
          lHip = { x: w * 0.42, y: h * 0.62 + squat * 1.2 };
          rHip = { x: w * 0.58, y: h * 0.62 + squat * 1.2 };
          lKnee = { x: w * 0.36, y: h * 0.76 + squat * 0.6 };
          rKnee = { x: w * 0.64, y: h * 0.76 + squat * 0.6 };
          break;
        }
        case 'WORKING':
        case 'OPERATING_EQUIPMENT': {
          const typeShift = Math.sin(t * 5) * (w * 0.015);
          lElbow = { x: w * 0.38, y: h * 0.48 };
          rElbow = { x: w * 0.62, y: h * 0.48 };
          lWrist = { x: w * 0.45 + typeShift, y: h * 0.52 };
          rWrist = { x: w * 0.55 - typeShift, y: h * 0.52 };
          break;
        }
        case 'EATING':
        case 'DRINKING': {
          const lift = Math.abs(Math.sin(t * 1.2)) * (h * 0.15);
          rElbow = { x: w * 0.62, y: h * 0.42 };
          rWrist = { x: w * 0.52, y: h * 0.3 - lift };
          break;
        }
        case 'SITTING':
        case 'LONG_INACTIVITY': {
          head = { x: w * 0.5, y: h * 0.28 };
          neck = { x: w * 0.5, y: h * 0.36 };
          lShoulder = { x: w * 0.43, y: h * 0.38 };
          rShoulder = { x: w * 0.57, y: h * 0.38 };
          spine = { x: w * 0.5, y: h * 0.52 };
          lHip = { x: w * 0.44, y: h * 0.64 };
          rHip = { x: w * 0.56, y: h * 0.64 };
          lKnee = { x: w * 0.36, y: h * 0.72 };
          rKnee = { x: w * 0.64, y: h * 0.72 };
          lAnkle = { x: w * 0.36, y: h * 0.9 };
          rAnkle = { x: w * 0.64, y: h * 0.9 };
          break;
        }
        case 'SLEEPING_RESTING': {
          head = { x: w * 0.22, y: h * 0.5 };
          neck = { x: w * 0.3, y: h * 0.5 };
          lShoulder = { x: w * 0.38, y: h * 0.46 };
          rShoulder = { x: w * 0.38, y: h * 0.54 };
          lElbow = { x: w * 0.46, y: h * 0.45 };
          rElbow = { x: w * 0.46, y: h * 0.55 };
          lWrist = { x: w * 0.52, y: h * 0.47 };
          rWrist = { x: w * 0.52, y: h * 0.53 };
          spine = { x: w * 0.5, y: h * 0.5 };
          lHip = { x: w * 0.62, y: h * 0.47 };
          rHip = { x: w * 0.62, y: h * 0.53 };
          lKnee = { x: w * 0.74, y: h * 0.48 };
          rKnee = { x: w * 0.74, y: h * 0.52 };
          lAnkle = { x: w * 0.86, y: h * 0.48 };
          rAnkle = { x: w * 0.86, y: h * 0.52 };
          break;
        }
        case 'FALL_ABNORMAL_MOVEMENT': {
          head = { x: w * 0.35, y: h * 0.72 };
          neck = { x: w * 0.42, y: h * 0.66 };
          lShoulder = { x: w * 0.4, y: h * 0.62 };
          rShoulder = { x: w * 0.5, y: h * 0.7 };
          lElbow = { x: w * 0.32, y: h * 0.54 };
          rElbow = { x: w * 0.6, y: h * 0.62 };
          lWrist = { x: w * 0.25, y: h * 0.48 };
          rWrist = { x: w * 0.68, y: h * 0.56 };
          spine = { x: w * 0.52, y: h * 0.56 };
          lHip = { x: w * 0.58, y: h * 0.5 };
          rHip = { x: w * 0.66, y: h * 0.54 };
          lKnee = { x: w * 0.72, y: h * 0.4 };
          rKnee = { x: w * 0.78, y: h * 0.46 };
          lAnkle = { x: w * 0.82, y: h * 0.32 };
          rAnkle = { x: w * 0.88, y: h * 0.38 };
          break;
        }
      }

      // Bone connections
      const bones = [
        [head, neck],
        [neck, spine],
        [neck, lShoulder],
        [neck, rShoulder],
        [lShoulder, lElbow],
        [lElbow, lWrist],
        [rShoulder, rElbow],
        [rElbow, rWrist],
        [spine, lHip],
        [spine, rHip],
        [lHip, lKnee],
        [lKnee, lAnkle],
        [rHip, rKnee],
        [rKnee, rAnkle],
      ];

      // Draw glowing bones
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isCritical ? '#f43f5e' : isWarning ? '#f59e0b' : '#00f2fe';
      ctx.shadowColor = isCritical ? 'rgba(244, 63, 94, 0.8)' : '#00f2fe';
      ctx.shadowBlur = 8;

      bones.forEach(([p1, p2]) => {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });

      // Draw Keypoint Joint nodes
      ctx.shadowBlur = 4;
      const joints = [
        head, neck, spine,
        lShoulder, rShoulder,
        lElbow, rElbow,
        lWrist, rWrist,
        lHip, rHip,
        lKnee, rKnee,
        lAnkle, rAnkle,
      ];

      joints.forEach(j => {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(j.x, j.y, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = themeColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(j.x, j.y, 6, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Reset shadow
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activity, confidence]);

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={360}
      className="absolute inset-0 w-full h-full pointer-events-none z-20"
    />
  );
};
