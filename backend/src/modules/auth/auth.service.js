import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
import pool from "../../config/db.js";
import { AuthQueries } from "./auth.queries.js";

export const AuthService = {
    register: async (name, email, password) => {
        // Check if user already exists
        const existingUser = await pool.query(AuthQueries.findUserByEmail, [email]);
        if (existingUser.rows.length > 0) {
            throw new Error("User with this email already exists");
        }

        // Validate password length
        if (!password || password.length < 6) {
            throw new Error("Password must be at least 6 characters long");
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error("Invalid email format");
        }

        // Validate name
        if (!name || name.trim().length < 2) {
            throw new Error("Name must be at least 2 characters long");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(AuthQueries.createUser, [
            name.trim(),
            email.trim().toLowerCase(),
            hashedPassword,
        ]);

        if (!result.rows[0]) {
            throw new Error("Failed to create user");
        }

        // Generate JWT token for new user
        const user = result.rows[0];
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'default-secret-change-in-production',
            { expiresIn: "7d" }
        );

        return { 
            token, 
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email,
                createdAt: user.created_at
            } 
        };
    },

    login: async (email, password) => {
        if (!email || !password) {
            throw new Error("Email and password are required");
        }

        const result = await pool.query(AuthQueries.findUserByEmail, [email.trim().toLowerCase()]);
        const user = result.rows[0];

        if (!user) {
            throw new Error("Invalid email or password");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Invalid email or password");
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'default-secret-change-in-production',
            { expiresIn: "7d" }
        );

        return { 
            token, 
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email,
                createdAt: user.created_at
            } 
        };
    },

    getProfile: async (id) => {
        const result = await pool.query(AuthQueries.findUserById, [id]);
        if (!result.rows[0]) {
            throw new Error("User not found");
        }
        return result.rows[0];
    },
};
