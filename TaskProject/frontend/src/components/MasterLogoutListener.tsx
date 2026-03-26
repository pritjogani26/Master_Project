import { useContext, useEffect } from "react";
import { AuthContext } from "../auth/AuthContext";

export default function MasterLogoutListener() {
  const auth = useContext(AuthContext);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log("CHILD MESSAGE RECEIVED:", event.origin, event.data);
      console.log("CURRENT ORIGIN:", window.location.origin);

      if (event.data?.type === "MASTER_LOGOUT") {
        console.log("MASTER_LOGOUT received, logging out child...");
        auth?.logout();

        console.log("AFTER LOGOUT access:", localStorage.getItem("access"));
        console.log("AFTER LOGOUT refresh:", localStorage.getItem("refresh"));

        window.location.reload();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [auth]);

  return null;
}