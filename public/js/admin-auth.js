(function() {
  const TOKEN_KEY = 'auth_token_v1';

  function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || '';
  }

  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  }

  async function fetchWithAuth(url, options = {}) {
    const headers = Object.assign({}, options.headers || {});
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(url, Object.assign({}, options, { headers }));
  }

  async function requireAdmin() {
    try {
      const res = await fetchWithAuth('/api/auth/me');
      if (!res.ok) throw new Error('unauthorized');
      const user = await res.json();
      if (!user || (user.role !== 'admin')) throw new Error('forbidden');
      return user;
    } catch (e) {
      window.location.href = '/admin/login.html?next=' + encodeURIComponent(location.pathname + location.search);
      throw e;
    }
  }

  function logout() {
    clearToken();
    window.location.href = '/admin/login.html';
  }

  window.AdminAuth = {
    setToken,
    getToken,
    clearToken,
    fetchWithAuth,
    requireAdmin,
    logout
  };
})();

