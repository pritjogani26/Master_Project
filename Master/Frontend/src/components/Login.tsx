import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../Store/useAuthStore';
import api from '@/API/interceptor.ts';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';




export const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate=useNavigate()
    

    // Grab the login action from your Zustand store
    const loginStore = useAuthStore((state) => state.login);
      const [cookies, setCookie, removeCookie] = useCookies(['access_token']);


    // Set up the React Query Mutation
    const loginMutation = useMutation({
        mutationFn: async (credentials: any) => {
            const response = await axios.post("http://localhost:8000/api/login/",{
                username:username,
                password:password
            },{
                withCredentials:true
            })
            

            console.log(response.data);
            return response.data
            
          
            
            
        },
        onSuccess: (data) => {
            // SUCCESS! Update Zustand and redirect
            console.log("inside success");
           
            
            
            loginStore({ user_id: data.user.user_id, name:data.user.name,role: data.user.role ,token:data.user.token}, data.permissions);
            localStorage.setItem("user",JSON.stringify(data.user));
            localStorage.setItem("permissions",JSON.stringify(data.permissions));
            
            console.log("Logged in successfully  inside !");
            
            
            navigate("/dashboard")
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Trigger the mutation
        loginMutation.mutate({ username, password });
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
                    <div className="card shadow-sm p-4">
                        <h3 className="text-center mb-4">Sign In</h3>

                        {/* React Query automatically handles the error state! */}
                        {loginMutation.isError && (
                            <div className="alert alert-danger">
                                {loginMutation.error.message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Username</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required 
                                />
                            </div>

                            <div className="mb-4">
                                <label className="form-label">Password</label>
                                <input 
                                    type="password" 
                                    className="form-control" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required 
                                />
                            </div>

                            <div className="d-grid">
                                {/* React Query automatically handles the loading state! */}
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    disabled={loginMutation.isPending}
                                >
                                    {loginMutation.isPending ? 'Logging in...' : 'Login'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};