import React from 'react';
import { Camera, Monitor, Users, CheckCircle, AlertTriangle, Clock, Eye } from 'lucide-react';
import { PostureMode } from '../App';

interface RecordingInstructionsProps {
  mode: PostureMode;
  onClose: () => void;
}

const RecordingInstructions: React.FC<RecordingInstructionsProps> = ({ mode, onClose }) => {
  const modeColor = mode === 'squat' ? 'blue' : 'emerald';
  const ModeIcon = mode === 'squat' ? Users : Monitor;

  const squatInstructions = [
    {
      icon: Eye,
      title: "Camera Position",
      description: "Position camera at waist level, 6-8 feet away. Ensure your full body is visible from head to toe."
    },
    {
      icon: Users,
      title: "Starting Position",
      description: "Stand with feet shoulder-width apart, facing the camera. Keep your arms at your sides or crossed."
    },
    {
      icon: Clock,
      title: "Recording Duration",
      description: "Record for 15-30 seconds. Perform 3-5 slow, controlled squats for best analysis."
    },
    {
      icon: CheckCircle,
      title: "Proper Form",
      description: "Descend slowly, keep knees behind toes, maintain straight back, and go down until thighs are parallel to ground."
    }
  ];

  const deskInstructions = [
    {
      icon: Eye,
      title: "Camera Position",
      description: "Position camera at desk level, showing your side profile. Ensure head, shoulders, and back are visible."
    },
    {
      icon: Monitor,
      title: "Sitting Position",
      description: "Sit normally at your desk as you would during work. Don't adjust your posture for the camera."
    },
    {
      icon: Clock,
      title: "Recording Duration",
      description: "Record for 10-20 seconds while sitting naturally. You can type or move slightly as normal."
    },
    {
      icon: CheckCircle,
      title: "Natural Posture",
      description: "Maintain your typical sitting posture. The AI will analyze your neck, back, and shoulder alignment."
    }
  ];

  const instructions = mode === 'squat' ? squatInstructions : deskInstructions;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`bg-${modeColor}-600 text-white p-6 rounded-t-2xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ModeIcon className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">
                  {mode === 'squat' ? 'Squat Recording Guide' : 'Desk Posture Recording Guide'}
                </h2>
                <p className="text-blue-100">
                  Follow these steps for accurate posture analysis
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Quick Tips */}
          <div className={`bg-${modeColor}-50 border border-${modeColor}-200 rounded-xl p-4 mb-6`}>
            <h3 className={`text-${modeColor}-800 font-semibold mb-2 flex items-center`}>
              <AlertTriangle className={`w-5 h-5 text-${modeColor}-600 mr-2`} />
              Quick Tips
            </h3>
            <ul className={`text-${modeColor}-700 space-y-1 text-sm`}>
              <li>• Ensure good lighting - avoid backlighting</li>
              <li>• Keep the camera steady during recording</li>
              <li>• Wear fitted clothing for better pose detection</li>
              <li>• Record in a clutter-free environment</li>
            </ul>
          </div>

          {/* Step-by-step Instructions */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Step-by-Step Instructions
            </h3>
            
            {instructions.map((instruction, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className={`p-3 bg-${modeColor}-100 rounded-full flex-shrink-0`}>
                  <instruction.icon className={`w-6 h-6 text-${modeColor}-600`} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">
                    {index + 1}. {instruction.title}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {instruction.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Camera Setup Diagram */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <h4 className="font-semibold text-gray-800 mb-3">Camera Setup</h4>
            <div className="flex items-center justify-center">
              {mode === 'squat' ? (
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-32 h-40 bg-blue-200 rounded-lg flex items-center justify-center mb-2">
                      <Users className="w-16 h-16 text-blue-600" />
                    </div>
                    <div className="absolute -left-16 top-1/2 transform -translate-y-1/2">
                      <Camera className="w-8 h-8 text-gray-600" />
                      <div className="text-xs text-gray-500 mt-1">6-8 feet</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Full body visible, camera at waist level</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-40 h-32 bg-emerald-200 rounded-lg flex items-center justify-center mb-2">
                      <Monitor className="w-16 h-16 text-emerald-600" />
                    </div>
                    <div className="absolute -left-12 top-1/2 transform -translate-y-1/2">
                      <Camera className="w-8 h-8 text-gray-600" />
                      <div className="text-xs text-gray-500 mt-1">Side view</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Side profile, upper body visible</p>
                </div>
              )}
            </div>
          </div>

          {/* Common Mistakes */}
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <h4 className="font-semibold text-red-800 mb-3 flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              Common Mistakes to Avoid
            </h4>
            <ul className="text-red-700 space-y-1 text-sm">
              {mode === 'squat' ? (
                <>
                  <li>• Recording too close - full body not visible</li>
                  <li>• Moving too fast during squats</li>
                  <li>• Camera positioned too high or too low</li>
                  <li>• Performing squats at an angle to the camera</li>
                </>
              ) : (
                <>
                  <li>• Recording from the front instead of side</li>
                  <li>• Sitting too far from the camera</li>
                  <li>• Adjusting posture specifically for recording</li>
                  <li>• Poor lighting making pose detection difficult</li>
                </>
              )}
            </ul>
          </div>

          {/* Action Button */}
          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className={`px-8 py-3 bg-${modeColor}-600 text-white rounded-lg hover:bg-${modeColor}-700 transition-colors font-semibold`}
            >
              Got It, Start Recording
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordingInstructions;