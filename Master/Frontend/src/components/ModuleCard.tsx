import React from 'react';
import type { IModule } from './Dashboard'; // Adjust the import path if needed
import { useAuthStore } from '../Store/useAuthStore';
interface ModuleCardProps {
  module: IModule;
  permissions: any; // Replace 'any' with your actual permissions type
}

export const ModuleCard: React.FC<ModuleCardProps> = ({ module, permissions }) => {
  // Check if user has edit/delete permissions for UI rendering
  const canEdit = permissions?.Dashboard?.actions.includes("Update");
  const canDelete = permissions?.Dashboard?.actions.includes("Delete");
  const token = useAuthStore((state) => state.user?.token);

  // 2. The Launch Handler
  const handleLaunch = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!module.url) {
      alert("This module doesn't have a valid URL configured.");
      return;
    }

    try {
      // Safely construct the URL (this handles existing query params automatically)
      const targetUrl = new URL(module.url);
      console.log(targetUrl);
      
      
      // Append the auth token if we have one
      if (token) {
        targetUrl.searchParams.append('auth_token', token);
      }

      // Open the module in a new tab securely
      window.open(targetUrl.toString(), '_blank', 'noopener,noreferrer');
      
      // OR, if you want it to open in the SAME tab, use this instead:
      // window.location.href = targetUrl.toString();

    } catch (error) {
      console.error("Invalid URL format:", module.url);
    }
  };

  return (
    <div className="card h-100 border-0 shadow-sm rounded-4 text-start position-relative" style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}>
      <div className="card-body p-4 d-flex flex-column">
        
        {/* Header: Icon & Action Menu */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div 
            className="d-flex justify-content-center align-items-center bg-light rounded-3 shadow-sm border border-white"
            style={{ width: '48px', height: '48px', flexShrink: 0 }}
          >
            {module.icon_url ? (
              <img 
                src={module.icon_url} 
                alt={`${module.name} icon`} 
                style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                onError={(e) => {
                  // Fallback if the image URL is broken
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '🧩';
                }}
              />
            ) : (
              <span className="fs-4">🧩</span> // Default fallback icon
            )}
          </div>

          {/* Optional: Dropdown for Edit/Delete actions if user has permission */}
          {(canEdit || canDelete) && (
            <div className="dropdown">
              <button 
                className="btn btn-sm btn-light border-0 text-muted p-1" 
                type="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                ⋮
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-1">
                {canEdit && <li><button className="dropdown-item text-secondary small">Edit Module</button></li>}
                {canDelete && <li><button className="dropdown-item text-danger small">Delete Module</button></li>}
              </ul>
            </div>
          )}
        </div>

        {/* Content: Title & Description */}
        <h5 className="card-title fw-bold text-dark mb-2 text-truncate" title={module.name}>
          {module.name}
        </h5>
        
        <p className="card-text text-muted small flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {module.description || 'No description provided for this module.'}
        </p>

        {/* Footer: Launch Button */}
        <div className="mt-4 pt-3 border-top border-light">
          <button 
            onClick={handleLaunch}
           
            rel="noopener noreferrer" 
            className="btn btn-dark w-100 d-flex justify-content-center align-items-center gap-2 fw-medium shadow-sm py-2"
          >
            Launch Module
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
              <path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
            </svg>
          </button>
        </div>
        
      </div>
    </div>
  );
};







    
