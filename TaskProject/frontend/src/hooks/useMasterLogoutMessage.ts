import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const MASTER_ORIGIN = "http://127.0.0.1:8000";

export default function useMasterLogoutMessage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log("Message received:", event);

      if (event.origin !== MASTER_ORIGIN) {
        console.log("Ignored: wrong origin", event.origin);
        return;
      }

      if (event.data?.type === "MASTER_LOGOUT") {
        console.log("Logout triggered from master");
        logout();
        navigate("/", { replace: true });
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [logout, navigate]);
}