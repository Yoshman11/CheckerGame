export interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  username: string;
}