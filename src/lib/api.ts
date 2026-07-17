import { 
  Customer, Prediction, AIReport, FollowUp, User, ActivityLog, AppSettings 
} from '../types';

// Extract logged-in user ID from localStorage
export function getCurrentUserId(): string {
  const userJson = localStorage.getItem('telecom_user');
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      return user.id;
    } catch {
      return 'u1';
    }
  }
  return 'u1';
}

function getHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-User-Id': getCurrentUserId()
  };
}

export const api = {
  // Auth
  setAuthHeader(userId: string): void {
    // Dynamically resolved via localStorage/getCurrentUserId
  },

  async login(username: string, passwordString: string): Promise<User> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: passwordString })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Login failed');
    }
    const data = await res.json();
    return data.user;
  },

  async signup(payload: any): Promise<User> {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Signup failed');
    }
    const data = await res.json();
    return data.user;
  },

  async forgotPassword(email: string): Promise<string> {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Request failed');
    }
    const data = await res.json();
    return data.message;
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ oldPassword, newPassword })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to change password');
    }
    return true;
  },

  // Customers
  async getCustomers(): Promise<Customer[]> {
    const res = await fetch('/api/customers', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load customers');
    return res.json();
  },

  async getCustomer(id: string): Promise<Customer> {
    const res = await fetch(`/api/customers/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load customer details');
    return res.json();
  },

  async createCustomer(payload: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'churnProbability' | 'riskLevel'>): Promise<Customer> {
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to create customer');
    }
    return res.json();
  },

  async updateCustomer(id: string, payload: Partial<Customer>): Promise<Customer> {
    const res = await fetch(`/api/customers/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update customer');
    }
    return res.json();
  },

  async deleteCustomer(id: string): Promise<boolean> {
    const res = await fetch(`/api/customers/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete customer');
    return true;
  },

  // Predictions
  async runPredict(customerId: string): Promise<Prediction> {
    const res = await fetch(`/api/predictions/predict/${customerId}`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to compute prediction model');
    return res.json();
  },

  async getPredictionHistory(customerId: string): Promise<Prediction[]> {
    const res = await fetch(`/api/predictions/history/${customerId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load prediction history');
    return res.json();
  },

  // Gemini Churn Insights
  async runAiInsights(customerId: string): Promise<AIReport> {
    const res = await fetch(`/api/ai/insights/${customerId}`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to analyze via Gemini AI service');
    return res.json();
  },

  async getAiReports(customerId: string): Promise<AIReport[]> {
    const res = await fetch(`/api/ai/reports/${customerId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load AI retention reports');
    return res.json();
  },

  // Follow Ups
  async getFollowUps(): Promise<FollowUp[]> {
    const res = await fetch('/api/followups', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load follow-up records');
    return res.json();
  },

  async createFollowUp(payload: Omit<FollowUp, 'id' | 'createdAt'>): Promise<FollowUp> {
    const res = await fetch('/api/followups', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to schedule follow-up');
    return res.json();
  },

  async updateFollowUp(id: string, payload: { notes: string; customerResponse: string; status: 'Open' | 'Closed' }): Promise<FollowUp> {
    const res = await fetch(`/api/followups/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update follow-up card');
    return res.json();
  },

  // Logs
  async getLogs(): Promise<ActivityLog[]> {
    const res = await fetch('/api/logs', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load audit trails');
    return res.json();
  },

  // Admin User List Management
  async getUsers(): Promise<User[]> {
    const res = await fetch('/api/users', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load portal users');
    return res.json();
  },

  async updateUserRole(targetUserId: string, role: string): Promise<boolean> {
    const res = await fetch(`/api/users/${targetUserId}/role`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ role })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update role');
    }
    return true;
  },

  async updateUserStatus(targetUserId: string, status: 'active' | 'inactive'): Promise<boolean> {
    const res = await fetch(`/api/users/${targetUserId}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update status');
    }
    return true;
  },

  // Settings
  async getSettings(): Promise<AppSettings> {
    const res = await fetch('/api/settings', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load settings');
    return res.json();
  },

  async updateSettings(payload: AppSettings): Promise<AppSettings> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update system settings');
    return res.json();
  },

  async testGeminiApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/settings/test-key', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ apiKey })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to validate API Key');
    return data;
  }
};
