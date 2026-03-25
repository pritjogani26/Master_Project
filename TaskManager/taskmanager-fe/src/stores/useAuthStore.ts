import { create } from "zustand";
import { persist } from "zustand/middleware";


interface ScreenPermission{
    route:string;
    actions:string[]
}

export interface UserPermissions {
    [screenName: string]: ScreenPermission;
}

export interface User{
    user_id:number;
    name:string;
    role:string
}


interface AuthState {
    user: User | null;
    permissions: UserPermissions | null;
    isAuthenticated: boolean;
    
    login: (user: User, permissions: UserPermissions) => void;
    logout: () => void;
    
    hasAccess: (screen: string, action: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            permissions: null,
            isAuthenticated: false,

            login: (user, permissions) => 
                set({ 
                    user: user, 
                    permissions: permissions, 
                    isAuthenticated: true 
                }),

            logout: () => 
                set({ 
                    user: null, 
                    permissions: null, 
                    isAuthenticated: false 
                }),

            hasAccess: (screen, action) => {
                const currentPermissions = get().permissions;
                
                if (!currentPermissions) return false;
                
                const screenData = currentPermissions[screen];
                if (!screenData) return false;
                
                return screenData.actions.includes(action);
            }
        }),
        {
            name: 'auth-storage'
        }

    )
);