export interface MasterUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface MasterLoginPayload {
  email: string;
  password: string;
}

export interface MasterLoginResponse {
  access: string;
  refresh: string;
  user: MasterUser;
}