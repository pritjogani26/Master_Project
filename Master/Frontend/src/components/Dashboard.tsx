import React, { useState } from 'react';
import { useAuthStore } from '@/Store/useAuthStore';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '@/API/interceptor';
import { ModuleCard } from './ModuleCard'; // Assuming you will rename ProjectCard to ModuleCard
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';


// Types updated for Modules
export interface IModule {
  id: number;
  name: string;
  url: string;
  description?: string;
  icon_url?: string;
  created_at?: string; 
  updated_at?: string;  
}

interface PaginatedModules {
  count: number;
  next: string | null;
  previous: string | null;
  results: IModule[];
}

const fetchModules = async (page: number): Promise<PaginatedModules> => {
  // Update this endpoint to match your backend module route
  const response = await api.get(`/api/modules/?p=${page}`);
  return response.data; 
};

function ModuleDashboard() {
  const [page, setPage] = useState(1);
  const user = useAuthStore((state) => state.user);
  const permissions = useAuthStore((state) => state.permissions);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // --- Modal & Form State ---
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    icon_url: '',
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const closeAndResetModal = () => {
    setShowCreateModal(false);
    setFormData({ name: '', url: '', description: '', icon_url: '' });
  };

  // --- Create Module Mutation ---
  const createModuleMutation = useMutation({
    mutationFn: async (newModule: typeof formData) => {
      const payload = {
        ...newModule,
        description: newModule.description || null,
        icon_url: newModule.icon_url || null,
      };
      return await api.post('/api/modules/', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      closeAndResetModal();
    },
    onError: (error: any) => {
      console.error("Failed to create module", error.response?.data || error.message);
    }
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createModuleMutation.mutate(formData);
  };

  // --- Fetch Modules Query ---
  const { data, isPending, isFetching, isError, error, isPlaceholderData } = useQuery({
    queryKey: ['modules', page],
    queryFn: () => fetchModules(page),
    placeholderData: keepPreviousData,
  });
  console.log(data);
  

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
        <h5 className="fw-bold mb-1">Failed to load modules</h5>
        <p className="mb-0 small">{error.message}</p>
      </div>
    </div>
  );

  return (
    <div className="container py-5">
      {/* Header Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 pb-4 border-bottom">
        <div className="mb-3 mb-md-0">
          <h2 className="fw-bold text-dark mb-1">Master Modules</h2>
          <p className="text-muted mb-0">Manage system modules, <span className="fw-medium text-dark">{user?.name || 'Admin'}</span></p>
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
              onClick={() => setShowCreateModal(true)}
            >
              + Add Module
            </button>
          )}
        </div>
      </div>

      
      <div className={`row g-4 transition-opacity ${isFetching && !isPending ? 'opacity-50' : 'opacity-100'}`} style={{ transition: 'opacity 0.2s ease-in-out' }}>
        {data?.results && data.results.length > 0 ? (
          data.results.map((moduleItem) => (
            <div key={moduleItem.id} className="col-md-6 col-lg-4">
              <ModuleCard module={moduleItem} permissions={permissions} />
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="p-5 text-center bg-light rounded-4 border border-dashed">
              <span className="fs-1 d-block mb-3 text-muted">🧩</span>
              <h5 className="fw-bold text-dark">No modules found</h5>
              <p className="text-muted small mb-0">Click "+ Add Module" to register a new system module.</p>
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
          CREATE MODULE MODAL
          ========================================== */}
      <Modal show={showCreateModal} onHide={closeAndResetModal} centered backdrop="static">
        <Modal.Header closeButton className="border-bottom-0 pb-0">
          <Modal.Title className="fw-bold fs-5 text-dark">Register New Module</Modal.Title>
        </Modal.Header>
        
        <Form onSubmit={handleCreateSubmit}>
          <Modal.Body className="pt-3">
            {/* Module Name (Required) */}
            <Form.Group className="mb-4">
              <Form.Label className="text-muted small fw-bold text-uppercase letter-spacing-1">
                Module Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="e.g. HR Portal"
                className="shadow-none border-secondary-subtle"
                required
                maxLength={100}
              />
            </Form.Group>

            {/* Entry URL (Required) */}
            <Form.Group className="mb-4">
              <Form.Label className="text-muted small fw-bold text-uppercase letter-spacing-1">
                Base URL <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="url"
                name="url"
                value={formData.url}
                onChange={handleFormChange}
                placeholder="https://hr.company.com"
                className="shadow-none border-secondary-subtle"
                required
              />
            </Form.Group>

            {/* Description (Optional) */}
            <Form.Group className="mb-4">
              <Form.Label className="text-muted small fw-bold text-uppercase letter-spacing-1">
                Description <span className="text-secondary fw-normal text-lowercase">(optional)</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Briefly describe what this module does..."
                className="shadow-none border-secondary-subtle"
              />
            </Form.Group>

            {/* Icon URL (Optional) */}
            <Form.Group className="mb-2">
              <Form.Label className="text-muted small fw-bold text-uppercase letter-spacing-1">
                Icon URL <span className="text-secondary fw-normal text-lowercase">(optional)</span>
              </Form.Label>
              <Form.Control
                type="url"
                name="icon_url"
                value={formData.icon_url}
                onChange={handleFormChange}
                placeholder="https://assets.company.com/icons/hr.png"
                className="shadow-none border-secondary-subtle text-dark"
              />
            </Form.Group>

          </Modal.Body>

          <Modal.Footer className="border-top-0 pt-0 mt-2">
            <Button 
              variant="light" 
              onClick={closeAndResetModal} 
              className="border shadow-sm text-dark fw-medium"
              disabled={createModuleMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="dark" 
              type="submit" 
              className="shadow-sm px-4"
              disabled={createModuleMutation.isPending}
            >
              {createModuleMutation.isPending ? 'Saving...' : 'Register Module'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </div>
  );
}

export default ModuleDashboard;