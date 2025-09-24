import type { AuthResponse, Decision, Team, User, TeamMember, DecisionCriteria, DecisionOption, Evaluation, EvaluationScore, ConflictDetection } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async ssoLogin(provider: string, code: string): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/auth/sso/callback', {
      method: 'POST',
      body: JSON.stringify({ provider, code }),
    });
    this.setToken(data.token);
    return data;
  }

  async logout(): Promise<void> {
    this.clearToken();
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/user/profile');
  }

  async getTeams(): Promise<Team[]> {
    return this.request<Team[]>('/teams');
  }

  async getTeam(teamId: string): Promise<Team> {
    return this.request<Team>(`/teams/${teamId}`);
  }

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    return this.request<TeamMember[]>(`/teams/${teamId}/members`);
  }

  async getDecisions(teamId: string): Promise<Decision[]> {
    const response = await this.request<{ decisions: Decision[] }>(`/teams/${teamId}/decisions`);
    return response.decisions;
  }

  async getDecision(teamId: string, decisionId: string): Promise<Decision> {
    return this.request<Decision>(`/teams/${teamId}/decisions/${decisionId}`);
  }

  async createDecision(teamId: string, data: Partial<Decision>): Promise<Decision> {
    return this.request<Decision>(`/teams/${teamId}/decisions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDecision(teamId: string, decisionId: string, data: Partial<Decision>): Promise<Decision> {
    return this.request<Decision>(`/teams/${teamId}/decisions/${decisionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getCriteria(teamId: string, decisionId: string): Promise<DecisionCriteria[]> {
    return this.request<DecisionCriteria[]>(`/teams/${teamId}/decisions/${decisionId}/criteria`);
  }

  async createCriteria(teamId: string, decisionId: string, data: Partial<DecisionCriteria>): Promise<DecisionCriteria> {
    return this.request<DecisionCriteria>(`/teams/${teamId}/decisions/${decisionId}/criteria`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOptions(teamId: string, decisionId: string): Promise<DecisionOption[]> {
    return this.request<DecisionOption[]>(`/teams/${teamId}/decisions/${decisionId}/options`);
  }

  async createOption(teamId: string, decisionId: string, data: Partial<DecisionOption>): Promise<DecisionOption> {
    return this.request<DecisionOption>(`/teams/${teamId}/decisions/${decisionId}/options`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async submitEvaluation(decisionId: string, data: {
    scores: Array<{
      option_id: string;
      criterion_id: string;
      score: number;
      rationale?: string;
      confidence: number;
    }>;
    overall_confidence: number;
    evaluation_notes?: string;
  }): Promise<Evaluation> {
    return this.request<Evaluation>(`/decisions/${decisionId}/evaluations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getConflicts(decisionId: string): Promise<ConflictDetection[]> {
    return this.request<ConflictDetection[]>(`/decisions/${decisionId}/conflicts`);
  }

  async healthCheck(): Promise<{ status: string; service: string; version: string }> {
    return this.request('/health');
  }
}

export const apiClient = new ApiClient();