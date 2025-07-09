import React, { useState, useRef, useEffect } from 'react';
import { Play, X, RefreshCw } from 'lucide-react';
import { PostureMode } from '../App';
import './LivePoseDetectorDemo.css';

interface PostureDemoGuideProps {
  mode: PostureMode;
  isExpanded: boolean;
  onToggle: () => void;
}

const PostureDemoGuide: React.FC<PostureDemoGuideProps> = ({ 
  mode, 
  isExpanded, 
  onToggle 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [gifError, setGifError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Instructions based on mode
  const getInstructions = () => {
    if (mode === 'squat') {
      return [
        { type: 'good', text: 'Keep back straight' },
        { type: 'good', text: 'Heels on the ground' },
        { type: 'bad', text: 'Don\'t let knees cross toes' },
        { type: 'good', text: 'Squat slowly and fully' }
      ];
    } else {
      return [
        { type: 'good', text: 'Sit upright with back straight' },
        { type: 'bad', text: 'Avoid leaning forward' },
        { type: 'good', text: 'Keep head and neck aligned' },
        { type: 'good', text: 'Keep shoulders relaxed' }
      ];
    }
  };

  // Paths for video and fallback images
  const assets = {
    squat: {
      video: '/assets/videos/squat_demo.mp4',
      fallback: '/assets/images/squat_demo.gif',
      svg: '/assets/images/squat_demo.svg'
    },
    desk: {
      video: '/assets/videos/desk_posture_demo.mp4',
      fallback: '/assets/images/desk_posture.gif',
      svg: '/assets/images/desk_posture.svg'
    }
  };

  const handleVideoError = () => {
    setVideoError(true);
    console.warn("Video failed to load, using fallback image");
  };

  const handleGifError = () => {
    setGifError(true);
    console.warn("GIF failed to load, using SVG fallback");
  };

  const reloadMedia = () => {
    setVideoError(false);
    setGifError(false);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  const instructions = getInstructions();
  const modeColor = mode === 'squat' ? 'blue' : 'emerald';
  
  // When mode changes, reset error states and reload media
  useEffect(() => {
    setVideoError(false);
    setGifError(false);
    
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [mode]);

  // If not expanded, just show toggle button
  if (!isExpanded) {
    return (
      <button
        onClick={onToggle}
        className={`guide-toggle absolute top-3 right-3 z-20 bg-${modeColor}-600 hover:bg-${modeColor}-700 text-white rounded-full p-2 shadow-lg flex items-center`}
        title="Show posture guide"
      >
        <Play className="w-4 h-4 mr-1" />
        <span className="text-xs">Guide</span>
      </button>
    );
  }

  // Get current asset paths based on mode
  const currentAssets = mode === 'squat' ? assets.squat : assets.desk;

  return (
    <div 
      ref={containerRef}
      className="guide-container absolute right-0 top-0 w-64 md:w-72 h-full z-10 p-4 text-white"
    >
      <button
        onClick={onToggle}
        className={`absolute top-2 right-2 text-white hover:text-${modeColor}-300 z-10`}
        title="Hide guide"
      >
        <X className="h-5 w-5" />
      </button>

      <h3 className={`text-lg font-semibold mb-2 text-${modeColor}-400`}>
        {mode === 'squat' ? 'Proper Squat Form' : 'Proper Desk Posture'}
      </h3>

      <div className="demo-video-container mb-4">
        {/* Video - Primary */}
        {!videoError && (
          <video
            ref={videoRef}
            src={currentAssets.video}
            className="demo-video"
            autoPlay
            loop
            muted
            playsInline
            onError={handleVideoError}
          />
        )}
        
        {/* GIF - First fallback */}
        {videoError && !gifError && (
          <img 
            src={currentAssets.fallback}
            alt={`${mode} demonstration`}
            className="demo-fallback"
            style={{ display: 'block' }}
            onError={handleGifError}
          />
        )}
        
        {/* SVG - Second fallback */}
        {videoError && gifError && (
          <object 
            type="image/svg+xml"
            data={currentAssets.svg}
            className="demo-fallback"
            style={{ display: 'block' }}
          >
            <div className="flex items-center justify-center h-full bg-gray-800 py-6">
              <div className="text-center">
                <div className="text-gray-400 mb-2">Demo not available</div>
                <button 
                  onClick={reloadMedia} 
                  className={`text-${modeColor}-400 flex items-center mx-auto text-sm`}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Try again
                </button>
              </div>
            </div>
          </object>
        )}
      </div>

      <div className="space-y-2 mt-4">
        <h4 className="text-sm font-medium">Key Instructions:</h4>
        <ul className="space-y-2 text-sm">
          {instructions.map((instruction, index) => (
            <li 
              key={index} 
              className="flex items-center"
            >
              <span className={`mr-2 guide-instruction-${instruction.type}`}>
                {instruction.type === 'good' ? '✅' : '❌'}
              </span>
              <span>{instruction.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-6 text-xs text-gray-300 italic">
        Follow along with the guide while checking your form in real-time
      </p>
    </div>
  );
};

export default PostureDemoGuide; 