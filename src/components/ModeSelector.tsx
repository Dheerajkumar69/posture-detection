import React from 'react';
import { Users, Monitor } from 'lucide-react';
import { PostureMode } from '../App';

interface ModeSelectorProps {
  mode: PostureMode;
  onModeChange: (mode: PostureMode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, onModeChange }) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
        Select Analysis Mode
      </h2>
      <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
        <button
          onClick={() => onModeChange('squat')}
          className={`flex-1 p-6 rounded-xl border-2 transition-all duration-300 ${
            mode === 'squat'
              ? 'border-blue-500 bg-blue-50 shadow-lg'
              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-center mb-3">
            <Users className={`w-8 h-8 ${mode === 'squat' ? 'text-blue-600' : 'text-gray-400'}`} />
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${mode === 'squat' ? 'text-blue-800' : 'text-gray-700'}`}>
            Squat Analysis
          </h3>
          <p className="text-sm text-gray-600">
            Analyze squatting form, knee alignment, and back posture during exercise
          </p>
        </button>

        <button
          onClick={() => onModeChange('desk')}
          className={`flex-1 p-6 rounded-xl border-2 transition-all duration-300 ${
            mode === 'desk'
              ? 'border-emerald-500 bg-emerald-50 shadow-lg'
              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-center mb-3">
            <Monitor className={`w-8 h-8 ${mode === 'desk' ? 'text-emerald-600' : 'text-gray-400'}`} />
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${mode === 'desk' ? 'text-emerald-800' : 'text-gray-700'}`}>
            Desk Sitting
          </h3>
          <p className="text-sm text-gray-600">
            Monitor sitting posture, neck alignment, and back straightness at your desk
          </p>
        </button>
      </div>
    </div>
  );
};

export default ModeSelector;