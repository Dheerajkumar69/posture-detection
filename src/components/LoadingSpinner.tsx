import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Analyzing Your Posture
          </h3>
          <p className="text-gray-600 text-center max-w-md">
            Our AI is processing your video frame by frame to detect posture issues. 
            This may take a few moments...
          </p>
          <div className="mt-6 w-full max-w-sm">
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;