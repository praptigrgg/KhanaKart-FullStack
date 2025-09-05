// src/api/useApi.js
import { api } from './client';

export function useApi() {
  // GET request
  async function get(url) {
    const response = await api.get(url);
    return response.data;
  }

  // POST request
  async function post(url, data) {
    const response = await api.post(url, data);
    return response.data;
  }

  // PUT request
  async function put(url, data) {
    const response = await api.put(url, data);
    return response.data;
  }

  // DELETE request
  async function del(url) {
    const response = await api.delete(url);
    return response.data;
  }

  return { get, post, put, del };
}
