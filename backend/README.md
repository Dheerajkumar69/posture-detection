# Posture Analysis Backend

FastAPI backend with MediaPipe pose detection for real-time posture analysis.

## Features

- Real-time pose detection using MediaPipe
- Rule-based posture analysis for squat and desk sitting modes
- RESTful API with comprehensive error handling
- Frame-by-frame analysis with detailed feedback

## Setup

### Requirements

- Python 3.10+
- OpenCV
- MediaPipe
- FastAPI

### Installation

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### Health Check
```
GET /health
```

### Analyze Posture
```
POST /analyze
Content-Type: multipart/form-data

Parameters:
- file: Video file (mp4, mov, etc.)
- mode: "squat" or "desk"
```

## Rule-Based Logic

### Squat Mode
- ✅ Good: Knee behind toe, back angle ≥ 150°, proper squat depth
- ❌ Bad: Knee ahead of toe, back leaning forward, improper depth

### Desk Sitting Mode
- ✅ Good: Neck angle < 30°, back straight (~180°)
- ❌ Bad: Forward head posture, hunched back

## Testing

Run tests:
```bash
pytest test_api.py -v
```

## Deployment

For production deployment:
```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```