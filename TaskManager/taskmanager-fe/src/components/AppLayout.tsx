import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { Dropdown } from 'react-bootstrap';

// --- HEADER COMPONENT ---
const Header = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-bottom sticky-top shadow-sm">
      <div className="container d-flex justify-content-between align-items-center py-3">
        {/* Brand / Logo Area */}
        <div 
            className="d-flex align-items-center gap-2 cursor-pointer" 
            onClick={() => navigate('/dashboard')}
            style={{ cursor: 'pointer' }}
        >
          <div className="bg-dark text-white rounded-3 d-flex justify-content-center align-items-center" style={{ width: '35px', height: '35px', fontWeight: 'bold' }}>
            T
          </div>
          <span className="fw-bold fs-5 text-dark letter-spacing-1">TaskFlow</span>
        </div>

        {/* Navigation Links (Hidden on very small screens) */}
        <nav className="d-none d-md-flex gap-4">
          <button 
            onClick={() => navigate('/dashboard')} 
            className={`btn btn-link text-decoration-none fw-medium px-0 ${location.pathname === '/dashboard' ? 'text-dark' : 'text-muted'}`}
          >
            Dashboard
          </button>
          {user?.role === 'super admin' && (
             <button 
               onClick={() => navigate('/superadmin')} 
               className={`btn btn-link text-decoration-none fw-medium px-0 ${location.pathname === '/superadmin' ? 'text-dark' : 'text-muted'}`}
             >
               Super Admin
             </button>
          )}
        </nav>

        {/* User Profile Dropdown */}
        <div className="d-flex align-items-center">
          <Dropdown align="end">
            <Dropdown.Toggle variant="light" className="bg-white border-0 shadow-none d-flex align-items-center gap-2">
              <div className="bg-light border rounded-circle d-flex justify-content-center align-items-center text-muted fw-bold" style={{ width: '35px', height: '35px' }}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="d-none d-md-inline text-dark fw-medium small">{user?.name || 'User'}</span>
            </Dropdown.Toggle>

            <Dropdown.Menu className="shadow border-0 rounded-3 mt-2">
              <div className="px-3 py-2 border-bottom mb-2">
                <p className="mb-0 fw-bold text-dark small">{user?.name}</p>
                <p className="mb-0 text-muted small" style={{ fontSize: '0.8rem' }}>{user?.role}</p>
              </div>
              <Dropdown.Item onClick={() => navigate('/profile')} className="small text-dark fw-medium">Profile Settings</Dropdown.Item>
              <Dropdown.Item onClick={handleLogout} className="small text-danger fw-medium">Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};

// --- FOOTER COMPONENT ---
const Footer = () => {
  return (
    <footer className="bg-white border-top py-4 mt-auto">
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <div className="text-muted small">
          &copy; {new Date().getFullYear()} AppName Inc. All rights reserved.
        </div>
        <div className="d-flex gap-4 small fw-medium">
          <a href="#" className="text-muted text-decoration-none hover-dark">Privacy Policy</a>
          <a href="#" className="text-muted text-decoration-none hover-dark">Terms of Service</a>
          <a href="#" className="text-muted text-decoration-none hover-dark">Support</a>
        </div>
      </div>
    </footer>
  );
};


// --- MAIN LAYOUT WRAPPER ---
export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    // min-vh-100 ensures the screen is always at least 100% of the viewport height.
    // flex-column pushes the footer to the bottom.
    // bg-light gives the whole app a soft off-white background so the white cards pop.
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Header />
      
      {/* flex-grow-1 ensures this main area takes up all available empty space */}
      <main className="flex-grow-1">
        {children}
      </main>
      
      <Footer />
    </div>
  );
};