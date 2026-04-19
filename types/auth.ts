export interface User {
  id: number;
  username: string;
  created_at: string;
}

export interface Session {
  user_id: number;
  username: string;
  token: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
}