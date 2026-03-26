import { APITester } from "./APITester";
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from "./logo.svg";
import reactLogo from "./react.svg";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from "./components/Login";
import { useAuthStore } from "./Store/useAuthStore";
import  ModuleDashboard from "./components/Dashboard";
import { CookiesProvider } from 'react-cookie';


// Create a client instance
const queryClient = new QueryClient();
export function App() {
    const permissions =useAuthStore((state)=>state.permissions);
    
    
 return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
            <CookiesProvider defaultSetOptions={{path:'/'}}>
                <Routes>
                    {/* Public Route */}
                    <Route path="/login" element={<LoginForm />} />

                     {/* Protected Routes (Requires Login) */}
                    <Route path="/dashboard" element={<ModuleDashboard />} />

                    {/* Protected Routes (Requires Login) */}
                    
        </Routes>
        </CookiesProvider>
          </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;
