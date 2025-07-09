import React from 'react';
import { PostureData, PostureMode } from '../App';
import { AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface PostureSummaryProps {
  summary: PostureData['summary'];
  mode: PostureMode;
}

const PostureSummary: React.FC<PostureSummaryProps> = ({ summary, mode }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">
        Analysis Summary
      </h3>

      {/* Common Issues */}
      <div className="bg-amber-50 rounded-xl p-4">
        <div className="flex items-center mb-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mr-2" />
          <h4 className="font-semibold text-amber-800">Common Issues Detected</h4>
        </div>
        <ul className="space-y-2">
          {summary.commonIssues.map((issue, index) => (
            <li key={index} className="flex items-start">
              <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span className="text-amber-700">{issue}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 rounded-xl p-4">
        <div className="flex items-center mb-3">
          <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
          <h4 className="font-semibold text-blue-800">Recommendations</h4>
        </div>
        <ul className="space-y-2">
          {summary.recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-1 mr-3 flex-shrink-0" />
              <span className="text-blue-700">{recommendation}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Mode-specific tips */}
      <div className="bg-green-50 rounded-xl p-4">
        <div className="flex items-center mb-3">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <h4 className="font-semibold text-green-800">
            {mode === 'squat' ? 'Squat Form Tips' : 'Desk Posture Tips'}
          </h4>
        </div>
        <ul className="space-y-2 text-green-700">
          {mode === 'squat' ? (
            <>
              <li>• Keep your weight on your heels</li>
              <li>• Maintain a straight back throughout the movement</li>
              <li>• Keep your knees tracking over your toes</li>
              <li>• Descend until your thighs are parallel to the ground</li>
            </>
          ) : (
            <>
              <li>• Keep your monitor at eye level</li>
              <li>• Maintain your feet flat on the floor</li>
              <li>• Keep your shoulders relaxed and back</li>
              <li>• Take regular breaks to stretch and move</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default PostureSummary;