import React, { useRef, useEffect, useState } from 'react';
import { Camera, XCircle } from 'lucide-react';
import CanvasOverlay from './CanvasOverlay';
import { usePoseEstimation } from '../hooks/usePoseEstimation';
import { PostureMode } from '../App';

interface LivePoseDetectorProps {
  mode: PostureMode;
  onClose: () => void;
}

const LivePoseDetector: React.FC<LivePoseDetectorProps> = ({ mode, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFps, setShowFps] = useState(false);
  const [fps, setFps] = useState(0);
  
  const {
    results,
    isProcessing,
    postureFeedback,
    startPoseDetection,
    stopPoseDetection
  } = usePoseEstimation(mode);

  useEffect(() => {
    initCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      stopPoseDetection();
    };
  }, []);

  const initCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: 'user'
        },
        audio: false
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => {
            setVideoReady(true);
            startPoseDetection(videoRef);
          }).catch(err => {
            console.error("Failed to play video:", err);
            setError("Failed to play video. Please try again.");
          });
        };
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Camera access denied. Please check permissions.");
    }
  };
  
  const modeColor = mode === 'squat' ? 'blue' : 'emerald';
  
  const getModeInstructions = () => {
    if (mode === 'squat') {
      return "Face the camera and perform slow, controlled squats";
    } else {
      return "Position yourself in profile view (side) to analyze your desk posture";
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black bg-opacity-50 text-white">
        <button
          onClick={onClose}
          className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
        >
          <XCircle className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-semibold">
            Live {mode === 'squat' ? 'Squat' : 'Desk Posture'} Analysis
          </h2>
          <p className="text-sm text-gray-300">
            {getModeInstructions()}
          </p>
          {showFps && (
            <div className="text-xs text-gray-400">FPS: {fps.toFixed(1)}</div>
          )}
        </div>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="relative w-full h-full max-w-2xl max-h-full">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 text-white p-4 text-center">
              <div>
                <div className="text-red-500 mb-2 text-xl">Error</div>
                <p>{error}</p>
                <button 
                  className={`mt-4 px-4 py-2 bg-${modeColor}-600 rounded-lg hover:bg-${modeColor}-700`}
                  onClick={initCamera}
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <>
              {!videoReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
                    <p>Initializing camera...</p>
                  </div>
                </div>
              )}
              
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
              
              {videoReady && (
                <CanvasOverlay 
                  videoRef={videoRef} 
                  poseResults={results}
                  postureFeedback={postureFeedback}
                  mode={mode}
                  onFpsUpdate={setFps}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-4 bg-black bg-opacity-50 flex justify-between items-center">
        <button
          onClick={() => setShowFps(!showFps)}
          className={`px-3 py-1 text-xs rounded-full ${
            showFps ? `bg-${modeColor}-600 text-white` : 'bg-gray-700 text-gray-300'
          }`}
        >
          {showFps ? 'Hide FPS' : 'Show FPS'}
        </button>
        
        {postureFeedback && (
          <div className={`text-sm font-medium ${
            postureFeedback.isGoodPosture ? 'text-green-400' : 'text-red-400'
          }`}>
            {postureFeedback.isGoodPosture ? 'Good Posture' : postureFeedback.issues.join(', ')}
          </div>
        )}
        
        <div></div> {/* Empty div for flex spacing */}
      </div>
    </div>
  );
};

export default LivePoseDetector; 