import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, STORAGE_KEYS } from '../constants';
import type { ApiError } from '../types';

async function getToken(): Promise<string | null> {
  try { return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN); }
  catch { return null; }
}

async function request<T>(endpoint: string, options: {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
} = {}): Promise<T> {
  const { method = 'GET', body } = options;
  const token = await getToken();
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(tid);
    if (!res.ok) {
      let err: ApiError;
      try { err = await res.json(); }
      catch { err = { message: `Error ${res.status}`, statusCode: res.status }; }
      throw err;
    }
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  } catch (e) {
    clearTimeout(tid);
    if ((e as Error).name === 'AbortError') {
      throw { message: 'Tiempo de espera agotado. Revisá tu conexión.', code: 'TIMEOUT' } as ApiError;
    }
    throw e;
  }
}

export const httpClient = {
  get:    <T>(ep: string)                => request<T>(ep, { method: 'GET' }),
  post:   <T>(ep: string, body: unknown) => request<T>(ep, { method: 'POST', body }),
  put:    <T>(ep: string, body: unknown) => request<T>(ep, { method: 'PUT', body }),
  delete: <T>(ep: string)                => request<T>(ep, { method: 'DELETE' }),
};
