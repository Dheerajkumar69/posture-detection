import React from 'react';
import { PostureData, PostureMode } from '../App';

interface PostureMetricsProps {
  data: PostureData['frameResults'];
  mode: PostureMode;
}

const PostureMetrics: React.FC<PostureMetricsProps> = ({ data, mode }) => {
  const avgAngles = data.reduce(
    (acc, frame) => ({
      back: acc.back + frame.angles.back,
      neck: acc.neck + frame.angles.neck,
      knee: acc.knee + frame.angles.knee,
    }),
    { back: 0, neck: 0, knee: 0 }
  );

  const frameCount = data.length;
  avgAngles.back /= frameCount;
  avgAngles.neck /= frameCount;
  avgAngles.knee /= frameCount;

  const metrics = mode === 'squat' 
    ? [
        { label: 'Back Angle', value: avgAngles.back.toFixed(1), unit: '°', ideal: '150-180°' },
        { label: 'Knee Angle', value: avgAngles.knee.toFixed(1), unit: '°', ideal: '80-90°' },
        { label: 'Neck Angle', value: avgAngles.neck.toFixed(1), unit: '°', ideal: '<30°' },
      ]
    : [
        { label: 'Back Angle', value: avgAngles.back.toFixed(1), unit: '°', ideal: '~180°' },
        { label: 'Neck Angle', value: avgAngles.neck.toFixed(1), unit: '°', ideal: '<30°' },
      ];

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Average Angles
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-gray-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-gray-800">
              {metric.value}{metric.unit}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              <div className="font-medium">{metric.label}</div>
              <div className="text-xs">Ideal: {metric.ideal}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostureMetrics;