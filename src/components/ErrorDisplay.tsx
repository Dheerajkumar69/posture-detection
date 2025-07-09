import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
  onDismiss: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onDismiss }) => {
  return (
    <div className="mb-6">
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800 mb-1">
              Analysis Error
            </h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;