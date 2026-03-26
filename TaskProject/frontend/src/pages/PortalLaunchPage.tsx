import { useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Alert, Container, Spinner } from "reactstrap";
import axios from "axios";
import { AuthContext } from "../auth/AuthContext";
import { Role } from "../types/authType";

type ConsumeLaunchResponse = {
  message: string;
  redirect_url: string;
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  permissions: Record<string, boolean>;
  pages: Record<string, boolean>;
  master_user_id?: number | null;
  master_session_token?: string | null;
};

const API_BASE_URL = "http://127.0.0.1:8001";

export default function PortalLaunchPage() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState("");
  const auth = useContext(AuthContext);

  useEffect(() => {
    const token = searchParams.get("token");
    const nextPath = searchParams.get("next");

    const consumeLaunch = async () => {
      try {
        if (!token) {
          setError("Missing launch token");
          return;
        }

        const url = `${API_BASE_URL}/api/portal/consume-launch/${
          nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""
        }`;

        const response = await axios.post<ConsumeLaunchResponse>(url, {
          launch_token: token,
        });

        const data = response.data;

        const normalizedUser = {
          ...data.user,
          role: data.user.role as Role,
        };

        if (!auth) {
          setError("Auth context is not available");
          return;
        }

        auth.login(
          data.access_token,
          data.refresh_token,
          normalizedUser,
          data.permissions || {},
          data.pages || {},
          data.master_user_id ?? null,
          data.master_session_token ?? null
        );

        window.location.replace(data.redirect_url);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.detail ||
            "Failed to launch portal session"
        );
      }
    };

    consumeLaunch();
  }, [searchParams, auth]);

  return (
    <Container className="py-5">
      {error ? (
        <Alert color="danger">{error}</Alert>
      ) : (
        <div className="text-center py-5">
          <Spinner color="primary" />
          <div className="mt-3">Launching your dashboard...</div>
        </div>
      )}
    </Container>
  );
}