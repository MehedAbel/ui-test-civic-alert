const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');
const TOKEN_STORAGE_KEY = 'civicalert_jwt_token';

export function resolveAssetUrl(url) {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }
  if (url.startsWith('/uploads/') && API_BASE) {
    return `${API_BASE}${url}`;
  }
  return url;
}

export function getStoredToken() {
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token) {
  try {
    if (token) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, init, retriesLeft) {
  try {
    return await fetch(url, init);
  } catch (err) {
    if (retriesLeft > 0) {
      await sleep(450);
      return fetchWithRetry(url, init, retriesLeft - 1);
    }
    throw err;
  }
}

async function request(path, options = {}) {
  const token = getStoredToken();
  const headers = new Headers(options.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const method = (options.method || 'GET').toUpperCase();
  const retries = method === 'GET' ? 2 : 0;

  let response;
  try {
    console.log("API BASE URL:", import.meta.env.VITE_API_BASE_URL);
    console.log("URL2:", API_BASE);
    response = await fetchWithRetry(
      `${API_BASE}${path}`,
      {
        ...options,
        headers,
        // credentials: 'include',
        redirect: 'manual',
      },
      retries
    );
  } catch {
    throw new Error(
      'Unable to reach the Civic Alert server. Please check your connection or refresh the page.'
    );
  }

  if (response.type === 'opaqueredirect' || (response.status >= 300 && response.status < 400)) {
    throw new Error(
      'Preview session expired or redirected. Please refresh the page and try again.'
    );
  }

  if (response.status === 204) {
    return undefined;
  }

  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      if (!response.ok) {
        throw new Error(`Server returned an unexpected response (${response.status}).`);
      }
      throw new Error('Server is still starting up. Please refresh and try again.');
    }
  }

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.title ||
      `Request failed (${response.status})`;
    throw new Error(message);
  }

  return payload;
}

export const apiClient = {
  login(email, password) {
    console.log("API BASE URL:", import.meta.env.VITE_API_BASE_URL);
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  registerCitizen(data) {
    return request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  me() {
    return request('/api/auth/me');
  },

  getAllIssues(filters) {
    const params = new URLSearchParams();
    if (filters?.type) params.set('type', filters.type);
    if (filters?.status) params.set('status', filters.status);
    const qs = params.toString();
    return request(`/api/issues${qs ? `?${qs}` : ''}`);
  },

  getMyIssues() {
    return request('/api/issues/mine');
  },

  createIssue(formData) {
    return request('/api/issues', {
      method: 'POST',
      body: formData,
    });
  },

  updateIssueStatus(id, status, note) {
    return request(`/api/issues/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
  },

  updateProfile(data) {
    return request('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  changePassword(currentPassword, newPassword) {
    return request('/api/profile/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  getAdminUsers() {
    return request('/api/admin/users');
  },

  assignUserRole(id, role, isActive) {
    return request(`/api/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role, isActive }),
    });
  },
};
