// src/components/GoogleLoginButton.tsx
import { useEffect, useRef } from "react";
import { api } from "../api/api";
import type { AuthUser, PermissionMap, PageAccessMap } from "../types/authType";

declare global {
  interface Window {
    google?: any;
  }

  interface ImportMeta {
    readonly env: {
      readonly VITE_GOOGLE_CLIENT_ID: string;
    };
  }
}

type GoogleAuthData = {
  pages: PageAccessMap;
  permissions: PermissionMap;
  access: string;
  refresh: string;
  user: AuthUser;
  master_user_id?: number | null;
  master_session_token?: string | null;
};

type Props = {
  onSuccess?: (data: GoogleAuthData) => void;
};

export default function GoogleLoginButton({ onSuccess }: Props) {
  const btnRef = useRef<HTMLDivElement>(null);

  //  keep latest onSuccess without re-running init effect
  const onSuccessRef = useRef<Props["onSuccess"]>(onSuccess);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    const id = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!id) {
      console.error("Missing VITE_GOOGLE_CLIENT_ID");
      return;
    }

    let mounted = true;

    const init = () => {
      if (!mounted || !window.google?.accounts?.id || !btnRef.current) return;


      btnRef.current.innerHTML = "";

      window.google.accounts.id.initialize({
        client_id: id,
        callback: async (resp: any) => {
          try {
            const res = await api.post("/auth/google/", { credential: resp.credential });

            onSuccessRef.current?.({
              access: res.data.access,
              refresh: res.data.refresh,
              user: res.data.user,
              permissions: res.data.permissions || {},
              pages: res.data.pages || {},
              master_user_id: res.data.master_user_id ?? null,
              master_session_token: res.data.master_session_token ?? null,
            });
          } catch (e: any) {
            console.error(e?.response?.data || e);
            alert(e?.response?.data?.message || "Google login failed");
          }
        },
      });

      window.google.accounts.id.renderButton(btnRef.current, {
        theme: "outline",
        size: "large",
        width: 400,
        text: "continue_with",
        shape: "pill",
      });

      // optional one-tap:
      // window.google.accounts.id.prompt();
    };

    // script loads async; poll a bit
    const t = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(t);
        init();
      }
    }, 50);

    return () => {
      mounted = false;
      clearInterval(t);
      // Optional cleanup:
      // window.google?.accounts?.id?.cancel?.();
    };
  }, []); // ✅ run once only

  return <div ref={btnRef} />;
}