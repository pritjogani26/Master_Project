import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/API/interceptor';
import { Modal, Button, Form, ListGroup, Badge, InputGroup, Tabs, Tab } from 'react-bootstrap';

export const RoleRightsManager = () => {
    const queryClient = useQueryClient();
    
    // --- State ---
    const [activeTab, setActiveTab] = useState('screen-config');
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
    const [activeScreen, setActiveScreen] = useState<any | null>(null);
    
    // Modal Visibility
    const [showCapabilitiesModal, setShowCapabilitiesModal] = useState(false);
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);
    const [showAddScreenModal, setShowAddScreenModal] = useState(false);
    const [showAddActionModal, setShowAddActionModal] = useState(false);

    // Form Inputs
    const [newScreen, setNewScreen] = useState({ name: '', route: '' });
    const [newActionName, setNewActionName] = useState('');

    // --- Queries ---
    const { data: roles } = useQuery({
        queryKey: ['roles'],
        queryFn: async () => (await api.get('/auth/roles/')).data
    });

    const { data: allActions } = useQuery({
        queryKey: ['allActions'],
        queryFn: async () => (await api.get('/auth/actions/')).data
    });

    const { data: screens } = useQuery({
        queryKey: ['Screen'],
        queryFn: async () => (await api(`/auth/screens/`)).data
    });

    const { data: currentPermissions } = useQuery({
        queryKey: ['rolePermissions', selectedRoleId],
        queryFn: async () => (await api(`/auth/roles/${selectedRoleId}/permissions/`)).data,
        enabled: !!selectedRoleId,
    });

    // --- Mutations ---
    const addScreenMutation = useMutation({
        mutationFn: async (payload: typeof newScreen) => await api.post('/auth/screens/create/', payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['Screen'] });
            setShowAddScreenModal(false);
            setNewScreen({ name: '', route: '' });
        }
    });

    const addActionMutation = useMutation({
        mutationFn: async (name: string) => await api.post('/auth/actions/create/', { name }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allActions'] });
            setShowAddActionModal(false);
            setNewActionName('');
        }
    });

    const toggleScreenActionMapping = useMutation({
        mutationFn: async ({ actionId, isLinked }: { actionId: number, isLinked: boolean }) => {
            return await api.post(`/auth/screens/${activeScreen.id}/manage-actions/`, {
                action_id: actionId,
                link: !isLinked
            });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['Screen'] })
    });

    const toggleRolePermission = useMutation({
        mutationFn: async ({ actionName, grantAccess }: any) => {
            return await api.post('auth/roles/permissions/manage/', {
                payload: { 
                    role_id: selectedRoleId, 
                    screen_name: activeScreen.name, 
                    action_name: actionName, 
                    grant_access: grantAccess 
                }
            });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rolePermissions', selectedRoleId] })
    }); 

    // --- Render ---
    return (
        <div className="container py-5 max-w-5xl">
            {/* Header */}
            <div className="mb-4">
                <h2 className="fw-bold text-dark mb-1">System Capabilities</h2>
                <p className="text-muted">Manage screens, actions, and role-based access control.</p>
            </div>

            {/* --- TABS --- */}
            <Tabs
                id="admin-management-tabs"
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k || 'screen-config')}
                className="mb-0 border-bottom"
            >
                {/* =========================================================
                    TAB 1: SCREEN CONFIGURATION
                    ========================================================= */}
                <Tab eventKey="screen-config" title="Screen Configuration">
                    <div className="p-4 bg-white border border-top-0 rounded-bottom-3 shadow-sm">
                        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                            <div>
                                <h5 className="mb-1 fw-bold text-dark">Configured Screens</h5>
                                <p className="text-muted small mb-0">Define which physical actions exist on each screen.</p>
                            </div>
                            <div className="d-flex gap-2">
                                <Button variant="dark" className="shadow-sm" onClick={() => setShowAddScreenModal(true)}>+ Add Screen</Button>
                                <Button variant="outline-dark" className="shadow-sm bg-white" onClick={() => setShowAddActionModal(true)}>+ Add Action</Button>
                            </div>
                        </div>

                        <ListGroup variant="flush">
                            {Array.isArray(screens) && screens.map((screen: any) => (
                                <ListGroup.Item key={screen.id} className="d-flex justify-content-between align-items-center py-3 px-2 border-bottom">
                                    <div>
                                        <span className="fw-bold text-dark fs-6">{screen.name}</span> 
                                        <span className="text-muted small ms-2 px-2 py-1 bg-light rounded-2 border">{screen.route}</span>
                                        <div className="d-flex gap-2 mt-2 flex-wrap">
                                            {screen.actions?.length > 0 ? screen.actions.map((a: any) => (
                                                <Badge key={a.id} bg="light" text="dark" className="border fw-normal text-secondary px-2 py-1">
                                                    {a.name}
                                                </Badge>
                                            )) : <span className="text-muted small fst-italic">No actions configured</span>}
                                        </div>
                                    </div>
                                    <Button 
                                        variant="light" 
                                        className="border shadow-sm text-dark fw-medium"
                                        size="sm" 
                                        onClick={() => { setActiveScreen(screen); setShowCapabilitiesModal(true); }}
                                    >
                                        ⚙️ Setup
                                    </Button>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </div>
                </Tab>

                {/* =========================================================
                    TAB 2: ROLE PERMISSIONS
                    ========================================================= */}
                <Tab eventKey="role-permissions" title="Role Permissions">
                    <div className="p-4 bg-white border border-top-0 rounded-bottom-3 shadow-sm">
                        <div className="mb-4 pb-3 border-bottom">
                            <h5 className="mb-1 fw-bold text-dark">Grant Permissions</h5>
                            <p className="text-muted small">Select a role below to grant or revoke access to configured screen actions.</p>
                            
                            <div className="p-3 mt-3 bg-light border rounded-3 col-md-6 col-lg-5 shadow-sm">
                                <Form.Label className="fw-bold text-dark small text-uppercase letter-spacing-1">Target Role</Form.Label>
                                <Form.Select 
                                    className="shadow-none border-secondary-subtle"
                                    onChange={(e) => setSelectedRoleId(Number(e.target.value))} 
                                    defaultValue=""
                                >
                                    <option value="" disabled>-- Select a role --</option>
                                    {roles?.map((role: any) => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </Form.Select>
                            </div>
                        </div>

                        {selectedRoleId ? (
                            <ListGroup variant="flush">
                                {Array.isArray(screens) && screens.map((screen: any) => (
                                    <ListGroup.Item key={screen.id} className="d-flex justify-content-between align-items-center py-3 px-2 border-bottom">
                                        <div>
                                            <span className="fw-bold text-dark">{screen.name}</span>
                                            <div className="text-muted small mt-1">
                                                {screen.actions?.length || 0} configured action(s)
                                            </div>
                                        </div>
                                        <Button 
                                            variant="dark" 
                                            className="shadow-sm px-3"
                                            size="sm" 
                                            onClick={() => { setActiveScreen(screen); setShowPermissionsModal(true); }}
                                            disabled={!screen.actions || screen.actions.length === 0}
                                        >
                                            Manage
                                        </Button>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        ) : (
                            <div className="p-5 text-center text-muted bg-light rounded-3 border border-dashed mt-4">
                                <span className="fs-4 d-block mb-2">👆</span>
                                Select a role from the dropdown above to manage its permissions.
                            </div>
                        )}
                    </div>
                </Tab>
            </Tabs>


            {/* =========================================================
                MODALS
                ========================================================= */}
            
            {/* Modal 1: Screen Capabilities */}
            <Modal show={showCapabilitiesModal} onHide={() => setShowCapabilitiesModal(false)} centered>
                <Modal.Header closeButton className="border-bottom-0 pb-0">
                    <Modal.Title className="fw-bold fs-5">Setup Actions: {activeScreen?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="text-muted small mb-4">
                        Select which global actions physically exist on the <strong>{activeScreen?.name}</strong> screen.
                    </p>
                    <div className="bg-light p-3 rounded-3 border">
                        {Array.isArray(allActions) && allActions.map((action: any) => {
                            const isLinked = activeScreen?.actions?.some((a: any) => a.id === action.id);
                            return (
                                <Form.Check 
                                    key={action.id}
                                    type="checkbox"
                                    label={action.name}
                                    checked={isLinked || false}
                                    className="mb-2 text-dark fw-medium"
                                    onChange={() => toggleScreenActionMapping.mutate({ actionId: action.id, isLinked })}
                                    disabled={toggleScreenActionMapping.isPending}
                                />
                            );
                        })}
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-top-0 pt-0">
                    <Button variant="dark" className="w-100" onClick={() => setShowCapabilitiesModal(false)}>Done</Button>
                </Modal.Footer>
            </Modal>

            {/* Modal 2: Role Permissions */}
            <Modal show={showPermissionsModal} onHide={() => setShowPermissionsModal(false)} centered>
                <Modal.Header closeButton className="border-bottom-0 pb-0">
                    <Modal.Title className="fw-bold fs-5">Permissions: {activeScreen?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="text-muted small mb-4">
                        Enable access to the following actions for the selected role.
                    </p>
                    {activeScreen?.actions?.length > 0 ? (
                        activeScreen.actions.map((action: any) => (
                            <div key={action.id} className="d-flex justify-content-between align-items-center mb-2 p-3 border rounded-3 bg-light shadow-sm">
                                <span className="fw-medium text-dark">{action.name}</span>
                                <Form.Check 
                                    type="switch"
                                    id={`switch-${action.id}`}
                                    className="fs-5 m-0"
                                    checked={currentPermissions?.[activeScreen.name]?.includes(action.name) || false}
                                    onChange={() => toggleRolePermission.mutate({ 
                                        actionName: action.name, 
                                        grantAccess: !currentPermissions?.[activeScreen.name]?.includes(action.name) 
                                    })}
                                    disabled={toggleRolePermission.isPending}
                                />
                            </div>
                        ))
                    ) : (
                        <div className="alert alert-light border text-center text-muted">
                            No capabilities enabled for this screen yet.
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-top-0 pt-0">
                    <Button variant="dark" className="w-100" onClick={() => setShowPermissionsModal(false)}>Done</Button>
                </Modal.Footer>
            </Modal>

            {/* Modal 3: Add Screen */}
            <Modal show={showAddScreenModal} onHide={() => setShowAddScreenModal(false)} centered>
                <Modal.Header closeButton className="border-bottom-0 pb-0">
                    <Modal.Title className="fw-bold fs-5">Add New Screen</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label className="text-muted small fw-bold text-uppercase">Screen Name</Form.Label>
                        <Form.Control className="shadow-none" type="text" placeholder="e.g. Inventory" value={newScreen.name} onChange={e => setNewScreen({...newScreen, name: e.target.value})} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="text-muted small fw-bold text-uppercase">Route Path</Form.Label>
                        <InputGroup>
                            <InputGroup.Text className="bg-light text-muted border-end-0">/</InputGroup.Text>
                            <Form.Control className="shadow-none border-start-0 ps-0" type="text" placeholder="inventory" value={newScreen.route} onChange={e => setNewScreen({...newScreen, route: e.target.value})} />
                        </InputGroup>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="border-top-0 pt-0">
                    <Button variant="dark" className="w-100" onClick={() => addScreenMutation.mutate(newScreen)}>Save Screen</Button>
                </Modal.Footer>
            </Modal>

            {/* Modal 4: Add Action */}
            <Modal show={showAddActionModal} onHide={() => setShowAddActionModal(false)} centered>
                <Modal.Header closeButton className="border-bottom-0 pb-0">
                    <Modal.Title className="fw-bold fs-5">Add Global Action</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label className="text-muted small fw-bold text-uppercase">Action Name</Form.Label>
                        <Form.Control className="shadow-none" type="text" placeholder="e.g. Export, Print, Approve" value={newActionName} onChange={e => setNewActionName(e.target.value)} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="border-top-0 pt-0">
                    <Button variant="dark" className="w-100" onClick={() => addActionMutation.mutate(newActionName)}>Create Action</Button>
                </Modal.Footer>
            </Modal>

        </div>
    );
};