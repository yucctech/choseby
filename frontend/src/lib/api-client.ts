// Customer Response Platform - API Client
// Handles all backend communication with Go/Gin API

import type {
  User,
  Team,
  TeamMember,
  CustomerDecision,
  DecisionCriteria,
  ResponseOption,
  TeamEvaluation,
  DecisionOutcome,
  CustomerResponseType,
  AIClassification,
  AIRecommendations,
  ResponseDraft,
  DashboardMetrics,
  APIResponse,
  PaginatedResponse,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API_PREFIX = '/api/v1';

// ========================================
// HELPER FUNCTIONS
// ========================================

class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new APIError(
      error.error || `HTTP ${response.status}`,
      response.status,
      error
    );
  }
  return response.json();
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${API_PREFIX}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });
  return handleResponse<T>(response);
}

// ========================================
// AUTHENTICATION
// ========================================

export const auth = {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const data = await apiRequest<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('auth_token', data.token);
    return data;
  },

  async register(email: string, password: string, name: string): Promise<{ token: string; user: User }> {
    const data = await apiRequest<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    localStorage.setItem('auth_token', data.token);
    return data;
  },

  logout() {
    localStorage.removeItem('auth_token');
  },

  async getCurrentUser(): Promise<User> {
    const data = await apiRequest<{ user: User; team?: any }>('/auth/me');
    return data.user;
  },
};

// ========================================
// TEAMS
// ========================================

