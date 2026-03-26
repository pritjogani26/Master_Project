// src/services/masterSessionService.ts

import axios from "axios";

const MASTER_API = "http://127.0.0.1:8001/api";

export const checkMasterSession = async (
  masterUserId: number,
  sessionToken: string
) => {
  const res = await axios.get(`${MASTER_API}/auth/session-status/`, {
    params: {
      master_user_id: masterUserId,
      session_token: sessionToken,
    },
  });

  return res.data;
};