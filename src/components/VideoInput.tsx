import React, { useState, useRef, useCallback } from 'react';
import { Upload, Camera, Play, RotateCcw, Trash2, Activity } from 'lucide-react';
import { PostureMode } from '../App';
import CameraRecorder from './CameraRecorder';
import RecordingInstructions from './RecordingInstructions';
import LivePoseDetector from './LivePoseDetector';

interface VideoInputProps {
  onVideoUpload: (file: File) => void;
  videoFile: File | null;
  mode: PostureMode;
  onAnalyze: () => void;
  onReset: () => void;
  isAnalyzing: boolean;
  onError: (error: string) => void;
}

const VideoInput: React.FC<VideoInputProps> = ({ 
  onVideoUpload, 
  videoFile, 
  mode, 
  onAnalyze, 
  onReset, 
  isAnalyzing,
  onError
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showLivePoseDetection, setShowLivePoseDetection] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        onVideoUpload(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onVideoUpload(e.target.files[0]);
    }
  };

  const deleteRecording = useCallback(() => {
    onReset();
  }, [onReset]);

  const handleCameraVideoReady = useCallback((file: File) => {
    onVideoUpload(file);
    setShowCamera(false);
  }, [onVideoUpload]);

  const modeColor = mode === 'squat' ? 'blue' : 'emerald';

  return (
    <>
      {showInstructions && (
        <RecordingInstructions
          mode={mode}
          onClose={() => setShowInstructions(false)}
        />
      )}
      
      {showCamera && (
        <CameraRecorder
          onVideoReady={handleCameraVideoReady}
          onClose={() => setShowCamera(false)}
          mode={mode}
        />
      )}
      
      {showLivePoseDetection && (
        <LivePoseDetector
          mode={mode}
          onClose={() => setShowLivePoseDetection(false)}
        />
      )}
      
      <div className="mb-8">
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Upload, Record, or Try Live Detection
        </h2>

        {!videoFile ? (
          <div className="grid md:grid-cols-3 gap-6">
            {/* File Upload */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                dragActive 
                  ? `border-${modeColor}-500 bg-${modeColor}-50` 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Upload Video File
              </h3>
              <p className="text-gray-500 mb-4">
                Drag and drop a video file or click to browse
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`px-6 py-3 bg-${modeColor}-600 text-white rounded-lg hover:bg-${modeColor}-700 transition-colors`}
              >
                Browse Files
              </button>
            </div>

            {/* Webcam Recording */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Record with Webcam
              </h3>
              <p className="text-gray-500 mb-4">
                Record yourself performing {mode === 'squat' ? 'squats' : 'sitting at your desk'}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => setShowInstructions(true)}
                  className={`w-full px-6 py-3 bg-${modeColor}-100 text-${modeColor}-700 border border-${modeColor}-300 rounded-lg hover:bg-${modeColor}-200 transition-colors flex items-center justify-center space-x-2`}
                >
                  <span>📖 Recording Instructions</span>
                </button>
                <button
                  onClick={() => setShowCamera(true)}
                  className={`w-full px-6 py-3 bg-${modeColor}-600 text-white rounded-lg hover:bg-${modeColor}-700 transition-colors flex items-center justify-center space-x-2`}
                >
                  <Camera className="w-5 h-5" />
                  <span>Open Camera</span>
                </button>
              </div>
            </div>
            
            {/* Live Pose Detection */}
            <div className="border-2 border-dashed border-gray-300 bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl p-8 text-center">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Live Pose Analysis
              </h3>
              <p className="text-gray-500 mb-4">
                Get real-time feedback on your {mode === 'squat' ? 'squats' : 'desk posture'} with AI
              </p>
              <button
                onClick={() => setShowLivePoseDetection(true)}
                className={`w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2`}
              >
                <Activity className="w-5 h-5" />
                <span>Start Live Detection</span>
              </button>
              <div className="mt-3 text-xs text-gray-500">
                Performs analysis directly in browser
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center mb-4">
                <Play className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {videoFile.name}
                  </h3>
                  <p className="text-gray-600">
                    {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={deleteRecording}
                  disabled={isAnalyzing}
                  className="ml-4 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete video"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <video
                src={URL.createObjectURL(videoFile)}
                controls
                className="w-full max-w-md mx-auto rounded-lg"
              />
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={onAnalyze}
                disabled={isAnalyzing}
                className={`px-8 py-3 bg-${modeColor}-600 text-white rounded-lg hover:bg-${modeColor}-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2`}
              >
                <Play className="w-5 h-5" />
                <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Posture'}</span>
              </button>
              
              <button
                onClick={onReset}
                disabled={isAnalyzing}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Reset</span>
              </button>
              
              <button
                onClick={() => setShowLivePoseDetection(true)}
                disabled={isAnalyzing}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Activity className="w-5 h-5" />
                <span>Try Live Detection</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default VideoInput;