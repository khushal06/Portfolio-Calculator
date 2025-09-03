// API wrapper for backend endpoints

const API_BASE_URL = 'http://localhost:8000';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(`Network error: ${error.message}`, 0);
  }
}

export const api = {
  // Health check
  async health() {
    return apiRequest('/health');
  },

  // Calculate scenario results
  async calculateScenario(data) {
    return apiRequest('/calc/scenario', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Calculate targets
  async calculateTargets(data) {
    return apiRequest('/calc/targets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Calculate blended
  async calculateBlended(data) {
    return apiRequest('/calc/blended', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Calculate rebalance
  async calculateRebalance(data) {
    return apiRequest('/calc/rebalance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export { ApiError };
