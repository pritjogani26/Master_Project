import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import type { User } from '../stores/useAuthStore';
import type { UserPermissions } from '../stores/useAuthStore';
export const ProtectedRoute = () => {
    // Check Zustand to see if the user is logged in
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const loginStore = useAuthStore((state) => state.login);
    
    // If they aren't logged in, redirect them to the login page
    
    
    if (!isAuthenticated) {
        
        const user:User={
        user_id:JSON.parse(localStorage.getItem('user')).user_id||null,
        role:JSON.parse(localStorage.getItem('user')).role||null,
        name:JSON.parse(localStorage.getItem('user')).name ||null

        
    }
    const storedpermissions:UserPermissions=JSON.parse(localStorage.getItem('permissions'));
    
    console.log(user);
    console.log(storedpermissions.Dashboard?.actions);
    
        if(user.user_id){
                        loginStore({ user_id: user.user_id, name:user.name,role:user.role },storedpermissions);
                        return 
        }
       
        
        return <Navigate to="/login" replace />;
    }

    // If they are logged in, render the child routes!
    return <Outlet />;
};