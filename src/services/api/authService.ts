import { httpClient } from '../httpClient';
import { API_ENDPOINTS } from '../../constants';
import type { LoginCredentials, RegisterPayload, User, ApiResponse } from '../../types';

interface AuthResponse { user: User; token: string; }

export const authService = {
  login:    (c: LoginCredentials) =>
    httpClient.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.login, c),
  register: (p: RegisterPayload) =>
    httpClient.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.register, p),
  logout:   () =>
    httpClient.post<ApiResponse<null>>(API_ENDPOINTS.logout, {}),
  getMe:    () =>
    httpClient.get<ApiResponse<User>>(API_ENDPOINTS.me),
};
