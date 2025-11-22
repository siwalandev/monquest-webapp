/**
 * Authenticated fetch utilities
 * Automatically adds x-user-id header for API requests
 */

/**
 * Get current user ID from localStorage
 * This matches the AuthContext pattern
 */
function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const storedUser = localStorage.getItem('admin_user');
    if (!storedUser) return null;
    
    const userData = JSON.parse(storedUser);
    return userData?.id || null;
  } catch (error) {
    console.error('Failed to get user ID:', error);
    return null;
  }
}

/**
 * Authenticated fetch - automatically adds x-user-id header
 * Usage: authFetch('/api/theme-presets', { method: 'POST', body: ... })
 */
export async function authFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const userId = getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const headers = new Headers(options?.headers || {});
  headers.set('x-user-id', userId);
  
  // Set Content-Type to application/json if body exists and not already set
  if (options?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Authenticated fetch with JSON response
 * Automatically parses response as JSON and throws on error
 */
export async function authFetchJSON<T = any>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await authFetch(url, options);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}
