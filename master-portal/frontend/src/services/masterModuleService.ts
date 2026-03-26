import type { AxiosResponse } from "axios";
import api from "./api";

import type {
  ApiListResponse,
  AssignModulePayload,
  MasterModule,
  MasterModuleFormData,
} from "../types/masterModule";

export type LaunchRoleOption = {
  role_code: string;
  label: string;
};

export type LaunchOptionsResponse = {
  module_id: number;
  module_name: string;
  module_key: string;
  role_options: LaunchRoleOption[];
};

export type LaunchModuleResponse = {
  module_id: number;
  module_name: string;
  module_key: string;
  selected_role: string;
  launch_url: string;
};

export const getModules = async (): Promise<ApiListResponse<MasterModule[]>> => {
  const response: AxiosResponse<ApiListResponse<MasterModule[]>> =
    await api.get("/modules/");
  return response.data;
};

export const registerModule = async (
  payload: MasterModuleFormData
): Promise<ApiListResponse<MasterModule>> => {
  const response: AxiosResponse<ApiListResponse<MasterModule>> =
    await api.post("/modules/", payload);
  return response.data;
};

export const updateModule = async (
  moduleId: number,
  payload: MasterModuleFormData
): Promise<ApiListResponse<MasterModule>> => {
  const response: AxiosResponse<ApiListResponse<MasterModule>> =
    await api.put(`/modules/${moduleId}/`, payload);
  return response.data;
};

export const deactivateModule = async (
  moduleId: number
): Promise<ApiListResponse<MasterModule>> => {
  const response: AxiosResponse<ApiListResponse<MasterModule>> =
    await api.delete(`/modules/${moduleId}/`);
  return response.data;
};

export const assignModuleToUser = async (
  userId: number,
  payload: AssignModulePayload
): Promise<ApiListResponse<unknown>> => {
  const response: AxiosResponse<ApiListResponse<unknown>> = await api.post(
    `/users/${userId}/assign-module/`,
    payload
  );
  return response.data;
};

export const fetchModuleLaunchOptions = async (
  moduleId: number
): Promise<LaunchOptionsResponse> => {
  const response: AxiosResponse<LaunchOptionsResponse> = await api.post(
    `/modules/${moduleId}/launch-options/`,
    {}
  );
  return response.data;
};

export const launchModule = async (
  moduleId: number,
  selectedRole: string
): Promise<LaunchModuleResponse> => {
  const response: AxiosResponse<LaunchModuleResponse> = await api.post(
    `/modules/${moduleId}/launch/`,
    {
      selected_role: selectedRole,
    }
  );
  return response.data;
};