import React from 'react';
import  {type Iproject } from './Dashboard';
import { useAuthStore, type UserPermissions } from '@/stores/useAuthStore';


interface Iprop{
  project:Iproject,
  permissions:UserPermissions
}
export function ProjectCard({ project,permissions}:Iprop) {
      
  
  // Destructuring the exact keys from your JSON
const { name, description, start_date, end_date } = project;

  return (
    <div className="card">
      <div className="card-content">
        <h3 className="project-title">{name}</h3>
        <p className="project-desc">{description}</p>
        
        <div className="project-dates">
          <div className="date-item">
            <span className="label">Starts:</span>
            <span className="value">{start_date}</span>
          </div>
          <div className="date-item">
            <span className="label">Ends:</span>
            <span className="value">{end_date || 'Ongoing'}</span>
          </div>
         {permissions.Dashboard?.actions.includes('Create') && (
  <button className='btn btn-dark shadow-sm px-4'>Add Task</button>
)}
{permissions.Dashboard?.actions.includes('Update') && (
  <button className='btn btn-dark shadow-sm px-4'>Edit Project</button>
)}
        </div>
      </div>


      <style >{`
        .card {
          background: white;
          border-radius: 12px;
          border: 1px solid #efefef;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .card-content {
          padding: 1.25rem;
          flex-grow: 1;
        }
        .project-title {
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
          color: #111827;
          text-transform: capitalize;
        }
        .project-desc {
          color: #4b5563;
          font-size: 0.9rem;
          margin-bottom: 1.25rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .project-dates {
          background: #f9fafb;
          border-radius: 8px;
          padding: 0.75rem;
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }
        .date-item {
          display: flex;
          flex-direction: column;
        }
        .label {
          font-size: 0.7rem;
          text-transform: uppercase;
          color: #9ca3af;
          font-weight: 700;
        }
        .value {
          font-size: 0.85rem;
          color: #374151;
          font-family: monospace;
        }
      `}
      </style>
    </div>
  );
}