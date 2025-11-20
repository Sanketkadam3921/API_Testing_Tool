import dotenv from "dotenv";
import jwt from "jsonwebtoken";   // <-- missing import

dotenv.config();

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Invalid token format" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // verify with same secret
        req.user = decoded; // attach user payload
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};
