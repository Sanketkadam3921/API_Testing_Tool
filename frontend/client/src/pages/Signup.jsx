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

const Signup = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
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
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            setError("Please fill in all fields");
            return;
        }

        if (formData.name.length < 2) {
            setError("Name must be at least 2 characters");
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

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (data.success && data.token && data.user) {
                login(data.user, data.token);
                navigate("/dashboard");
            } else {
                setError(data.message || "Signup failed. Please try again.");
            }
        } catch (err) {
            console.error('Signup error:', err);
            setError("Signup failed. Please try again.");
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
                            Create Account
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: "#6b7280",
                                textAlign: "center",
                                mb: 4,
                            }}
                        >
                            Sign up to get started with ApexAPI
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}

                        <Box component="form" onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                sx={{ mb: 2 }}
                                placeholder="Enter your full name"
                            />
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
                                sx={{ mb: 2 }}
                                placeholder="Create a password (min 6 characters)"
                            />
                            <TextField
                                fullWidth
                                label="Confirm Password"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                sx={{ mb: 3 }}
                                placeholder="Confirm your password"
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
                                {loading ? "Creating account..." : "Create Account"}
                    </Button>
                        </Box>

                        <Box sx={{ mt: 3, textAlign: "center" }}>
                            <Typography variant="body2" sx={{ color: "#6b7280" }}>
                                Already have an account?{" "}
                                <Link
                                    component="button"
                                    variant="body2"
                                    onClick={() => navigate("/login")}
                                    sx={{
                                        color: "#22c55e",
                                        fontWeight: 600,
                                        textDecoration: "none",
                                        "&:hover": {
                                            textDecoration: "underline",
                                        },
                                    }}
                                >
                                    Sign in
                                </Link>
                            </Typography>
                        </Box>
                    </CardContent>
        </Card>
            </Container>
        </Box>
    );
};

export default Signup;
