import React, { useEffect, useState } from "react";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Form,
    FormGroup,
    Label,
    Input,
    Row,
    Col,
    Spinner,
} from "reactstrap";
import type { MasterModule, MasterModuleFormData } from "../../types/masterModule";

interface AddModuleModalProps {
    isOpen: boolean;
    toggle: () => void;
    onSubmit: (formData: MasterModuleFormData) => Promise<void>;
    loading?: boolean;
    editData?: MasterModule | null;
}

const initialForm: MasterModuleFormData = {
    module_name: "",
    module_key: "",
    base_url: "",
    backend_url: "",
    icon: "FiGrid",
    description: "",
    sort_order: 0,
};

export default function AddModuleModal({
    isOpen,
    toggle,
    onSubmit,
    loading = false,
    editData = null,
}: AddModuleModalProps) {
    const [form, setForm] = useState<MasterModuleFormData>(initialForm);

    useEffect(() => {
        if (editData) {
            setForm({
                module_name: editData.module_name || "",
                module_key: editData.module_key || "",
                base_url: editData.base_url || "",
                backend_url: editData.backend_url || "",
                icon: editData.icon || "FiGrid",
                description: editData.description || "",
                sort_order: editData.sort_order ?? 0,
                is_active: editData.is_active ?? true,
            });
        } else {
            setForm(initialForm);
        }
    }, [editData, isOpen]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ): void => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: name === "sort_order" ? Number(value) : value,
        }));
    };

    const handleSubmit = async (
        e: React.SyntheticEvent<HTMLFormElement>
    ): Promise<void> => {
        e.preventDefault();
        await onSubmit(form);
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} centered size="lg">
            <ModalHeader toggle={toggle}>
                {editData ? "Edit Module" : "Register Module"}
            </ModalHeader>

            <Form onSubmit={handleSubmit}>
                <ModalBody>
                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="module_name">Module Name</Label>
                                <Input
                                    id="module_name"
                                    type="text"
                                    name="module_name"
                                    value={form.module_name}
                                    onChange={handleChange}
                                    placeholder="Task Management System"
                                    required
                                />
                            </FormGroup>
                        </Col>

                        <Col md={6}>
                            <FormGroup>
                                <Label for="module_key">Module Key</Label>
                                <Input
                                    id="module_key"
                                    type="text"
                                    name="module_key"
                                    value={form.module_key}
                                    onChange={handleChange}
                                    placeholder="TMS"
                                    required
                                />
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="base_url">Base URL</Label>
                                <Input
                                    id="base_url"
                                    type="url"
                                    name="base_url"
                                    value={form.base_url}
                                    onChange={handleChange}
                                    placeholder="http://localhost:3001"
                                    required
                                />
                            </FormGroup>
                        </Col>

                        <Col md={6}>
                            <FormGroup>
                                <Label for="backend_url">Backend URL</Label>
                                <Input
                                    id="backend_url"
                                    type="url"
                                    name="backend_url"
                                    value={form.backend_url}
                                    onChange={handleChange}
                                    placeholder="http://127.0.0.1:8001"
                                />
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="icon">Icon</Label>
                                <Input
                                    id="icon"
                                    type="text"
                                    name="icon"
                                    value={form.icon}
                                    onChange={handleChange}
                                    placeholder="FiGrid"
                                />
                            </FormGroup>
                        </Col>

                        <Col md={6}>
                            <FormGroup>
                                <Label for="sort_order">Sort Order</Label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    name="sort_order"
                                    value={form.sort_order}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </FormGroup>
                        </Col>
                    </Row>

                    <FormGroup>
                        <Label for="description">Description</Label>
                        <Input
                            id="description"
                            type="textarea"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Manage tasks and projects"
                            rows={4}
                        />
                    </FormGroup>
                </ModalBody>

                <ModalFooter>
                    <Button color="secondary" onClick={toggle} disabled={loading}>
                        Cancel
                    </Button>
                    <Button color="primary" type="submit" disabled={loading}>
                        {loading ? (
                            <Spinner size="sm" />
                        ) : editData ? (
                            "Update Module"
                        ) : (
                            "Register Module"
                        )}
                    </Button>
                </ModalFooter>
            </Form>
        </Modal>
    );
}