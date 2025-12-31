import axios from 'axios';

/**
 * Setup global axios interceptor to handle 401 responses
 * This is called once during app initialization
 */
export function setupAxiosInterceptor(onUnauthorized: () => void) {
  // Response interceptor to catch 401 errors
  axios.interceptors.response.use(
    // Success response - pass through
    (response) => response,
    
    // Error response - handle 401
    (error) => {
      const status = error.response?.status;
      
      if (status === 401) {
        console.warn('[AxiosInterceptor] 401 Unauthorized - token expired or invalid');
        // Call the callback to clear token and redirect
        onUnauthorized();
      }
      
      // Always reject the error so the caller can handle it if needed
      return Promise.reject(error);
    }
  );
}