export const teams = {
  async list(): Promise<Team[]> {
    const response = await apiRequest<APIResponse<Team[]>>('/teams');
    return response.data || [];
  },

  async get(teamId: string): Promise<Team> {
    const response = await apiRequest<APIResponse<Team>>(`/teams/${teamId}`);
    if (!response.data) throw new Error('Team not found');
    return response.data;
  },

  async create(name: string, organization: string): Promise<Team> {
    const response = await apiRequest<APIResponse<Team>>('/teams', {
      method: 'POST',
      body: JSON.stringify({ name, organization }),
    });
    if (!response.data) throw new Error('Failed to create team');
    return response.data;
  },

  async addMember(teamId: string, userId: string, role: 'owner' | 'admin' | 'member'): Promise<TeamMember> {
    const response = await apiRequest<APIResponse<TeamMember>>(`/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, role }),
    });
    if (!response.data) throw new Error('Failed to add team member');
    return response.data;
  },

  async getMembers(teamId: string): Promise<TeamMember[]> {
    const response = await apiRequest<APIResponse<TeamMember[]>>(`/teams/${teamId}/members`);
    return response.data || [];
  },
};

// ========================================
// CUSTOMER DECISIONS
// ========================================

export const decisions = {
  async list(teamId: string, params?: { status?: string; page?: number; pageSize?: number }): Promise<PaginatedResponse<CustomerDecision>> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.pageSize) query.append('page_size', params.pageSize.toString());

    return apiRequest<PaginatedResponse<CustomerDecision>>(
      `/teams/${teamId}/decisions?${query.toString()}`
    );
  },

  async get(decisionId: string): Promise<CustomerDecision> {
    const response = await apiRequest<APIResponse<CustomerDecision>>(`/decisions/${decisionId}`);
    if (!response.data) throw new Error('Decision not found');
    return response.data;
  },

  async create(teamId: string, decision: Partial<CustomerDecision>): Promise<CustomerDecision> {
    const response = await apiRequest<APIResponse<CustomerDecision>>(`/teams/${teamId}/decisions`, {
      method: 'POST',
      body: JSON.stringify(decision),
    });
    if (!response.data) throw new Error('Failed to create decision');
    return response.data;
  },

  async update(decisionId: string, updates: Partial<CustomerDecision>): Promise<CustomerDecision> {
    const response = await apiRequest<APIResponse<CustomerDecision>>(`/decisions/${decisionId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (!response.data) throw new Error('Failed to update decision');
    return response.data;
  },

  async delete(decisionId: string): Promise<void> {
    await apiRequest<void>(`/decisions/${decisionId}`, {
      method: 'DELETE',
    });
  },
};

// ========================================
// AI INTEGRATION
// ========================================

export const ai = {
  async classify(decisionId: string, description: string, customerContext?: string): Promise<AIClassification> {
    const response = await apiRequest<APIResponse<AIClassification>>(`/decisions/${decisionId}/classify`, {
      method: 'POST',
      body: JSON.stringify({ description, customer_context: customerContext }),
    });
    if (!response.data) throw new Error('Classification failed');
    return response.data;
  },

  async getRecommendations(decisionId: string): Promise<AIRecommendations> {
    const response = await apiRequest<APIResponse<AIRecommendations>>(`/decisions/${decisionId}/recommendations`);
    if (!response.data) throw new Error('Failed to get recommendations');
    return response.data;
  },

  async generateResponseDraft(decisionId: string, selectedOptionId?: string): Promise<ResponseDraft> {
    const response = await apiRequest<APIResponse<ResponseDraft>>(`/decisions/${decisionId}/draft`, {
      method: 'POST',
      body: JSON.stringify({ selected_option_id: selectedOptionId }),
    });
    if (!response.data) throw new Error('Failed to generate draft');
    return response.data;
  },
};

// ========================================
// DECISION WORKFLOW
// ========================================

export const criteria = {
  async list(decisionId: string): Promise<DecisionCriteria[]> {
    const response = await apiRequest<APIResponse<DecisionCriteria[]>>(`/decisions/${decisionId}/criteria`);
    return response.data || [];
  },

  async create(decisionId: string, criterion: Partial<DecisionCriteria>): Promise<DecisionCriteria> {
    const response = await apiRequest<APIResponse<DecisionCriteria>>(`/decisions/${decisionId}/criteria`, {
      method: 'POST',
      body: JSON.stringify(criterion),
    });
    if (!response.data) throw new Error('Failed to create criterion');
    return response.data;
  },
};

export const options = {
  async list(decisionId: string): Promise<ResponseOption[]> {
    const response = await apiRequest<APIResponse<ResponseOption[]>>(`/decisions/${decisionId}/options`);
    return response.data || [];
  },

  async create(decisionId: string, option: Partial<ResponseOption>): Promise<ResponseOption> {
    const response = await apiRequest<APIResponse<ResponseOption>>(`/decisions/${decisionId}/options`, {
      method: 'POST',
      body: JSON.stringify(option),
    });
    if (!response.data) throw new Error('Failed to create option');
    return response.data;
  },
};

export const evaluations = {
  async submit(decisionId: string, evaluation: Partial<TeamEvaluation>): Promise<TeamEvaluation> {
    const response = await apiRequest<APIResponse<TeamEvaluation>>(`/decisions/${decisionId}/evaluations`, {
      method: 'POST',
      body: JSON.stringify(evaluation),
    });
    if (!response.data) throw new Error('Failed to submit evaluation');
    return response.data;
  },

  async list(decisionId: string): Promise<TeamEvaluation[]> {
    const response = await apiRequest<APIResponse<TeamEvaluation[]>>(`/decisions/${decisionId}/evaluations`);
    return response.data || [];
  },
};

// ========================================
// OUTCOME TRACKING
// ========================================

export const outcomes = {
  async record(decisionId: string, outcome: Partial<DecisionOutcome>): Promise<DecisionOutcome> {
    const response = await apiRequest<APIResponse<DecisionOutcome>>(`/decisions/${decisionId}/outcome`, {
      method: 'POST',
      body: JSON.stringify(outcome),
    });
    if (!response.data) throw new Error('Failed to record outcome');
    return response.data;
  },

  async get(decisionId: string): Promise<DecisionOutcome | null> {
    try {
      const response = await apiRequest<APIResponse<DecisionOutcome>>(`/decisions/${decisionId}/outcome`);
      return response.data || null;
    } catch (error) {
      if (error instanceof APIError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },
};

// ========================================
// RESPONSE TYPES
// ========================================

export const responseTypes = {
  async list(): Promise<CustomerResponseType[]> {
    const response = await apiRequest<APIResponse<CustomerResponseType[]>>('/response-types');
    return response.data || [];
  },
};

// ========================================
// ANALYTICS & DASHBOARD
// ========================================

export const analytics = {
  async getDashboard(period: '7d' | '30d' | '90d' = '30d'): Promise<any> {
    return apiRequest<any>(`/analytics/dashboard?period=${period}`);
  },

  async getDashboardMetrics(teamId: string): Promise<DashboardMetrics> {
    const data = await this.getDashboard();
    return {
      totalDecisions: data.summary?.total_decisions || 0,
      inProgress: data.analytics?.total_decisions || 0,
      avgResponseTimeHours: data.summary?.avg_resolution_hours || 0,
      customerSatisfactionAvg: data.summary?.avg_satisfaction || 0,
      recentDecisions: data.recent_activity || [],
    };
  },

  async getResponseTimeMetrics(teamId: string, startDate?: string, endDate?: string) {
    const query = new URLSearchParams();
    if (startDate) query.append('start_date', startDate);
    if (endDate) query.append('end_date', endDate);

    return apiRequest(`/teams/${teamId}/metrics/response-time?${query.toString()}`);
  },

  async getCustomerSatisfactionMetrics(teamId: string, startDate?: string, endDate?: string) {
    const query = new URLSearchParams();
    if (startDate) query.append('start_date', startDate);
    if (endDate) query.append('end_date', endDate);

    return apiRequest(`/teams/${teamId}/metrics/satisfaction?${query.toString()}`);
  },
};

// ========================================
// HEALTH CHECK
// ========================================

export const health = {
  async check(): Promise<{ status: string; timestamp: string }> {
    return apiRequest<{ status: string; timestamp: string }>('/health');
  },
};

// Export all API modules
export const api = {
  auth,
  teams,
  decisions,
  ai,
  criteria,
  options,
  evaluations,
  outcomes,
  responseTypes,
  analytics,
  health,
};

export default api;
