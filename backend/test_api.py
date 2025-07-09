import pytest
import requests
import os
from fastapi.testclient import TestClient
from main import app
import tempfile
import cv2
import numpy as np

client = TestClient(app)

def create_test_video():
    """Create a simple test video for testing"""
    # Create a temporary video file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4')
    temp_file.close()
    
    # Create a simple video with OpenCV
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(temp_file.name, fourcc, 20.0, (640, 480))
    
    # Create 60 frames (3 seconds at 20fps)
    for i in range(60):
        # Create a simple frame with a colored rectangle
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        cv2.rectangle(frame, (100, 100), (540, 380), (0, 255, 0), -1)
        out.write(frame)
    
    out.release()
    return temp_file.name

class TestAPI:
    def test_health_endpoint(self):
        """Test the health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
    
    def test_analyze_endpoint_squat_mode(self):
        """Test the analyze endpoint with squat mode"""
        video_path = create_test_video()
        
        try:
            with open(video_path, "rb") as video_file:
                response = client.post(
                    "/analyze",
                    files={"file": ("test_video.mp4", video_file, "video/mp4")},
                    data={"mode": "squat"}
                )
            
            assert response.status_code == 200
            data = response.json()
            
            # Check response structure
            assert "frameResults" in data
            assert "summary" in data
            assert isinstance(data["frameResults"], list)
            assert len(data["frameResults"]) > 0
            
            # Check frame result structure
            frame = data["frameResults"][0]
            assert "frameNumber" in frame
            assert "timestamp" in frame
            assert "isGoodPosture" in frame
            assert "confidence" in frame
            assert "angles" in frame
            assert "issues" in frame
            
            # Check angles structure
            angles = frame["angles"]
            assert "back" in angles
            assert "neck" in angles
            assert "knee" in angles
            
            # Check summary structure
            summary = data["summary"]
            assert "totalFrames" in summary
            assert "goodFrames" in summary
            assert "badFrames" in summary
            assert "accuracy" in summary
            assert "commonIssues" in summary
            assert "recommendations" in summary
            
        finally:
            os.unlink(video_path)
    
    def test_analyze_endpoint_desk_mode(self):
        """Test the analyze endpoint with desk mode"""
        video_path = create_test_video()
        
        try:
            with open(video_path, "rb") as video_file:
                response = client.post(
                    "/analyze",
                    files={"file": ("test_video.mp4", video_file, "video/mp4")},
                    data={"mode": "desk"}
                )
            
            assert response.status_code == 200
            data = response.json()
            assert "frameResults" in data
            assert "summary" in data
            
        finally:
            os.unlink(video_path)
    
    def test_invalid_mode(self):
        """Test with invalid mode"""
        video_path = create_test_video()
        
        try:
            with open(video_path, "rb") as video_file:
                response = client.post(
                    "/analyze",
                    files={"file": ("test_video.mp4", video_file, "video/mp4")},
                    data={"mode": "invalid"}
                )
            
            assert response.status_code == 400
            
        finally:
            os.unlink(video_path)
    
    def test_non_video_file(self):
        """Test with non-video file"""
        # Create a text file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.txt')
        temp_file.write(b"This is not a video file")
        temp_file.close()
        
        try:
            with open(temp_file.name, "rb") as text_file:
                response = client.post(
                    "/analyze",
                    files={"file": ("test.txt", text_file, "text/plain")},
                    data={"mode": "squat"}
                )
            
            assert response.status_code == 400
            
        finally:
            os.unlink(temp_file.name)

if __name__ == "__main__":
    pytest.main([__file__])