import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LivePoseDetector from '../components/LivePoseDetector';

// Mock the MediaPipe imports
vi.mock('@mediapipe/pose', () => {
  return {
    Pose: vi.fn().mockImplementation(() => ({
      setOptions: vi.fn(),
      onResults: vi.fn(),
      send: vi.fn(),
    }))
  };
});

// Mock the usePoseEstimation hook
vi.mock('../hooks/usePoseEstimation', () => {
  return {
    usePoseEstimation: vi.fn().mockReturnValue({
      results: null,
      isProcessing: false,
      postureFeedback: null,
      error: null,
      startPoseDetection: vi.fn(),
      stopPoseDetection: vi.fn(),
    })
  };
});

describe('LivePoseDetector Component', () => {
  const mockClose = vi.fn();

  beforeEach(() => {
    mockClose.mockReset();
  });

  it('should render with squat mode correctly', () => {
    render(<LivePoseDetector mode="squat" onClose={mockClose} />);
    
    expect(screen.getByText('Live Squat Analysis')).toBeInTheDocument();
    expect(screen.getByText(/Face the camera and perform slow, controlled squats/)).toBeInTheDocument();
  });

  it('should render with desk mode correctly', () => {
    render(<LivePoseDetector mode="desk" onClose={mockClose} />);
    
    expect(screen.getByText('Live Desk Posture Analysis')).toBeInTheDocument();
    expect(screen.getByText(/Position yourself in profile view/)).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<LivePoseDetector mode="squat" onClose={mockClose} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('should toggle FPS display when button is clicked', () => {
    render(<LivePoseDetector mode="squat" onClose={mockClose} />);
    
    const fpsButton = screen.getByRole('button', { name: /show fps/i });
    fireEvent.click(fpsButton);
    
    expect(screen.getByText(/FPS:/)).toBeInTheDocument();
    
    fireEvent.click(fpsButton);
    expect(screen.queryByText(/FPS:/)).not.toBeInTheDocument();
  });
}); 