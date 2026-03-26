import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Form,
  FormGroup,
  Input,
  Button,
  Alert,
  InputGroup,
  InputGroupText,
} from "reactstrap";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiShield,
  FiArrowRight,
} from "react-icons/fi";

import { loginMasterUser } from "../../services/authService";
import { setMasterAuthData } from "../../utils/masterAuthStorage";
import "../../css/masterLogin.css";

interface LoginFormState {
  email: string;
  password: string;
}

export default function MasterLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState<LoginFormState>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password.trim()) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      const data = await loginMasterUser(form);
      setMasterAuthData(data);
      navigate("/master/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="master-login-page">
      <div className="login-blur login-blur-1" />
      <div className="login-blur login-blur-2" />

      <Container className="position-relative">
        <Row className="justify-content-center align-items-center min-vh-100 py-4">
          <Col lg="11" xl="10">
            <Card className="master-login-card border-0 overflow-hidden">
              <Row className="g-0">
                <Col
                  md="6"
                  className="d-none d-md-flex login-showcase text-white"
                >
                  <div className="showcase-content">
                    <div className="brand-badge">
                      <FiShield size={16} />
                      <span>Secure Access</span>
                    </div>

                    <h1 className="showcase-title">Master Portal</h1>
                    <p className="showcase-text">
                      One secure login for all your connected systems with a
                      clean, modern access experience.
                    </p>

                    <div className="showcase-points">
                      <div className="point-card">
                        <div className="point-dot" />
                        <div>
                          <h6>Centralized Access</h6>
                          <p>Manage multiple modules from one place.</p>
                        </div>
                      </div>

                      <div className="point-card">
                        <div className="point-dot" />
                        <div>
                          <h6>Secure Authentication</h6>
                          <p>JWT-based portal login with protected access.</p>
                        </div>
                      </div>

                      <div className="point-card">
                        <div className="point-dot" />
                        <div>
                          <h6>Fast Navigation</h6>
                          <p>Login once and continue to your dashboard.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>

                <Col md="6">
                  <CardBody className="login-form-section">
                    <div className="text-center text-md-start mb-4">
                      <div className="mobile-brand d-md-none mb-3">
                        <FiShield size={22} />
                      </div>
                      <h2 className="login-heading">Welcome back</h2>
                      <p className="login-subheading mb-0">
                        Sign in to continue to your portal
                      </p>
                    </div>

                    {error ? (
                      <Alert color="danger" className="login-alert">
                        {error}
                      </Alert>
                    ) : null}

                    <Form onSubmit={handleSubmit}>
                      <FormGroup className="mb-3">
                        <label htmlFor="email" className="form-label custom-label">
                          Email Address
                        </label>
                        <InputGroup className="premium-input-group">
                          <InputGroupText className="premium-icon">
                            <FiMail />
                          </InputGroupText>
                          <Input
                            id="email"
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            autoComplete="email"
                            className="premium-input"
                          />
                        </InputGroup>
                      </FormGroup>

                      <FormGroup className="mb-4">
                        <label
                          htmlFor="password"
                          className="form-label custom-label"
                        >
                          Password
                        </label>
                        <InputGroup className="premium-input-group">
                          <InputGroupText className="premium-icon">
                            <FiLock />
                          </InputGroupText>
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            className="premium-input"
                          />
                          <InputGroupText
                            className="premium-toggle"
                            onClick={() => setShowPassword((prev) => !prev)}
                          >
                            {showPassword ? <FiEyeOff /> : <FiEye />}
                          </InputGroupText>
                        </InputGroup>
                      </FormGroup>

                      <div className="d-flex justify-content-between align-items-center mb-4 small">
                        <span className="text-secondary">
                          Protected portal login
                        </span>
                        <span className="text-primary fw-semibold">
                          Secure Session
                        </span>
                      </div>

                      <Button
                        color="primary"
                        className="w-100 premium-login-btn"
                        disabled={loading}
                      >
                        <span>{loading ? "Signing in..." : "Login"}</span>
                        {!loading && <FiArrowRight size={18} />}
                      </Button>
                    </Form>
                  </CardBody>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}