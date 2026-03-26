import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "reactstrap";
import {
  FiPlus,
  FiUser,
  FiMail,
  FiShield,
  FiLogOut,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import AddModuleModal from "./AddModuleModal";
import ModuleCard from "./ModuleCard";
import LaunchRoleModal from "./LaunchRoleModal";
import {
  getModules,
  registerModule,
  updateModule,
  fetchModuleLaunchOptions,
  launchModule
} from "../../services/masterModuleService";

import type {
  MasterModule,
  MasterModuleFormData,
  MasterUser,
} from "../../types/masterModule";

import {
  clearMasterAuthData,
  getMasterUser,
  getMasterAccessToken
} from "../../utils/masterAuthStorage";

import "../../css/masterDashboard.css";

interface LaunchRoleOption {
  role_code: string;
  label: string;
}

export default function MasterDashboard() {
  const navigate = useNavigate();

  const [modules, setModules] = useState<MasterModule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editData, setEditData] = useState<MasterModule | null>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const [launchModalOpen, setLaunchModalOpen] = useState<boolean>(false);
  const [launchLoading, setLaunchLoading] = useState<boolean>(false);
  const [launchError, setLaunchError] = useState<string>("");
  const [selectedModule, setSelectedModule] = useState<MasterModule | null>(null);
  const [launchRoles, setLaunchRoles] = useState<LaunchRoleOption[]>([]);

  const user: MasterUser | null = getMasterUser();
  const childWindowsRef = useRef<Window[]>([]);

  const toggleModal = (): void => {
    setModalOpen((prev) => !prev);

    if (modalOpen) {
      setEditData(null);
    }
  };

  const toggleLaunchModal = (): void => {
    if (launchLoading) return;

    setLaunchModalOpen((prev) => !prev);

    if (launchModalOpen) {
      setSelectedModule(null);
      setLaunchRoles([]);
      setLaunchError("");
    }
  };

  const fetchModules = async (): Promise<void> => {
    try {
      setLoading(true);
      setError("");

      const res = await getModules();
      setModules(res.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load modules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleCreateOrUpdate = async (
    formData: MasterModuleFormData
  ): Promise<void> => {
    try {
      setSubmitLoading(true);
      setError("");
      setSuccess("");

      if (editData) {
        await updateModule(editData.id, formData);
        setSuccess("Module updated successfully");
      } else {
        await registerModule(formData);
        setSuccess("Module registered successfully");
      }

      setModalOpen(false);
      setEditData(null);
      await fetchModules();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (module: MasterModule): void => {
    setEditData(module);
    setModalOpen(true);
  };

  const handleToggle = async (module: MasterModule): Promise<void> => {
    try {
      setError("");
      setSuccess("");

      await updateModule(module.id, {
        module_name: module.module_name,
        module_key: module.module_key,
        base_url: module.base_url,
        backend_url: module.backend_url || "",
        icon: module.icon || "",
        description: module.description || "",
        sort_order: module.sort_order,
        is_active: !module.is_active,
      });

      setModules((prev) =>
        prev.map((m) =>
          m.id === module.id ? { ...m, is_active: !m.is_active } : m
        )
      );

      setSuccess(
        module.is_active
          ? "Module deactivated successfully"
          : "Module activated successfully"
      );
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update module status");
    }
  };

  const handleOpen = async (module: MasterModule): Promise<void> => {
    try {
      setSelectedModule(module);
      setLaunchRoles([]);
      setLaunchError("");
      setLaunchLoading(true);
      setLaunchModalOpen(true);

      const res = await fetchModuleLaunchOptions(module.id);
      setLaunchRoles(res.role_options || []);
    } catch (err: any) {
      setLaunchError(
        err?.response?.data?.message || "Failed to fetch launch options"
      );
    } finally {
      setLaunchLoading(false);
    }
  };

  const handleConfirmLaunch = async (selectedRole: string): Promise<void> => {
    if (!selectedModule) return;

    try {
      setLaunchError("");
      setLaunchLoading(true);

      const result = await launchModule(selectedModule.id, selectedRole);

      setLaunchModalOpen(false);

      const win = window.open(result.launch_url, "_blank");

      if (win) {
        childWindowsRef.current.push(win);
      }
    } catch (err: any) {
      setLaunchError(
        err?.response?.data?.message || "Failed to launch selected dashboard"
      );
    } finally {
      setLaunchLoading(false);
    }
  };


const handleLogout = async (): Promise<void> => {
  try {
    const token = getMasterAccessToken();

    if (token) {
      await axios.post(
        "http://127.0.0.1:8000/auth/logout/",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }

    childWindowsRef.current = childWindowsRef.current.filter(
      (win) => win && !win.closed
    );

    console.log("CHILD WINDOWS:", childWindowsRef.current);

    childWindowsRef.current.forEach((win) => {
      console.log("Sending MASTER_LOGOUT...");
      win.postMessage({ type: "MASTER_LOGOUT" }, "*");
    });
  } catch (error) {
    console.error("MASTER LOGOUT ERROR:", error);
  } finally {
    clearMasterAuthData();
    window.location.href = "/master/login";
  }
};

  return (
    <Container fluid className="master-dashboard-page py-4 px-4">
      <div className="dashboard-hero mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h2 className="dashboard-title">Master Portal Dashboard</h2>
          <p className="dashboard-subtitle mb-0">
            All registered external modules available in the master portal
          </p>
        </div>

        <div className="d-flex gap-2">
          <Button color="primary" className="add-module-btn" onClick={toggleModal}>
            <FiPlus className="me-2" />
            Register Module
          </Button>

          <Button color="danger" outline onClick={handleLogout}>
            <FiLogOut className="me-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="master-user-card mb-4">
        <Row>
          <Col md={4}>
            <div className="info-line">
              <FiUser className="me-2" />
              <strong>Name:</strong>&nbsp; {user?.name || "-"}
            </div>
          </Col>

          <Col md={4}>
            <div className="info-line">
              <FiMail className="me-2" />
              <strong>Email:</strong>&nbsp; {user?.email || "-"}
            </div>
          </Col>

          <Col md={4}>
            <div className="info-line">
              <FiShield className="me-2" />
              <strong>Role:</strong>&nbsp; {user?.role || "-"}
            </div>
          </Col>
        </Row>
      </div>

      {error && <Alert color="danger">{error}</Alert>}
      {success && <Alert color="success">{success}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner color="primary" />
        </div>
      ) : (
        <Row>
          {modules.length > 0 ? (
            modules.map((module) => (
              <Col md={6} lg={4} className="mb-4" key={module.id}>
                <ModuleCard
                  module={module}
                  onEdit={handleEdit}
                  onToggle={handleToggle}
                  onOpen={handleOpen}
                />
              </Col>
            ))
          ) : (
            <Col xs={12}>
              <div className="empty-state text-center py-5">
                <h5>No registered modules found</h5>
                <p className="text-muted">
                  Register a module to see it listed here.
                </p>
              </div>
            </Col>
          )}
        </Row>
      )}

      <AddModuleModal
        isOpen={modalOpen}
        toggle={toggleModal}
        onSubmit={handleCreateOrUpdate}
        loading={submitLoading}
        editData={editData}
      />

      <LaunchRoleModal
        isOpen={launchModalOpen}
        toggle={toggleLaunchModal}
        moduleName={selectedModule?.module_name || ""}
        roleOptions={launchRoles}
        loading={launchLoading}
        error={launchError}
        onConfirm={handleConfirmLaunch}
      />
    </Container>
  );
}