import React, { useRef, useEffect } from 'react';
import { PostureMode } from '../App';
import { PoseFeedback, PoseLandmarkResult } from '../hooks/usePoseEstimation';

interface CanvasOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  poseResults: PoseLandmarkResult | null;
  postureFeedback: PoseFeedback | null;
  mode: PostureMode;
  onFpsUpdate: (fps: number) => void;
}

const CanvasOverlay: React.FC<CanvasOverlayProps> = ({ 
  videoRef, 
  poseResults,
  postureFeedback,
  mode,
  onFpsUpdate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(0);
  
  // Connection lines for skeleton drawing
  const connections = [
    // Torso
    [11, 12], // Left shoulder to right shoulder
    [11, 23], // Left shoulder to left hip
    [12, 24], // Right shoulder to right hip
    [23, 24], // Left hip to right hip
    
    // Left arm
    [11, 13], // Left shoulder to left elbow
    [13, 15], // Left elbow to left wrist
    
    // Right arm
    [12, 14], // Right shoulder to right elbow
    [14, 16], // Right elbow to right wrist
    
    // Left leg
    [23, 25], // Left hip to left knee
    [25, 27], // Left knee to left ankle
    [27, 31], // Left ankle to left foot index
    
    // Right leg
    [24, 26], // Right hip to right knee
    [26, 28], // Right knee to right ankle
    [28, 32], // Right ankle to right foot index
    
    // Face
    [0, 1],  // Nose to left eye inner
    [0, 4],  // Nose to right eye inner
    [1, 2],  // Left eye inner to left eye
    [2, 3],  // Left eye to left eye outer
    [4, 5],  // Right eye inner to right eye
    [5, 6],  // Right eye to right eye outer
    [9, 10], // Mouth left to mouth right
  ];

  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const render = (timestamp: number) => {
      // Calculate FPS
      if (lastTimeRef.current) {
        const delta = timestamp - lastTimeRef.current;
        frameCountRef.current++;
        
        if (timestamp - lastFpsUpdateRef.current > 1000) { // Update every second
          const fps = Math.round((frameCountRef.current * 1000) / (timestamp - lastFpsUpdateRef.current));
          onFpsUpdate(fps);
          lastFpsUpdateRef.current = timestamp;
          frameCountRef.current = 0;
        }
      }
      
      lastTimeRef.current = timestamp;
      
      // Ensure canvas matches video dimensions
      if (canvas.width !== video.clientWidth || canvas.height !== video.clientHeight) {
        canvas.width = video.clientWidth;
        canvas.height = video.clientHeight;
      }
      
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (poseResults?.poseLandmarks) {
        drawSkeleton(ctx, poseResults.poseLandmarks, canvas.width, canvas.height);
        
        // Draw posture feedback text
        if (postureFeedback) {
          drawPostureFeedback(ctx, postureFeedback, canvas.width, canvas.height);
        }
      }
      
      animationFrameId = requestAnimationFrame(render);
    };
    
    animationFrameId = requestAnimationFrame(render);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [videoRef, poseResults, postureFeedback]);
  
  const drawSkeleton = (
    ctx: CanvasRenderingContext2D, 
    landmarks: { x: number, y: number, z: number, visibility?: number }[], 
    canvasWidth: number, 
    canvasHeight: number
  ) => {
    // Draw connections first (lines of the skeleton)
    ctx.lineWidth = 4;
    ctx.strokeStyle = postureFeedback?.isGoodPosture ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)';
    
    connections.forEach(([i, j]) => {
      const point1 = landmarks[i];
      const point2 = landmarks[j];
      
      if (point1.visibility && point2.visibility && 
          point1.visibility > 0.5 && point2.visibility > 0.5) {
        
        ctx.beginPath();
        ctx.moveTo(point1.x * canvasWidth, point1.y * canvasHeight);
        ctx.lineTo(point2.x * canvasWidth, point2.y * canvasHeight);
        ctx.stroke();
      }
    });
    
    // Then draw the landmarks (dots)
    landmarks.forEach((landmark, i) => {
      if (landmark.visibility && landmark.visibility > 0.5) {
        const x = landmark.x * canvasWidth;
        const y = landmark.y * canvasHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
        
        // Draw smaller inner circle
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = postureFeedback?.isGoodPosture ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';
        ctx.fill();
        
        // Optionally display landmark index for debugging
        // ctx.fillText(i.toString(), x + 5, y - 5);
      }
    });
    
    // Draw angles based on the mode
    if (mode === 'squat' && postureFeedback?.angles) {
      // Draw knee angle
      drawAngle(ctx, landmarks[23], landmarks[25], landmarks[27], 
        canvasWidth, canvasHeight, `${Math.round(postureFeedback.angles.knee)}°`);
      
      // Draw back angle
      const midShoulder = getMidpoint(landmarks[11], landmarks[12]);
      const midHip = getMidpoint(landmarks[23], landmarks[24]);
      const midAnkle = getMidpoint(landmarks[27], landmarks[28]);
      
      drawAngle(ctx, midAnkle, midHip, midShoulder, 
        canvasWidth, canvasHeight, `${Math.round(postureFeedback.angles.back)}°`);
    } else if (mode === 'desk' && postureFeedback?.angles) {
      // Draw neck angle
      const midShoulder = getMidpoint(landmarks[11], landmarks[12]);
      const midEar = getMidpoint(landmarks[7], landmarks[8]);
      drawAngle(ctx, landmarks[0], midEar, midShoulder, 
        canvasWidth, canvasHeight, `${Math.round(postureFeedback.angles.neck)}°`);
        
      // Draw back angle
      const midShoulder2 = getMidpoint(landmarks[11], landmarks[12]);
      const midHip = getMidpoint(landmarks[23], landmarks[24]);
      
      drawAngle(ctx, { x: midShoulder2.x, y: 0 }, midShoulder2, midHip, 
        canvasWidth, canvasHeight, `${Math.round(postureFeedback.angles.back)}°`);
    }
  };
  
  const getMidpoint = (point1: any, point2: any) => {
    return {
      x: (point1.x + point2.x) / 2,
      y: (point1.y + point2.y) / 2,
      z: (point1.z + point2.z) / 2,
      visibility: Math.min(point1.visibility || 0, point2.visibility || 0)
    };
  };
  
  const drawAngle = (
    ctx: CanvasRenderingContext2D,
    p1: any, 
    p2: any, 
    p3: any, 
    canvasWidth: number, 
    canvasHeight: number,
    label: string
  ) => {
    if (p1.visibility > 0.5 && p2.visibility > 0.5 && p3.visibility > 0.5) {
      const x2 = p2.x * canvasWidth;
      const y2 = p2.y * canvasHeight;
      
      // Calculate the midpoint for the angle label
      const midX = (p1.x + p2.x + p3.x) / 3 * canvasWidth;
      const midY = (p1.y + p2.y + p3.y) / 3 * canvasHeight;
      
      // Draw angle text with background
      ctx.font = "16px Arial";
      const textWidth = ctx.measureText(label).width;
      const padding = 4;
      
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(
        midX - textWidth/2 - padding, 
        midY - 8 - padding, 
        textWidth + padding*2, 
        16 + padding*2
      );
      
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, midX, midY);
    }
  };
  
  const drawPostureFeedback = (
    ctx: CanvasRenderingContext2D,
    feedback: PoseFeedback,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    const padding = 16;
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    if (feedback.isGoodPosture) {
      // Draw green "Good Posture" message
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(
        canvasWidth/2 - 100,
        padding,
        200,
        40
      );
      
      ctx.fillStyle = "rgb(34, 197, 94)";
      ctx.fillText("✓ Good Posture", canvasWidth/2, padding + 20);
    } else {
      // Draw issues
      const issueHeight = 40;
      const totalHeight = feedback.issues.length * issueHeight;
      
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(
        canvasWidth/2 - 150,
        padding,
        300,
        totalHeight
      );
      
      ctx.fillStyle = "rgb(239, 68, 68)";
      feedback.issues.forEach((issue, i) => {
        ctx.fillText(`⚠ ${issue}`, canvasWidth/2, padding + i * issueHeight + issueHeight/2);
      });
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      style={{ transform: 'scaleX(-1)' }}
    />
  );
};

export default CanvasOverlay; 