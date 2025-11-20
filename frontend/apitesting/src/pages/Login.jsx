import React, { useState } from "react";
import {
    Box,
    Container,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Alert,
    Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.email || !formData.password) {
            setError("Please fill in all fields");
            return;
        }

        if (!validateEmail(formData.email)) {
            setError("Please enter a valid email address");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (data.success && data.token && data.user) {
                login(data.user, data.token);
                navigate("/dashboard");
            } else {
                setError(data.message || "Login failed. Please check your credentials.");
            }
        } catch (err) {
            console.error('Login error:', err);
            setError("Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background: "linear-gradient(to bottom, #f5f5f5, #ffffff)",
                display: "flex",
                alignItems: "center",
                py: 4,
            }}
        >
            <Container maxWidth="sm">
                <Card
                    sx={{
                        borderRadius: 3,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                >
                    <CardContent sx={{ p: 4 }}>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                color: "#1f2937",
                                textAlign: "center",
                                mb: 1,
                            }}
                        >
                            Welcome Back
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: "#6b7280",
                                textAlign: "center",
                                mb: 4,
                            }}
                        >
                            Sign in to your account to continue
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}

                        <Box component="form" onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                sx={{ mb: 2 }}
                                placeholder="Enter your email"
                            />
                            <TextField
                                fullWidth
                                label="Password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                sx={{ mb: 3 }}
                                placeholder="Enter your password"
                            />
                    <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={loading}
                                sx={{
                                    py: 1.5,
                                    backgroundColor: "#22c55e",
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontWeight: 600,
                                    fontSize: "1rem",
                                    "&:hover": {
                                        backgroundColor: "#16a34a",
                                    },
                                }}
                    >
                                {loading ? "Signing in..." : "Sign In"}
                    </Button>
                        </Box>

                        <Box sx={{ mt: 3, textAlign: "center" }}>
                            <Typography variant="body2" sx={{ color: "#6b7280" }}>
                                Don't have an account?{" "}
                                <Link
                                    component="button"
                                    variant="body2"
                                    onClick={() => navigate("/signup")}
                                    sx={{
                                        color: "#22c55e",
                                        fontWeight: 600,
                                        textDecoration: "none",
                                        "&:hover": {
                                            textDecoration: "underline",
                                        },
                                    }}
                                >
                                    Sign up
                                </Link>
                            </Typography>
                        </Box>
                    </CardContent>
        </Card>
            </Container>
        </Box>
    );
};

export default Login;
