import React, { useState } from 'react';
import Header from './components/Header';
import VideoInput from './components/VideoInput';
import ModeSelector from './components/ModeSelector';
import AnalysisResults from './components/AnalysisResults';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';
import { ApiService } from './services/api';

export interface PostureData {
  frameResults: {
    frameNumber: number;
    timestamp: number;
    isGoodPosture: boolean;
    confidence: number;
    angles: {
      back: number;
      neck: number;
      knee: number;
    };
    issues: string[];
  }[];
  summary: {
    totalFrames: number;
    goodFrames: number;
    badFrames: number;
    accuracy: number;
    commonIssues: string[];
    recommendations: string[];
  };
}

export type PostureMode = 'squat' | 'desk';

function App() {
  const [mode, setMode] = useState<PostureMode>('squat');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<PostureData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVideoUpload = (file: File) => {
    setVideoFile(file);
    setError(null);
    setAnalysisResults(null);
  };

  const handleModeChange = (newMode: PostureMode) => {
    setMode(newMode);
    setError(null);
  };

  const handleAnalysis = async () => {
    if (!videoFile) {
      setError('Please upload a video file or record one using the webcam');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Call real API
      const results = await ApiService.analyzePosture({
        file: videoFile,
        mode: mode
      });
      
      setAnalysisResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze video. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setVideoFile(null);
    setAnalysisResults(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Smart Posture Analysis
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Upload a video or record yourself to get real-time posture feedback using advanced computer vision
            </p>
          </div>

          {/* Mode Selection */}
          <ModeSelector mode={mode} onModeChange={handleModeChange} />

          {/* Video Input */}
          <VideoInput 
            onVideoUpload={handleVideoUpload}
            videoFile={videoFile}
            mode={mode}
            onAnalyze={handleAnalysis}
            onReset={handleReset}
            isAnalyzing={isAnalyzing}
            onError={setError}
          />

          {/* Error Display */}
          {error && <ErrorDisplay error={error} onDismiss={() => setError(null)} />}

          {/* Loading Spinner */}
          {isAnalyzing && <LoadingSpinner />}

          {/* Analysis Results */}
          {analysisResults && (
            <AnalysisResults 
              data={analysisResults}
              mode={mode}
              videoFile={videoFile}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;