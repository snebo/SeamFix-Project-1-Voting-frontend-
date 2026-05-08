export interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  state: string;
  password?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}
