import { APITester } from "./APITester";
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from "./logo.svg";
import reactLogo from "./react.svg";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from "./components/LoginForm";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Dashboard from "./components/Dashboard";
import { RoleRightsManager } from "./components/RoleRightsManager";
import { useStore } from "zustand";
import { useAuthStore } from "./stores/useAuthStore";
import { AppLayout } from "./components/AppLayout";
import Admin from "./components/Admin";

// Create a client instance
const queryClient = new QueryClient();
export function App() {
    const permissions =useAuthStore((state)=>state.permissions);
    
    
 return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    {/* Public Route */}
                    <Route path="/login" element={<LoginForm />} />

                    {/* Protected Routes (Requires Login) */}
                    <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={
                  <AppLayout>
            <Dashboard />
                  </AppLayout>
                             } />                    
                        <Route path="/projects/:id/tasks" element={<div>Project Tasks Page</div>} />
                        <Route path="/admin" element={<AppLayout><Admin/></AppLayout>}/>
                       

                    </Route>

                    {/* Fallback Route: Redirect unknown URLs to dashboard or login */}
                   <Route path="/superadmin" element={
          <AppLayout>
            <RoleRightsManager />
          </AppLayout>
        } />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;
