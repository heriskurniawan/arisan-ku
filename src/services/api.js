const API_BASE = 'http://192.168.1.100:3000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Terjadi kesalahan');
  }

  return data;
}

export const api = {
  getArisans: () => request('/arisan'),
  getArisan: (id) => request(`/arisan/${id}`),
  createArisan: (body) => request('/arisan', { method: 'POST', body: JSON.stringify(body) }),
  updateArisan: (id, body) => request(`/arisan/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteArisan: (id) => request(`/arisan/${id}`, { method: 'DELETE' }),
  drawWinner: (id) => request(`/arisan/${id}/draw`, { method: 'POST' }),

  getMembers: (arisanId) => request(`/members/${arisanId}`),
  joinArisan: (body) => request('/members/join', { method: 'POST', body: JSON.stringify(body) }),
  leaveArisan: (id) => request(`/members/${id}/leave`, { method: 'PUT' }),

  getPayments: (arisanId) => request(`/payments/${arisanId}`),
  payContribution: (body) => request('/payments/pay', { method: 'POST', body: JSON.stringify(body) }),
  getPaymentSummary: (arisanId) => request(`/payments/${arisanId}/summary`),
};
