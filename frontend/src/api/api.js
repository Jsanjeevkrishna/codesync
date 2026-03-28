import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Execute ──────────────────────────────────────────────────────────────────
export const executeCode = (language, code, stdin = '') =>
  API.post('/execute', { language, code, stdin });

// ── Snippets ─────────────────────────────────────────────────────────────────
export const getSnippets = () => API.get('/snippets');
export const getSnippet = (id) => API.get(`/snippets/${id}`);
export const createSnippet = (data) => API.post('/snippets', data);
export const updateSnippet = (id, data) => API.put(`/snippets/${id}`, data);
export const deleteSnippet = (id) => API.delete(`/snippets/${id}`);

// ── Extensions ───────────────────────────────────────────────────────────────
export const getExtensions = () => API.get('/extensions');
export const createExtension = (data) => API.post('/extensions', data);
export const updateExtension = (id, data) => API.put(`/extensions/${id}`, data);
export const deleteExtension = (id) => API.delete(`/extensions/${id}`);

export default API;
