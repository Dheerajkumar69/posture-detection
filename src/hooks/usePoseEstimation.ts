import { useState, useRef, useCallback, useEffect } from 'react';
import { PostureMode } from '../App';

// Ensure we load the necessary MediaPipe assets before rendering
// The URL path is relative to the app's root
const MEDIAPIPE_ASSETS_PATH = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose';

// Types for MediaPipe Pose results
export interface PoseLandmarkResult {
  poseLandmarks: {
    x: number;
    y: number;
    z: number;
    visibility?: number;
  }[];
}

// Type for posture feedback
export interface PoseFeedback {
  isGoodPosture: boolean;
  confidence: number;
  angles: {
    back: number;
    neck: number;
    knee: number;
  };
  issues: string[];
}

export function usePoseEstimation(mode: PostureMode) {
  const [results, setResults] = useState<PoseLandmarkResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [postureFeedback, setPostureFeedback] = useState<PoseFeedback | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const poseRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const videoRef = useRef<React.RefObject<HTMLVideoElement> | null>(null);
  
  // Initialize MediaPipe Pose
  useEffect(() => {
    let isMounted = true;
    
    const initMediaPipe = async () => {
      try {
        // Dynamic import to load MediaPipe only when needed
        const { Pose } = await import('@mediapipe/pose');
        
        if (!isMounted) return;
        
        poseRef.current = new Pose({
          locateFile: (file: string) => {
            return `${MEDIAPIPE_ASSETS_PATH}/${file}`;
          }
        });
        
        poseRef.current.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
        
        poseRef.current.onResults((results: PoseLandmarkResult) => {
          if (!isMounted) return;
          
          setResults(results);
          
          if (results?.poseLandmarks) {
            // Analyze posture based on landmarks
            const feedback = analyzePosture(results.poseLandmarks, mode);
            setPostureFeedback(feedback);
          }
        });
        
        setIsReady(true);
        
      } catch (err) {
        console.error('Error initializing MediaPipe:', err);
        setError('Failed to initialize pose detection.');
      }
    };
    
    initMediaPipe();
    
    return () => {
      isMounted = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);
  
  // Calculate angle between three points
  const calculateAngle = useCallback((a: any, b: any, c: any) => {
    if (!a || !b || !c) return 0;
    
    // Convert normalized coordinates (0-1) to vectors
    const ab = { x: b.x - a.x, y: b.y - a.y };
    const bc = { x: c.x - b.x, y: c.y - b.y };
    
    // Calculate dot product
    const dotProduct = ab.x * bc.x + ab.y * bc.y;
    
    // Calculate magnitudes
    const magnitudeAB = Math.sqrt(ab.x * ab.x + ab.y * ab.y);
    const magnitudeBC = Math.sqrt(bc.x * bc.x + bc.y * bc.y);
    
    // Calculate angle in radians and convert to degrees
    const angleRadians = Math.acos(dotProduct / (magnitudeAB * magnitudeBC));
    let angleDegrees = angleRadians * (180 / Math.PI);
    
    // Ensure the angle is always between 0 and 180
    if (angleDegrees > 180) {
      angleDegrees = 360 - angleDegrees;
    }
    
    return angleDegrees;
  }, []);
  
  // Get midpoint between two points
  const getMidpoint = useCallback((a: any, b: any) => {
    return {
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2,
      z: (a.z + b.z) / 2,
      visibility: Math.min(a.visibility || 0, b.visibility || 0)
    };
  }, []);
  
  // Analyze posture based on landmarks and mode
  const analyzePosture = useCallback((landmarks: any[], mode: PostureMode): PoseFeedback => {
    // Default feedback
    const feedback: PoseFeedback = {
      isGoodPosture: false,
      confidence: 0.8,
      angles: { back: 0, neck: 0, knee: 0 },
      issues: []
    };
    
    try {
      if (mode === 'squat') {
        // Analyze squat posture
        
        // Get key points
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];
        const leftHip = landmarks[23];
        const rightHip = landmarks[24];
        const leftKnee = landmarks[25];
        const rightKnee = landmarks[26];
        const leftAnkle = landmarks[27];
        const rightAnkle = landmarks[28];
        const leftFootIndex = landmarks[31];
        const rightFootIndex = landmarks[32];
        
        // Calculate midpoints
        const midShoulder = getMidpoint(leftShoulder, rightShoulder);
        const midHip = getMidpoint(leftHip, rightHip);
        const midAnkle = getMidpoint(leftAnkle, rightAnkle);
        const midFoot = getMidpoint(leftFootIndex, rightFootIndex);
        
        // Calculate angles
        // Back angle (hip-shoulder-ankle)
        const backAngle = calculateAngle(midAnkle, midHip, midShoulder);
        
        // Knee angle
        const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
        const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
        const kneeAngle = (leftKneeAngle + rightKneeAngle) / 2;
        
        // Neck angle approximation
        const leftEar = landmarks[7];
        const rightEar = landmarks[8];
        const midEar = getMidpoint(leftEar, rightEar);
        const neckAngle = calculateAngle(midShoulder, midEar, { x: midEar.x, y: 0, z: 0, visibility: 1 });
        
        // Store calculated angles
        feedback.angles.back = backAngle;
        feedback.angles.knee = kneeAngle;
        feedback.angles.neck = neckAngle;
        
        // Check knee ahead of toe (X position comparison)
        const kneeAvgX = (leftKnee.x + rightKnee.x) / 2;
        const toeAvgX = (leftFootIndex.x + rightFootIndex.x) / 2;
        const kneeAheadOfToe = kneeAvgX < toeAvgX; // In MediaPipe's coordinate system
        
        // Rule-based evaluation
        // Rule 1: Back angle should be >= 150° for good squat form
        if (backAngle < 150) {
          feedback.issues.push("Back leaning forward");
        }
        
        // Rule 2: Knee should not go ahead of toe
        if (kneeAheadOfToe) {
          feedback.issues.push("Knee ahead of toe");
        }
        
        // Rule 3: Knee angle should be between 80-120° at squat
        if (kneeAngle < 80 || kneeAngle > 120) {
          feedback.issues.push("Improper squat depth");
        }
        
      } else if (mode === 'desk') {
        // Analyze desk sitting posture
        
        // Get key points
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];
        const leftHip = landmarks[23];
        const rightHip = landmarks[24];
        const leftEar = landmarks[7];
        const rightEar = landmarks[8];
        const nose = landmarks[0];
        
        // Calculate midpoints
        const midShoulder = getMidpoint(leftShoulder, rightShoulder);
        const midHip = getMidpoint(leftHip, rightHip);
        const midEar = getMidpoint(leftEar, rightEar);
        
        // Back angle (vertical line to hip-shoulder line)
        const backAngle = 180 - calculateAngle(
          { x: midShoulder.x, y: 0, z: 0, visibility: 1 },
          midShoulder,
          midHip
        );
        
        // Neck angle (forward head posture)
        const neckAngle = calculateAngle(
          midShoulder,
          midEar,
          nose
        );
        
        // Store calculated angles
        feedback.angles.back = backAngle;
        feedback.angles.neck = neckAngle;
        feedback.angles.knee = 90; // Not relevant for desk posture
        
        // Rule-based evaluation for desk sitting
        
        // Rule 1: Neck should not be bent forward > 30°
        if (neckAngle > 30) {
          feedback.issues.push("Neck bent forward");
        }
        
        // Rule 2: Back should be relatively straight (~160-180°)
        if (backAngle < 160) {
          feedback.issues.push("Back hunched");
        }
      }
      
      // Set overall posture status
      feedback.isGoodPosture = feedback.issues.length === 0;
      
    } catch (err) {
      console.error('Error analyzing posture:', err);
      feedback.issues.push('Analysis error');
    }
    
    return feedback;
  }, [calculateAngle, getMidpoint]);
  
  // Process video frames with MediaPipe
  const processFrame = useCallback(async () => {
    if (!poseRef.current || !videoRef.current || !videoRef.current.current || !isReady) {
      rafRef.current = requestAnimationFrame(processFrame);
      return;
    }
    
    const video = videoRef.current.current;
    
    if (video.readyState < 2) {
      rafRef.current = requestAnimationFrame(processFrame);
      return;
    }
    
    try {
      setIsProcessing(true);
      await poseRef.current.send({ image: video });
    } catch (err) {
      console.error('Error processing frame:', err);
    } finally {
      setIsProcessing(false);
      rafRef.current = requestAnimationFrame(processFrame);
    }
  }, [isReady]);
  
  // Start pose detection
  const startPoseDetection = useCallback((vidRef: React.RefObject<HTMLVideoElement>) => {
    if (!isReady) return;
    
    videoRef.current = vidRef;
    
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(processFrame);
  }, [isReady, processFrame]);
  
  // Stop pose detection
  const stopPoseDetection = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    
    videoRef.current = null;
    setResults(null);
    setPostureFeedback(null);
  }, []);

  return {
    results,
    isProcessing,
    postureFeedback,
    error,
    startPoseDetection,
    stopPoseDetection
  };
} 