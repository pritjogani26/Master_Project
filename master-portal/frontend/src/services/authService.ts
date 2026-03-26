import axios from "axios";
import type { MasterLoginPayload, MasterLoginResponse } from "../types/auth";

const API_BASE_URL = "http://127.0.0.1:8000";

export const loginMasterUser = async (
  payload: MasterLoginPayload
): Promise<MasterLoginResponse> => {
  const response = await axios.post<MasterLoginResponse>(
    `${API_BASE_URL}/auth/login/`,
    payload
  );

  return response.data;
};