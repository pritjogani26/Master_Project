import React, { createContext, useEffect, useMemo, useState } from "react";
import {
  AuthUser,
  AuthContextValue,
  PermissionMap,
  PageAccessMap,
} from "../types/authType";

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [access, setAccess] = useState<string | null>(null);
  const [refresh, setRefresh] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [permissions, setPermissions] = useState<PermissionMap>({});
  const [pages, setPages] = useState<PageAccessMap>({});
  const [isInitializing, setIsInitializing] = useState(true);
  const [masterUserId, setMasterUserId] = useState<number | null>(null);
  const [masterSessionToken, setMasterSessionToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const a = localStorage.getItem("access");
      const r = localStorage.getItem("refresh");
      const u = localStorage.getItem("user");
      const p = localStorage.getItem("permissions");
      const pg = localStorage.getItem("pages");
      const mu = localStorage.getItem("master_user_id");
      const mst = localStorage.getItem("master_session_token");

      if (a && r && u) {
        const parsedUser: AuthUser = JSON.parse(u);
        const parsedPermissions: PermissionMap = p ? JSON.parse(p) : {};
        const parsedPages: PageAccessMap = pg ? JSON.parse(pg) : {};

        setAccess(a);
        setRefresh(r);
        setUser(parsedUser);
        setPermissions(parsedPermissions);
        setPages(parsedPages);
        setMasterUserId(mu ? Number(mu) : null);
        setMasterSessionToken(mst || null);
      } else {
        setAccess(null);
        setRefresh(null);
        setUser(null);
        setPermissions({});
        setPages({});
        setMasterUserId(null);
        setMasterSessionToken(null);
      }
    } catch {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("user");
      localStorage.removeItem("permissions");
      localStorage.removeItem("pages");
      localStorage.removeItem("master_user_id");
      localStorage.removeItem("master_session_token");

      setAccess(null);
      setRefresh(null);
      setUser(null);
      setPermissions({});
      setPages({});
      setMasterUserId(null);
      setMasterSessionToken(null);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const login = (
    newAccess: string,
    newRefresh: string,
    newUser: AuthUser,
    newPermissions: PermissionMap = {},
    newPages: PageAccessMap = {},
    newMasterUserId: number | null = null,
    newMasterSessionToken: string | null = null
  ) => {
    localStorage.setItem("access", newAccess);
    localStorage.setItem("refresh", newRefresh);
    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("permissions", JSON.stringify(newPermissions));
    localStorage.setItem("pages", JSON.stringify(newPages));

    if (newMasterUserId !== null) {
      localStorage.setItem("master_user_id", String(newMasterUserId));
    } else {
      localStorage.removeItem("master_user_id");
    }

    if (newMasterSessionToken) {
      localStorage.setItem("master_session_token", newMasterSessionToken);
    } else {
      localStorage.removeItem("master_session_token");
    }

    setAccess(newAccess);
    setRefresh(newRefresh);
    setUser(newUser);
    setPermissions(newPermissions);
    setPages(newPages);
    setMasterUserId(newMasterUserId);
    setMasterSessionToken(newMasterSessionToken);
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    localStorage.removeItem("permissions");
    localStorage.removeItem("pages");
    localStorage.removeItem("master_user_id");
    localStorage.removeItem("master_session_token");

    setAccess(null);
    setRefresh(null);
    setUser(null);
    setPermissions({});
    setPages({});
    setMasterUserId(null);
    setMasterSessionToken(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      access,
      refresh,
      permissions,
      pages,
      isInitializing,
      masterUserId,
      masterSessionToken,
      login,
      setAccess,
      setRefresh,
      setPermissions,
      setPages,
      logout,
    }),
    [
      user,
      access,
      refresh,
      permissions,
      pages,
      isInitializing,
      masterUserId,
      masterSessionToken,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}