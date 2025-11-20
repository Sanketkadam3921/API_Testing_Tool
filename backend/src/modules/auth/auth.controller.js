import { AuthService } from "./auth.service.js";

export const AuthController = {
    register: async (req, res, next) => {
        try {
            const { name, email, password } = req.body;
            
            if (!name || !email || !password) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Name, email, and password are required" 
                });
            }

            const data = await AuthService.register(name, email, password);
            res.status(201).json({ success: true, ...data });
        } catch (err) {
            res.status(400).json({ 
                success: false, 
                message: err.message || "Registration failed" 
            });
        }
    },

    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;
            
            if (!email || !password) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Email and password are required" 
                });
            }

            const data = await AuthService.login(email, password);
            res.status(200).json({ success: true, ...data });
        } catch (err) {
            res.status(401).json({ 
                success: false, 
                message: err.message || "Login failed" 
            });
        }
    },

    profile: async (req, res, next) => {
        try {
            // Use authenticated user from middleware
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ 
                    success: false, 
                    message: "Unauthorized" 
                });
            }
            const user = await AuthService.getProfile(userId);
            res.status(200).json({ success: true, user });
        } catch (err) {
            res.status(404).json({ 
                success: false, 
                message: err.message || "User not found" 
            });
        }
    },
};
