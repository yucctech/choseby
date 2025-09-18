// API client for Go backend integration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new ApiError(response.status, errorData.error || 'Request failed');
    }

    return response.json();
  }

  // Authentication
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: { email: string; password: string; name: string; role: string }): Promise<ApiResponse<{ user: any }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Teams
  async getTeams(): Promise<ApiResponse<any[]>> {
    return this.request('/teams');
  }

  async createTeam(teamData: { name: string; description?: string }): Promise<ApiResponse<any>> {
    return this.request('/teams', {
      method: 'POST',
      body: JSON.stringify(teamData),
    });
  }

  // Decisions
  async getDecisions(teamId: string): Promise<ApiResponse<any[]>> {
    return this.request(`/teams/${teamId}/decisions`);
  }

  async createDecision(teamId: string, decisionData: any): Promise<ApiResponse<any>> {
    return this.request(`/teams/${teamId}/decisions`, {
      method: 'POST',
      body: JSON.stringify(decisionData),
    });
  }

  // Evaluations
  async submitEvaluation(teamId: string, decisionId: string, evaluationData: any): Promise<ApiResponse<any>> {
    return this.request(`/teams/${teamId}/decisions/${decisionId}/evaluations`, {
      method: 'POST',
      body: JSON.stringify(evaluationData),
    });
  }

  async getConflicts(teamId: string, decisionId: string): Promise<ApiResponse<any[]>> {
    return this.request(`/teams/${teamId}/decisions/${decisionId}/conflicts`);
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<any>> {
    return this.request('/health');
  }
}

export const api = new ApiClient();