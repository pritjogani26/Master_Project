export interface MasterModule {
  id: number;
  module_name: string;
  module_key: string;
  base_url: string;
  backend_url?: string | null;
  icon?: string | null;
  description?: string | null;
  sort_order: number;
  is_active: boolean;
  is_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MasterModuleFormData {
  module_name: string;
  module_key: string;
  base_url: string;
  backend_url: string;
  icon: string;
  description: string ;
  sort_order: number;
  is_active?: boolean;
}

export interface MasterUser {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
}

export interface ApiListResponse<T> {
  message: string;
  data: T;
}

export interface AssignModulePayload {
  module_id: number;
}

export interface LaunchOptionsResponse {
  module_id: number;
  module_name: string;
  module_key: string;
  roles: Array<{
    role_code: string;
    role_name: string;
  }>;
}

export interface LaunchModuleResponse {
  module_id: number;
  module_name: string;
  module_key: string;
  selected_role: string;
  launch_url: string;
}