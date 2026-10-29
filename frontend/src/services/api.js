/**
 * API Service for Nayatel Cloud Authentication & Services
 * Connects the React Frontend to the Django REST Framework Backend
 */

const API_BASE_URL = 'http://127.0.0.1:8000/api';

/**
 * Helper to get authorization headers with Token
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('nayatel_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Token ${token}` } : {}),
  };
};

/**
 * Handle API responses and standardized error messages
 */
async function handleResponse(response) {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    let errorMessage = 'An unexpected error occurred.';
    if (data) {
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (data.detail) {
        errorMessage = data.detail;
      } else if (data.non_field_errors) {
        errorMessage = Array.isArray(data.non_field_errors)
          ? data.non_field_errors.join(' ')
          : data.non_field_errors;
      } else if (typeof data === 'object') {
        const errorList = Object.entries(data).map(([field, msgs]) => {
          const msgText = Array.isArray(msgs) ? msgs.join(' ') : msgs;
          return `${field}: ${msgText}`;
        });
        errorMessage = errorList.join(' | ');
      }
    }
    throw new Error(errorMessage);
  }

  return data;
}

// ============================================================
// AUTHENTICATION APIS
// ============================================================

export async function loginUser(username, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await handleResponse(response);
  if (data?.token) {
    localStorage.setItem('nayatel_token', data.token);
    localStorage.setItem('nayatel_user', JSON.stringify(data.user));
  }
  return data;
}

export async function registerUser({ username, email, full_name, phone, company, password, password2 }) {
  const response = await fetch(`${API_BASE_URL}/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      email,
      full_name,
      phone,
      company,
      password,
      password2
    }),
  });
  const data = await handleResponse(response);
  if (data?.token) {
    localStorage.setItem('nayatel_token', data.token);
    localStorage.setItem('nayatel_user', JSON.stringify(data.user));
  }
  return data;
}

export async function getCurrentUser() {
  const response = await fetch(`${API_BASE_URL}/auth/user/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function logoutUser() {
  try {
    await fetch(`${API_BASE_URL}/auth/logout/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  } catch (err) {
    console.warn('Logout API warning:', err);
  } finally {
    localStorage.removeItem('nayatel_token');
    localStorage.removeItem('nayatel_user');
  }
}

export async function forgotPassword(identifier) {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier }),
  });
  return handleResponse(response);
}

// ============================================================
// NAYATEL CLOUD SERVICES & SUBSCRIPTIONS APIS
// ============================================================

/**
 * Fetch all available cloud services, specs, and prices
 */
export async function fetchCloudServices() {
  const response = await fetch(`${API_BASE_URL}/services/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse(response);
}

/**
 * Fetch subscriptions for currently logged-in user
 */
export async function fetchUserSubscriptions() {
  const response = await fetch(`${API_BASE_URL}/subscriptions/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

/**
 * Checkout and subscribe to selected services
 */
export async function checkoutSubscriptions(serviceIds, customNotes = '') {
  const response = await fetch(`${API_BASE_URL}/subscriptions/checkout/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      service_ids: serviceIds,
      custom_notes: customNotes
    }),
  });
  return handleResponse(response);
}

/**
 * Cancel or cross-off a subscription
 */
export async function cancelSubscription(subId) {
  const response = await fetch(`${API_BASE_URL}/subscriptions/${subId}/cancel/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}
