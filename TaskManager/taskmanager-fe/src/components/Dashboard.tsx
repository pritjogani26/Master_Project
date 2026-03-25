import React, { useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '@/API/interceptor';
import { ProjectCard } from './ProjectCard';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap'; // Added Bootstrap imports

// Types
export interface Iproject {
  id: number;
  name: string;
  description: string;
  start_date: string; 
  end_date: string;  
}

interface PaginatedProjects {
  count: number;
  next: string | null;
  previous: string | null;
  results: Iproject[];
}

const fetchProjects = async (page: number): Promise<PaginatedProjects> => {
  const response = await api.get(`auth/projects/?p=${page}`);
  return response.data; 
};

function Dashboard() {
  const [page, setPage] = useState(1);
  const user = useAuthStore((state) => state.user);
  const permissions = useAuthStore((state) => state.permissions);
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // Added QueryClient for invalidating queries

  // --- Modal & Form State ---
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const closeAndResetModal = () => {
    setShowCreateModal(false);
    setFormData({ name: '', description: '', start_date: '', end_date: '' });
  };

  // --- Create Project Mutation ---
  const createProjectMutation = useMutation({
    mutationFn: async (newProject: typeof formData) => {
      const payload = {
        ...newProject,
        end_date: newProject.end_date || null, // Handle optional date
      };
      return await api.post('/auth/projects/', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      closeAndResetModal();
    },
    onError: (error: any) => {
      console.error("Failed to create project", error.response?.data || error.message);
    }
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProjectMutation.mutate(formData);
  };

  // --- Fetch Projects Query ---
  const { data, isPending, isFetching, isError, error, isPlaceholderData } = useQuery({
    queryKey: ['projects', page],
    queryFn: () => fetchProjects(page),
    placeholderData: keepPreviousData,
  });

  if (isPending) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
      <div className="spinner-border text-dark" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  if (isError) return (
    <div className="container py-5">
      <div className="alert alert-danger bg-white border-danger shadow-sm text-danger rounded-3 p-4">
        <h5 className="fw-bold mb-1">Failed to load dashboard</h5>
        <p className="mb-0 small">{error.message}</p>
      </div>
    </div>
  );

  return (
    <div className="container py-5">
      {/* Header Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 pb-4 border-bottom">
        <div className="mb-3 mb-md-0">
          <h2 className="fw-bold text-dark mb-1">Dashboard</h2>
          <p className="text-muted mb-0">Welcome back, <span className="fw-medium text-dark">{user?.name || 'User'}</span></p>
        </div>
        
        <div className="d-flex gap-2">
          {user?.role === 'super admin' && (
            <button 
              className="btn btn-outline-dark bg-white shadow-sm px-3" 
              onClick={() => navigate("/admin")}
            >
              ⚙️ Admin Panel
            </button>
          )}
          {permissions?.Dashboard?.actions.includes("Create") && (
            <button 
              className="btn btn-dark shadow-sm px-4"
              onClick={() => setShowCreateModal(true)} // Wired up button!
            >
              + Add Project
            </button>
          )}
        </div>
      </div>

      
      <div className={`row g-4 transition-opacity ${isFetching && !isPending ? 'opacity-50' : 'opacity-100'}`} style={{ transition: 'opacity 0.2s ease-in-out' }}>
        {data?.results && data.results.length > 0 ? (
          data.results.map((project) => (
            <div key={project.id} className="col-md-6 col-lg-4">
              <ProjectCard project={project} permissions={permissions} />
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="p-5 text-center bg-light rounded-4 border border-dashed">
              <span className="fs-1 d-block mb-3 text-muted">📁</span>
              <h5 className="fw-bold text-dark">No projects found</h5>
              <p className="text-muted small mb-0">There are no projects available on this page.</p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="mt-5 pt-4 d-flex justify-content-center align-items-center gap-3">
        <button 
          className="btn btn-light border shadow-sm px-4 fw-medium text-dark"
          onClick={() => setPage(p => Math.max(p - 1, 1))}
          disabled={!data?.previous || isPlaceholderData}
        >
          Previous
        </button>

        <span className="text-muted small fw-medium px-3 py-2 bg-light rounded-3 border">
          Page {page}
        </span>

        <button 
          className="btn btn-light border shadow-sm px-4 fw-medium text-dark"
          onClick={() => setPage(p => p + 1)}
          disabled={!data?.next || isPlaceholderData}
        >
          Next
        </button>
      </div>

      {/* ==========================================
          CREATE PROJECT MODAL
          ========================================== */}
      <Modal show={showCreateModal} onHide={closeAndResetModal} centered backdrop="static">
        <Modal.Header closeButton className="border-bottom-0 pb-0">
          <Modal.Title className="fw-bold fs-5 text-dark">Create New Project</Modal.Title>
        </Modal.Header>
        
        <Form onSubmit={handleCreateSubmit}>
          <Modal.Body className="pt-3">
            {/* Project Name (Required) */}
            <Form.Group className="mb-4">
              <Form.Label className="text-muted small fw-bold text-uppercase letter-spacing-1">
                Project Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="e.g. Website Redesign"
                className="shadow-none border-secondary-subtle"
                required
                maxLength={255}
              />
            </Form.Group>

            {/* Description (Optional) */}
            <Form.Group className="mb-4">
              <Form.Label className="text-muted small fw-bold text-uppercase letter-spacing-1">
                Description <span className="text-secondary fw-normal text-lowercase">(optional)</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Add project details or objectives..."
                className="shadow-none border-secondary-subtle"
              />
            </Form.Group>

            {/* Dates Row */}
            <div className="row g-3">
              {/* Start Date (Required) */}
              <Form.Group className="col-md-6">
                <Form.Label className="text-muted small fw-bold text-uppercase letter-spacing-1">
                  Start Date <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleFormChange}
                  className="shadow-none border-secondary-subtle text-dark"
                  required
                />
              </Form.Group>

              {/* End Date (Optional) */}
              <Form.Group className="col-md-6">
                <Form.Label className="text-muted small fw-bold text-uppercase letter-spacing-1">
                  End Date <span className="text-secondary fw-normal text-lowercase">(optional)</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleFormChange}
                  className="shadow-none border-secondary-subtle text-dark"
                  min={formData.start_date}
                />
              </Form.Group>
            </div>
          </Modal.Body>

          <Modal.Footer className="border-top-0 pt-0 mt-2">
            <Button 
              variant="light" 
              onClick={closeAndResetModal} 
              className="border shadow-sm text-dark fw-medium"
              disabled={createProjectMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="dark" 
              type="submit" 
              className="shadow-sm px-4"
              disabled={createProjectMutation.isPending}
            >
              {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </div>
  );
}

export default Dashboard;