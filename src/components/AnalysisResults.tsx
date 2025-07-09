import React from 'react';
import { PostureData, PostureMode } from '../App';
import PostureTimeline from './PostureTimeline';
import PostureMetrics from './PostureMetrics';
import PostureSummary from './PostureSummary';

interface AnalysisResultsProps {
  data: PostureData;
  mode: PostureMode;
  videoFile: File | null;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ data, mode, videoFile }) => {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Analysis Results
        </h2>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-600">
              {Math.round((data.summary.goodFrames / data.summary.totalFrames) * 100)}%
            </div>
            <p className="text-green-800 font-medium">Good Posture</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-red-600">
              {Math.round((data.summary.badFrames / data.summary.totalFrames) * 100)}%
            </div>
            <p className="text-red-800 font-medium">Bad Posture</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">
              {Math.round(data.summary.accuracy * 100)}%
            </div>
            <p className="text-blue-800 font-medium">Accuracy</p>
          </div>
        </div>

        {/* Video with Timeline */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Frame-by-Frame Analysis
          </h3>
          <div className="bg-gray-50 rounded-xl p-4">
            {videoFile && (
              <video
                src={URL.createObjectURL(videoFile)}
                controls
                className="w-full max-w-2xl mx-auto rounded-lg mb-4"
              />
            )}
            <PostureTimeline data={data.frameResults} />
          </div>
        </div>

        {/* Metrics */}
        <PostureMetrics data={data.frameResults} mode={mode} />
        
        {/* Summary */}
        <PostureSummary summary={data.summary} mode={mode} />
      </div>
    </div>
  );
};

export default AnalysisResults;