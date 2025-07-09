import React, { useState } from 'react';
import { PostureData } from '../App';

interface PostureTimelineProps {
  data: PostureData['frameResults'];
}

const PostureTimeline: React.FC<PostureTimelineProps> = ({ data }) => {
  const [hoveredFrame, setHoveredFrame] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-md font-semibold text-gray-700">Posture Timeline</h4>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Good Posture</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Bad Posture</span>
          </div>
        </div>
      </div>
      
      <div className="relative">
        <div className="flex space-x-1 overflow-x-auto pb-2">
          {data.map((frame, index) => (
            <div
              key={frame.frameNumber}
              className={`h-8 w-2 rounded-sm cursor-pointer transition-all duration-200 ${
                frame.isGoodPosture 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-red-500 hover:bg-red-600'
              }`}
              onMouseEnter={() => setHoveredFrame(index)}
              onMouseLeave={() => setHoveredFrame(null)}
              title={`Frame ${frame.frameNumber}: ${frame.isGoodPosture ? 'Good' : 'Bad'} Posture`}
            />
          ))}
        </div>
        
        {hoveredFrame !== null && (
          <div className="absolute top-full left-0 mt-2 bg-gray-800 text-white p-2 rounded-lg shadow-lg z-10">
            <div className="text-sm">
              <p><strong>Frame:</strong> {data[hoveredFrame].frameNumber}</p>
              <p><strong>Time:</strong> {data[hoveredFrame].timestamp.toFixed(2)}s</p>
              <p><strong>Status:</strong> {data[hoveredFrame].isGoodPosture ? 'Good' : 'Bad'}</p>
              <p><strong>Confidence:</strong> {(data[hoveredFrame].confidence * 100).toFixed(1)}%</p>
              {data[hoveredFrame].issues.length > 0 && (
                <p><strong>Issues:</strong> {data[hoveredFrame].issues.join(', ')}</p>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-between text-sm text-gray-500">
        <span>0:00</span>
        <span>{(data[data.length - 1]?.timestamp || 0).toFixed(2)}s</span>
      </div>
    </div>
  );
};

export default PostureTimeline;