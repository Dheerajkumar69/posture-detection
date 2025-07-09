const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface AnalysisRequest {
  file: File;
  mode: 'squat' | 'desk';
}

export interface AnalysisResponse {
  frameResults: {
    frameNumber: number;
    timestamp: number;
    isGoodPosture: boolean;
    confidence: number;
    angles: {
      back: number;
      neck: number;
      knee: number;
    };
    issues: string[];
  }[];
  summary: {
    totalFrames: number;
    goodFrames: number;
    badFrames: number;
    accuracy: number;
    commonIssues: string[];
    recommendations: string[];
  };
}

export class ApiService {
  static async analyzePosture(request: AnalysisRequest): Promise<AnalysisResponse> {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('mode', request.mode);

    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async healthCheck(): Promise<{ status: string; message: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    return response.json();
  }
}