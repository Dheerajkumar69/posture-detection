import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Square, RotateCcw, Download, Upload, X, AlertCircle } from 'lucide-react';

interface CameraRecorderProps {
  onVideoReady: (file: File) => void;
  onClose: () => void;
  mode: 'squat' | 'desk';
}

const CameraRecorder: React.FC<CameraRecorderProps> = ({ onVideoReady, onClose, mode }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Initialize camera on component mount
  useEffect(() => {
    initializeCamera();
    return () => {
      cleanup();
    };
  }, []);

  const initializeCamera = useCallback(async () => {
    try {
      setError(null);
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
          setCameraReady(true);
          videoRef.current?.play().catch(console.error);
        };
      }
    } catch (err) {
      console.error('Camera initialization error:', err);
      setError('Unable to access camera. Please check permissions and try again.');
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!stream) return;

    try {
      recordedChunksRef.current = [];
      setRecordedVideoUrl(null);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
          ? 'video/webm;codecs=vp9' 
          : 'video/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const chunks = recordedChunksRef.current;
        if (chunks.length === 0) return;
        
        const blob = new Blob(chunks, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        setRecordedVideoUrl(videoUrl);
        
        // Stop camera stream after recording
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
          setCameraReady(false);
        }
      };

      // Start recording timer
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      mediaRecorder.start(1000);
      setIsRecording(true);
    } catch (err) {
      console.error('Recording start error:', err);
      setError('Failed to start recording. Please try again.');
    }
  }, [stream]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  }, [isRecording]);

  const retakeVideo = useCallback(() => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
      setRecordedVideoUrl(null);
    }
    setRecordingTime(0);
    initializeCamera();
  }, [recordedVideoUrl, initializeCamera]);

  const uploadVideo = useCallback(() => {
    if (!recordedVideoUrl) return;
    
    fetch(recordedVideoUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'recorded-video.webm', { type: 'video/webm' });
        onVideoReady(file);
      })
      .catch(err => {
        console.error('Upload error:', err);
        setError('Failed to prepare video for upload.');
      });
  }, [recordedVideoUrl, onVideoReady]);

  const downloadVideo = useCallback(() => {
    if (!recordedVideoUrl) return;
    
    const a = document.createElement('a');
    a.href = recordedVideoUrl;
    a.download = `posture-recording-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [recordedVideoUrl]);

  const cleanup = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
    }
  }, [stream, recordedVideoUrl]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const modeColor = mode === 'squat' ? 'blue' : 'emerald';

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-4">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-800">Camera Error</h3>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex space-x-3">
            <button
              onClick={initializeCamera}
              className={`flex-1 px-4 py-2 bg-${modeColor}-600 text-white rounded-lg hover:bg-${modeColor}-700 transition-colors`}
            >
              Try Again
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black bg-opacity-50 text-white">
        <button
          onClick={onClose}
          className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-semibold">
            {mode === 'squat' ? 'Squat Analysis' : 'Desk Posture'}
          </h2>
          <p className="text-sm text-gray-300">
            {mode === 'squat' 
              ? 'Perform 3-5 slow squats facing the camera' 
              : 'Sit naturally at your desk, side view to camera'
            }
          </p>
          {isRecording && (
            <div className="text-sm text-red-400 flex items-center justify-center">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
              {formatTime(recordingTime)}
            </div>
          )}
        </div>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        {!recordedVideoUrl ? (
          /* Live Camera View */
          <div className="relative w-full h-full max-w-2xl max-h-full">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover rounded-lg"
              style={{ transform: 'scaleX(-1)' }}
            />
            
            {!cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg">
                <div className="text-white text-center">
                  <Camera className="w-12 h-12 mx-auto mb-4 animate-pulse" />
                  <p>Initializing camera...</p>
                </div>
              </div>
            )}

            {/* Recording Overlay */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                REC {formatTime(recordingTime)}
              </div>
            )}

            {/* Mode Indicator */}
            <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {mode === 'squat' ? 'Squat Mode' : 'Desk Mode'}
            </div>
          </div>
        ) : (
          /* Recorded Video Preview */
          <div className="relative w-full h-full max-w-2xl max-h-full">
            <video
              src={recordedVideoUrl}
              controls
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Recording Complete
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="p-6 bg-black bg-opacity-50">
        {!recordedVideoUrl ? (
          /* Recording Controls */
          <div className="flex items-center justify-center space-x-8">
            {cameraReady && !isRecording && (
              <button
                onClick={startRecording}
                className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg"
              >
                <div className="w-6 h-6 bg-white rounded-full"></div>
              </button>
            )}
            
            {isRecording && (
              <button
                onClick={stopRecording}
                className="w-20 h-20 bg-red-600 rounded-lg flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg"
              >
                <Square className="w-8 h-8 text-white fill-current" />
              </button>
            )}
          </div>
        ) : (
          /* Post-Recording Controls */
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={retakeVideo}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Retake</span>
            </button>
            
            <button
              onClick={downloadVideo}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Download</span>
            </button>
            
            <button
              onClick={uploadVideo}
              className={`flex items-center space-x-2 px-8 py-3 bg-${modeColor}-600 text-white rounded-lg hover:bg-${modeColor}-700 transition-colors font-semibold`}
            >
              <Upload className="w-5 h-5" />
              <span>Use This Video</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraRecorder;