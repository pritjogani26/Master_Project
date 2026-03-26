import type { MasterLoginResponse, MasterUser } from "../types/auth";

export const setMasterAuthData = (data: MasterLoginResponse): void => {
  localStorage.setItem("master_access", data.access);
  localStorage.setItem("master_refresh", data.refresh);
  localStorage.setItem("master_user", JSON.stringify(data.user));
};

export const getMasterAccessToken = (): string | null => {
  return localStorage.getItem("master_access");
};

export const getMasterRefreshToken = (): string | null => {
  return localStorage.getItem("master_refresh");
};

export const getMasterUser = (): MasterUser | null => {
  const raw = localStorage.getItem("master_user");
  return raw ? (JSON.parse(raw) as MasterUser) : null;
};

export const clearMasterAuthData = (): void => {
  localStorage.removeItem("master_access");
  localStorage.removeItem("master_refresh");
  localStorage.removeItem("master_user");
};