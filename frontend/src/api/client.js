const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const TOKEN_KEY = "shopnow_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // non-JSON error body — keep the default message
    }
    throw new Error(detail);
  }
  return res.json();
}

// --- Products ---
export function getProducts(category) {
  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  return request(`/products/${query}`);
}

export function getProduct(id) {
  return request(`/products/${id}`);
}

// --- Cart ---
export function getCart(sessionId) {
  return request(`/cart/${sessionId}`);
}

export function addToCart(productId, quantity = 1, sessionId) {
  const query = sessionId ? `?session_id=${encodeURIComponent(sessionId)}` : "";
  return request(`/cart/${query}`, {
    method: "POST",
    body: JSON.stringify({ product_id: productId, quantity }),
  });
}

export function updateCartItem(sessionId, productId, quantity) {
  return request(`/cart/${sessionId}/${productId}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });
}

export function removeCartItem(sessionId, productId) {
  return request(`/cart/${sessionId}/${productId}`, { method: "DELETE" });
}

export function clearCart(sessionId) {
  return request(`/cart/${sessionId}`, { method: "DELETE" });
}

// --- Auth ---
export function register({ name, email, password }) {
  return request(`/auth/register`, {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export function login({ email, password }) {
  return request(`/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getMe() {
  return request(`/auth/me`);
}

// --- Orders ---
export function placeOrder({ customerName, customerEmail, shippingAddress, sessionId }) {
  return request(`/orders/`, {
    method: "POST",
    body: JSON.stringify({
      customer_name: customerName,
      customer_email: customerEmail,
      shipping_address: shippingAddress,
      session_id: sessionId,
    }),
  });
}

export function getMyOrders() {
  return request(`/orders/me`);
}
