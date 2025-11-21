import React, { useState } from "react";
import {
    Container,
    Typography,
    Button,
    Box,
    Grid,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Alert,
    Link,
    IconButton,
} from "@mui/material";
import { Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    Api,
    Speed,
    Shield,
    Code,
    BarChart,
    CloudUpload,
    CheckCircle,
    TrendingUp,
    People,
    Timeline,
    Send,
    Settings,
    Analytics,
    Close,
} from "@mui/icons-material";

const Home = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loginOpen, setLoginOpen] = useState(false);
    const [signupOpen, setSignupOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
    });

    const [signupData, setSignupData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleLogin = () => {
        setLoginOpen(true);
        setError(null);
    };

    const handleSignup = () => {
        setSignupOpen(true);
        setError(null);
    };

    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginData((prev) => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleSignupChange = (e) => {
        const { name, value } = e.target;
        setSignupData((prev) => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!loginData.email || !loginData.password) {
            setError("Please fill in all fields");
            return;
        }

        if (!validateEmail(loginData.email)) {
            setError("Please enter a valid email address");
            return;
        }

        if (loginData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            login({
                email: loginData.email,
                name: loginData.email.split("@")[0],
            });
            setLoginOpen(false);
            setLoginData({ email: "", password: "" });
            navigate("/dashboard");
        } catch {
            setError("Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!signupData.name || !signupData.email || !signupData.password || !signupData.confirmPassword) {
            setError("Please fill in all fields");
            return;
        }

        if (signupData.name.length < 2) {
            setError("Name must be at least 2 characters");
            return;
        }

        if (!validateEmail(signupData.email)) {
            setError("Please enter a valid email address");
            return;
        }

        if (signupData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (signupData.password !== signupData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            login({
                email: signupData.email,
                name: signupData.name,
            });
            setSignupOpen(false);
            setSignupData({ name: "", email: "", password: "", confirmPassword: "" });
            navigate("/dashboard");
        } catch {
            setError("Signup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const switchToSignup = () => {
        setLoginOpen(false);
        setSignupOpen(true);
        setError(null);
    };

    const switchToLogin = () => {
        setSignupOpen(false);
        setLoginOpen(true);
        setError(null);
    };

    const features = [
        {
            icon: <Api sx={{ fontSize: 40, color: "#22c55e" }} />,
            title: "API Testing",
            description: "Test REST APIs with ease. Send requests, view responses, and debug issues in real-time.",
        },
        {
            icon: <Speed sx={{ fontSize: 40, color: "#22c55e" }} />,
            title: "Fast & Reliable",
            description: "Lightning-fast performance with reliable request handling and response tracking.",
        },
        {
            icon: <Shield sx={{ fontSize: 40, color: "#22c55e" }} />,
            title: "Secure",
            description: "Built with security in mind. Your API keys and data are safe with us.",
        },
        {
            icon: <Code sx={{ fontSize: 40, color: "#22c55e" }} />,
            title: "Developer Friendly",
            description: "Clean UI, intuitive design, and powerful features designed for developers.",
        },
        {
            icon: <BarChart sx={{ fontSize: 40, color: "#22c55e" }} />,
            title: "Monitoring",
            description: "Monitor your APIs with automated checks, uptime tracking, and performance metrics.",
        },
        {
            icon: <CloudUpload sx={{ fontSize: 40, color: "#22c55e" }} />,
            title: "Collections",
            description: "Organize your requests into collections and folders for better project management.",
        },
    ];

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 25%, #ffffff 50%, #f0fdf4 100%)",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "100%",
                    background: "radial-gradient(circle at 20% 50%, rgba(34,197,94,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(34,197,94,0.08) 0%, transparent 50%)",
                    pointerEvents: "none",
                },
            }}
        >
            {/* Navbar */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: 4,
                    py: 2,
                    background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,253,244,0.98) 100%)",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    position: "relative",
                    zIndex: 10,
                }}
            >
                {/* Brand */}
                <Typography variant="h5" sx={{ fontWeight: "bold", color: "#22c55e" }}>
                    ApexAPI
                </Typography>

                {/* Navbar Links */}
                <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
                    <Typography
                        variant="body1"
                        sx={{ cursor: "pointer", color: "#374151", "&:hover": { color: "#22c55e" } }}
                    >
                        Docs
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{ cursor: "pointer", color: "#374151", "&:hover": { color: "#22c55e" } }}
                        onClick={handleLogin}
                    >
                        Login
                    </Typography>
                    <Button
                        variant="outlined"
                        sx={{
                            borderColor: "#22c55e",
                            color: "#22c55e",
                            borderRadius: "12px",
                            textTransform: "none",
                            "&:hover": {
                                borderColor: "#16a34a",
                                color: "#16a34a",
                                backgroundColor: "rgba(34,197,94,0.05)",
                            },
                        }}
                        onClick={handleSignup}
                    >
                        Signup
                    </Button>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: "#22c55e",
                            borderRadius: "12px",
                            textTransform: "none",
                            "&:hover": { backgroundColor: "#16a34a" },
                        }}
                        onClick={handleSignup}
                    >
                        Get Started for Free
                    </Button>
                </Box>
            </Box>

            {/* Hero Section */}
            <Container maxWidth="lg" sx={{ flexGrow: 1, py: 8, position: "relative", zIndex: 1 }}>
                <Row justify="center" align="middle" style={{ width: "100%" }}>
                    <Col xs={24} md={20} lg={16}>
                        <Box
                            textAlign="center"
                            sx={{
                                py: 8,
                                position: "relative",
                                "&::before": {
                                    content: '""',
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    width: "600px",
                                    height: "600px",
                                    background: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)",
                                    borderRadius: "50%",
                                    filter: "blur(80px)",
                                    zIndex: -1,
                                },
                            }}
                        >
                            <Typography
                                variant="h2"
                                sx={{
                                    fontWeight: 700,
                                    mb: 3,
                                    lineHeight: 1.2,
                                    background: "linear-gradient(135deg, #1f2937 0%, #22c55e 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}
                            >
                                Design, Debug, Test & Mock APIs
                                <br />
                                Locally, on Git or Cloud.
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: "#6b7280",
                                    mb: 4,
                                    maxWidth: "800px",
                                    mx: "auto",
                                    fontWeight: 400,
                                }}
                            >
                                Build better APIs collaboratively for the most popular protocols
                                with a dev-friendly UI, built-in automation, and an extensible
                                plugin ecosystem.
                            </Typography>
                            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", position: "relative", zIndex: 1 }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    sx={{
                                        px: 4,
                                        py: 1.5,
                                        fontSize: "1.1rem",
                                        background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                                        borderRadius: "12px",
                                        textTransform: "none",
                                        fontWeight: 600,
                                        boxShadow: "0 4px 14px rgba(34,197,94,0.4)",
                                        "&:hover": {
                                            background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                                            boxShadow: "0 6px 20px rgba(34,197,94,0.5)",
                                            transform: "translateY(-2px)",
                                        },
                                        transition: "all 0.3s ease",
                                    }}
                                    onClick={handleSignup}
                                >
                                    Get Started for Free
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    sx={{
                                        px: 4,
                                        py: 1.5,
                                        fontSize: "1.1rem",
                                        borderColor: "#22c55e",
                                        color: "#22c55e",
                                        borderRadius: "12px",
                                        textTransform: "none",
                                        fontWeight: 600,
                                        background: "linear-gradient(135deg, rgba(34,197,94,0.05) 0%, rgba(34,197,94,0.02) 100%)",
                                        "&:hover": {
                                            borderColor: "#16a34a",
                                            color: "#16a34a",
                                            background: "linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0.05) 100%)",
                                            transform: "translateY(-2px)",
                                        },
                                        transition: "all 0.3s ease",
                                    }}
                                    onClick={handleLogin}
                                >
                                    Sign In
                                </Button>
                            </Box>
                        </Box>
                    </Col>
                </Row>

                {/* Statistics Section */}
                <Box
                    sx={{
                        mt: 12,
                        mb: 12,
                        background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
                        borderRadius: 4,
                        p: 6,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                >
                    <Grid container spacing={4}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Box textAlign="center">
                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontWeight: 700,
                                        color: "#22c55e",
                                        mb: 1,
                                    }}
                                >
                                    100+
                                </Typography>
                                <Typography variant="body1" sx={{ color: "#6b7280" }}>
                                    Active Users
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Box textAlign="center">
                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontWeight: 700,
                                        color: "#22c55e",
                                        mb: 1,
                                    }}
                                >
                                    1K+
                                </Typography>
                                <Typography variant="body1" sx={{ color: "#6b7280" }}>
                                    API Requests
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Box textAlign="center">
                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontWeight: 700,
                                        color: "#22c55e",
                                        mb: 1,
                                    }}
                                >
                                    99.9%
                                </Typography>
                                <Typography variant="body1" sx={{ color: "#6b7280" }}>
                                    Uptime
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Box textAlign="center">
                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontWeight: 700,
                                        color: "#22c55e",
                                        mb: 1,
                                    }}
                                >
                                    24/7
                                </Typography>
                                <Typography variant="body1" sx={{ color: "#6b7280" }}>
                                    Monitoring
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                {/* Features Section */}
                <Box sx={{ mt: 8, mb: 8 }}>
                    <Typography
                        variant="h3"
                        sx={{
                            textAlign: "center",
                            fontWeight: 700,
                            color: "#1f2937",
                            mb: 6,
                        }}
                    >
                        Everything You Need
                    </Typography>
                    <Grid container spacing={4}>
                        {features.map((feature, index) => (
                            <Grid size={{ xs: 12, md: 6 }} key={index}>
                                <Card
                                    sx={{
                                        height: "100%",
                                        borderRadius: 3,
                                        background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
                                        border: "1px solid rgba(34,197,94,0.1)",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                        transition: "all 0.3s ease",
                                        position: "relative",
                                        overflow: "hidden",
                                        "&::before": {
                                            content: '""',
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: "4px",
                                            background: "linear-gradient(90deg, #22c55e 0%, #4ade80 100%)",
                                        },
                                        "&:hover": {
                                            boxShadow: "0 8px 24px rgba(34,197,94,0.2)",
                                            transform: "translateY(-6px)",
                                            borderColor: "rgba(34,197,94,0.3)",
                                            background: "linear-gradient(135deg, #ffffff 0%, #dcfce7 100%)",
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 600,
                                                color: "#1f2937",
                                                mb: 1,
                                            }}
                                        >
                                            {feature.title}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{ color: "#6b7280", lineHeight: 1.6 }}
                                        >
                                            {feature.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* How It Works Section */}
                <Box sx={{ mt: 12, mb: 8 }}>
                    <Typography
                        variant="h3"
                        sx={{
                            textAlign: "center",
                            fontWeight: 700,
                            color: "#1f2937",
                            mb: 2,
                        }}
                    >
                        How It Works
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            textAlign: "center",
                            color: "#6b7280",
                            mb: 6,
                            maxWidth: "600px",
                            mx: "auto",
                        }}
                    >
                        Get started in minutes with our simple 4-step process
                    </Typography>
                    <Grid container spacing={4}>
                        {[
                            {
                                step: "1",
                                icon: <Send sx={{ fontSize: 32, color: "#22c55e" }} />,
                                title: "Create Request",
                                description: "Set up your API endpoint, method, headers, and body in our intuitive interface.",
                            },
                            {
                                step: "2",
                                icon: <Settings sx={{ fontSize: 32, color: "#22c55e" }} />,
                                title: "Configure Settings",
                                description: "Customize parameters, authentication, and test scenarios to match your needs.",
                            },
                            {
                                step: "3",
                                icon: <Timeline sx={{ fontSize: 32, color: "#22c55e" }} />,
                                title: "Send & Monitor",
                                description: "Execute requests and track responses in real-time with detailed analytics.",
                            },
                            {
                                step: "4",
                                icon: <Analytics sx={{ fontSize: 32, color: "#22c55e" }} />,
                                title: "Analyze Results",
                                description: "View performance metrics, response times, and monitor uptime automatically.",
                            },
                        ].map((item, index) => (
                            <Grid size={{ xs: 12, md: 6 }} key={index}>
                                <Card
                                    sx={{
                                        height: "100%",
                                        borderRadius: 3,
                                        background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
                                        border: "1px solid rgba(34,197,94,0.1)",
                                        p: 3,
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            transform: "translateY(-4px)",
                                            boxShadow: "0 8px 24px rgba(34,197,94,0.15)",
                                        },
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                                        <Box
                                            sx={{
                                                minWidth: 48,
                                                height: 48,
                                                borderRadius: "50%",
                                                background: "linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0.05) 100%)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: 700,
                                                    color: "#22c55e",
                                                }}
                                            >
                                                {item.step}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Box sx={{ mb: 1 }}>{item.icon}</Box>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: "#1f2937",
                                                    mb: 1,
                                                }}
                                            >
                                                {item.title}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{ color: "#6b7280", lineHeight: 1.6 }}
                                            >
                                                {item.description}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Use Cases Section */}
                <Box
                    sx={{
                        mt: 12,
                        mb: 8,
                        background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                        borderRadius: 4,
                        p: 6,
                        position: "relative",
                        overflow: "hidden",
                        "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            right: 0,
                            width: "300px",
                            height: "300px",
                            background: "radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)",
                            borderRadius: "50%",
                            filter: "blur(60px)",
                        },
                    }}
                >
                    <Typography
                        variant="h3"
                        sx={{
                            textAlign: "center",
                            fontWeight: 700,
                            color: "#1f2937",
                            mb: 2,
                            position: "relative",
                            zIndex: 1,
                        }}
                    >
                        Perfect For
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            textAlign: "center",
                            color: "#6b7280",
                            mb: 6,
                            maxWidth: "700px",
                            mx: "auto",
                            position: "relative",
                            zIndex: 1,
                        }}
                    >
                        Whether you're a solo developer or part of a large team, ApexAPI adapts to your workflow
                    </Typography>
                    <Grid container spacing={3}>
                        {[
                            "REST API Development & Testing",
                            "API Documentation & Mocking",
                            "Performance Monitoring & Analytics",
                            "Team Collaboration on APIs",
                            "Automated API Health Checks",
                            "Integration Testing & Debugging",
                        ].map((useCase, index) => (
                            <Grid size={{ xs: 12, md: 6 }} key={index}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
                                        p: 2,
                                        borderRadius: 2,
                                        background: "rgba(255,255,255,0.6)",
                                        backdropFilter: "blur(10px)",
                                        border: "1px solid rgba(34,197,94,0.1)",
                                        position: "relative",
                                        zIndex: 1,
                                    }}
                                >
                                    <CheckCircle sx={{ color: "#22c55e", fontSize: 24 }} />
                                    <Typography variant="body1" sx={{ color: "#1f2937", fontWeight: 500 }}>
                                        {useCase}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Benefits Section */}
                <Box sx={{ mt: 12, mb: 8 }}>
                    <Grid container spacing={6} alignItems="center">
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography
                                variant="h3"
                                sx={{
                                    fontWeight: 700,
                                    color: "#1f2937",
                                    mb: 3,
                                }}
                            >
                                Why Choose ApexAPI?
                            </Typography>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                {[
                                    {
                                        title: "Lightning Fast Performance",
                                        description:
                                            "Experience blazing-fast response times with our optimized infrastructure built for speed.",
                                    },
                                    {
                                        title: "Developer-First Design",
                                        description:
                                            "Built by developers, for developers. Intuitive interface that gets out of your way.",
                                    },
                                    {
                                        title: "Enterprise-Grade Security",
                                        description:
                                            "Your data is encrypted and secure. We follow industry best practices for data protection.",
                                    },
                                    {
                                        title: "Seamless Collaboration",
                                        description:
                                            "Share collections, collaborate on requests, and work together seamlessly with your team.",
                                    },
                                ].map((benefit, index) => (
                                    <Box key={index}>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 600,
                                                color: "#1f2937",
                                                mb: 1,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                            }}
                                        >
                                            <CheckCircle sx={{ color: "#22c55e", fontSize: 20 }} />
                                            {benefit.title}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: "#6b7280", ml: 4 }}>
                                            {benefit.description}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card
                                sx={{
                                    borderRadius: 4,
                                    overflow: "hidden",
                                    background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
                                    border: "1px solid rgba(34,197,94,0.1)",
                                    boxShadow: "0 8px 32px rgba(34,197,94,0.1)",
                                }}
                            >
                                <Box
                                    sx={{
                                        p: 4,
                                        background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                                        color: "#ffffff",
                                    }}
                                >
                                    <TrendingUp sx={{ fontSize: 48, mb: 2 }} />
                                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                                        Boost Your Productivity
                                    </Typography>
                                    <Typography variant="body1" sx={{ opacity: 0.95 }}>
                                        Save hours every week with automated testing, intelligent monitoring, and streamlined workflows that help you ship faster.
                                    </Typography>
                                </Box>
                                <Box sx={{ p: 4 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                                        <People sx={{ fontSize: 32, color: "#22c55e" }} />
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 600, color: "#1f2937" }}>
                                                Trusted by Teams
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: "#6b7280" }}>
                                                Built for developers, students, and teams
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                        <Speed sx={{ fontSize: 32, color: "#22c55e" }} />
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 600, color: "#1f2937" }}>
                                                Always Fast
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: "#6b7280" }}>
                                                Sub-second response times, 99.9% uptime guarantee
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>

                {/* CTA Section */}
                <Box
                    sx={{
                        background: "linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)",
                        borderRadius: 4,
                        p: 6,
                        textAlign: "center",
                        color: "#ffffff",
                        mt: 8,
                        position: "relative",
                        overflow: "hidden",
                        boxShadow: "0 8px 32px rgba(34,197,94,0.3)",
                        "&::before": {
                            content: '""',
                            position: "absolute",
                            top: "-50%",
                            left: "-50%",
                            width: "200%",
                            height: "200%",
                            background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
                            animation: "pulse 4s ease-in-out infinite",
                        },
                        "@keyframes pulse": {
                            "0%, 100%": {
                                transform: "scale(1)",
                                opacity: 0.5,
                            },
                            "50%": {
                                transform: "scale(1.1)",
                                opacity: 0.8,
                            },
                        },
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            mb: 2,
                            color: "#ffffff",
                            position: "relative",
                            zIndex: 1,
                        }}
                    >
                        Ready to Get Started?
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: "rgba(255,255,255,0.95)",
                            mb: 4,
                            maxWidth: "600px",
                            mx: "auto",
                            position: "relative",
                            zIndex: 1,
                        }}
                    >
                        Start testing and monitoring your APIs with our comprehensive platform built for developers.
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        sx={{
                            px: 4,
                            py: 1.5,
                            fontSize: "1.1rem",
                            background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
                            color: "#22c55e",
                            borderRadius: "12px",
                            textTransform: "none",
                            fontWeight: 600,
                            boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
                            position: "relative",
                            zIndex: 1,
                            "&:hover": {
                                background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                                transform: "translateY(-2px)",
                                boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                            },
                            transition: "all 0.3s ease",
                        }}
                        onClick={handleSignup}
                    >
                        Create Free Account
                    </Button>
                </Box>
            </Container>

            {/* Footer */}
            <Box
                sx={{
                    background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
                    color: "#ffffff",
                    py: 4,
                    textAlign: "center",
                    position: "relative",
                    zIndex: 1,
                }}
            >
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
                    © 2024 ApexAPI. All rights reserved.
                </Typography>
            </Box>

            {/* Login Dialog */}
            <Dialog
                open={loginOpen}
                onClose={() => {
                    setLoginOpen(false);
                    setError(null);
                    setLoginData({ email: "", password: "" });
                }}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        pb: 1,
                    }}
                >
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "#1f2937" }}>
                        Welcome Back
                    </Typography>
                    <IconButton
                        onClick={() => {
                            setLoginOpen(false);
                            setError(null);
                            setLoginData({ email: "", password: "" });
                        }}
                        sx={{ color: "#6b7280" }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Typography
                        variant="body2"
                        sx={{
                            color: "#6b7280",
                            mb: 3,
                        }}
                    >
                        Sign in to your account to continue
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleLoginSubmit}>
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={loginData.email}
                            onChange={handleLoginChange}
                            required
                            sx={{ mb: 2 }}
                            placeholder="Enter your email"
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type="password"
                            value={loginData.password}
                            onChange={handleLoginChange}
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
                                onClick={switchToSignup}
                                sx={{
                                    color: "#22c55e",
                                    fontWeight: 600,
                                    textDecoration: "none",
                                    cursor: "pointer",
                                    "&:hover": {
                                        textDecoration: "underline",
                                    },
                                }}
                            >
                                Sign up
                            </Link>
                        </Typography>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Signup Dialog */}
            <Dialog
                open={signupOpen}
                onClose={() => {
                    setSignupOpen(false);
                    setError(null);
                    setSignupData({ name: "", email: "", password: "", confirmPassword: "" });
                }}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        pb: 1,
                    }}
                >
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "#1f2937" }}>
                        Create Account
                    </Typography>
                    <IconButton
                        onClick={() => {
                            setSignupOpen(false);
                            setError(null);
                            setSignupData({ name: "", email: "", password: "", confirmPassword: "" });
                        }}
                        sx={{ color: "#6b7280" }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Typography
                        variant="body2"
                        sx={{
                            color: "#6b7280",
                            mb: 3,
                        }}
                    >
                        Sign up to get started with ApexAPI
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSignupSubmit}>
                        <TextField
                            fullWidth
                            label="Name"
                            name="name"
                            value={signupData.name}
                            onChange={handleSignupChange}
                            required
                            sx={{ mb: 2 }}
                            placeholder="Enter your full name"
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={signupData.email}
                            onChange={handleSignupChange}
                            required
                            sx={{ mb: 2 }}
                            placeholder="Enter your email"
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type="password"
                            value={signupData.password}
                            onChange={handleSignupChange}
                            required
                            sx={{ mb: 2 }}
                            placeholder="Create a password (min 6 characters)"
                        />
                        <TextField
                            fullWidth
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            value={signupData.confirmPassword}
                            onChange={handleSignupChange}
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
                                onClick={switchToLogin}
                                sx={{
                                    color: "#22c55e",
                                    fontWeight: 600,
                                    textDecoration: "none",
                                    cursor: "pointer",
                                    "&:hover": {
                                        textDecoration: "underline",
                                    },
                                }}
                            >
                                Sign in
                            </Link>
                        </Typography>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default Home;
