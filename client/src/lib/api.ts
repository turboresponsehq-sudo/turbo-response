// API Configuration
export const API_BASE_URL = '';

// API Helper Functions
export const api = {
  // POST request helper
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  },

  // GET request helper
  get: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  },

  // File upload helper
  uploadFile: async (endpoint: string, formData: FormData) => {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('🔵 API.uploadFile: Starting fetch to:', url);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      console.log('🔵 API.uploadFile: Response received:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      if (!response.ok) {
        console.log('❌ API.uploadFile: Response not OK');
        const error = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ API.uploadFile: Success, data:', data);
      return data;
    } catch (error: any) {
      console.error('❌ API.uploadFile: Fetch error:', error);
      throw error;
    }
  },
};
