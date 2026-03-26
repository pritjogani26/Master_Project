import { Card, CardBody, CardTitle, CardText, Button, Badge } from "reactstrap";
import {
  FiGrid,
  FiBox,
  FiLayers,
  FiDatabase,
  FiActivity,
  FiMonitor,
  FiSettings,
  FiExternalLink,
  FiEdit,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import type { MasterModule } from "../../types/masterModule";

interface ModuleCardProps {
  module: MasterModule;
  onEdit: (module: MasterModule) => void;
  onToggle: (module: MasterModule) => void;
  onOpen: (module: MasterModule) => void;
}

const iconMap: Record<string, IconType> = {
  FiGrid,
  FiBox,
  FiLayers,
  FiDatabase,
  FiActivity,
  FiMonitor,
  FiSettings,
};

export default function ModuleCard({
  module,
  onEdit,
  onToggle,
  onOpen,
}: ModuleCardProps) {
  const IconComponent = module.icon ? iconMap[module.icon] || FiGrid : FiGrid;

  return (
    <Card className="module-card h-100 shadow-sm border-0">
      <CardBody className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="module-icon-wrap">
            <IconComponent size={28} />
          </div>

          <Badge color={module.is_active ? "success" : "secondary"} pill>
            {module.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>

        <CardTitle tag="h5" className="fw-bold mb-2">
          {module.module_name}
        </CardTitle>

        <div className="mb-2 text-muted small">
          <strong>Key:</strong> {module.module_key}
        </div>

        <CardText className="text-muted flex-grow-1">
          {module.description || "No description available"}
        </CardText>

        <div className="small text-muted mb-3">
          <div>
            <strong>Base URL:</strong> {module.base_url || "-"}
          </div>

          {module.backend_url && (
            <div>
              <strong>Backend URL:</strong> {module.backend_url}
            </div>
          )}
        </div>

        <div className="d-flex gap-2 flex-wrap mt-auto">
          <Button
            color="primary"
            outline
            onClick={() => onOpen(module)}
            disabled={!module.is_active}
          >
            <FiExternalLink className="me-2" />
            Open
          </Button>

          <Button color="warning" outline onClick={() => onEdit(module)}>
            <FiEdit className="me-2" />
            Edit
          </Button>

          <Button
            color={module.is_active ? "danger" : "success"}
            outline
            onClick={() => onToggle(module)}
          >
            {module.is_active ? "Deactivate" : "Activate"}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}