import { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
  Alert,
  Input,
  Label,
  FormGroup,
} from "reactstrap";
import { FiShield, FiUsers, FiUserCheck } from "react-icons/fi";

interface LaunchRoleOption {
  role_code: string;
  label: string;
}

interface LaunchRoleModalProps {
  isOpen: boolean;
  toggle: () => void;
  moduleName: string;
  roleOptions: LaunchRoleOption[];
  loading: boolean;
  error: string;
  onConfirm: (selectedRole: string) => void;
}

const getRoleIcon = (roleCode: string) => {
  const code = (roleCode || "").toUpperCase();

  if (code === "ADMIN" || code === "SUPERUSER") {
    return <FiShield className="me-2" />;
  }

  if (code === "DOCTOR" || code === "RECEPTIONIST") {
    return <FiUserCheck className="me-2" />;
  }

  return <FiUsers className="me-2" />;
};

export default function LaunchRoleModal({
  isOpen,
  toggle,
  moduleName,
  roleOptions,
  loading,
  error,
  onConfirm,
}: LaunchRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<string>("");

  useEffect(() => {
    if (isOpen && roleOptions.length > 0) {
      setSelectedRole(roleOptions[0].role_code);
    } else {
      setSelectedRole("");
    }
  }, [isOpen, roleOptions]);

  const handleConfirm = (): void => {
    if (!selectedRole) return;
    onConfirm(selectedRole);
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="md">
      <ModalHeader toggle={toggle}>Choose Launch Role</ModalHeader>

      <ModalBody>
        {loading ? (
          <div className="text-center py-4">
            <Spinner color="primary" />
            <div className="mt-3">Loading role options...</div>
          </div>
        ) : error ? (
          <Alert color="danger" className="mb-0">
            {error}
          </Alert>
        ) : (
          <>
            <div className="launch-module-box mb-4">
              <h5 className="mb-1">{moduleName}</h5>
              <p className="text-muted mb-0">
                Select which role/dashboard you want to open.
              </p>
            </div>

            {roleOptions.length > 0 ? (
              roleOptions.map((role) => (
                <div
                  key={role.role_code}
                  className={`launch-role-option ${
                    selectedRole === role.role_code ? "active" : ""
                  }`}
                  onClick={() => setSelectedRole(role.role_code)}
                >
                  <FormGroup check className="m-0">
                    <Label check className="w-100 d-flex align-items-center">
                      <Input
                        type="radio"
                        name="launchRole"
                        value={role.role_code}
                        checked={selectedRole === role.role_code}
                        onChange={() => setSelectedRole(role.role_code)}
                        className="me-2"
                      />
                      <span className="d-flex align-items-center fw-semibold">
                        {getRoleIcon(role.role_code)}
                        {role.label}
                      </span>
                    </Label>
                  </FormGroup>
                </div>
              ))
            ) : (
              <Alert color="warning" className="mb-0">
                No active launch roles found for this module.
              </Alert>
            )}
          </>
        )}
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" outline onClick={toggle}>
          Cancel
        </Button>
        <Button
          color="primary"
          onClick={handleConfirm}
          disabled={loading || !!error || !selectedRole || roleOptions.length === 0}
        >
          Continue
        </Button>
      </ModalFooter>
    </Modal>
  );
}