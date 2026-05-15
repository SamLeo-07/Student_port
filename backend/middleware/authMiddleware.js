import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-me';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log("[AuthDebug] No token provided");
        return res.status(401).json({ message: 'Access Denied: No Token Provided' });
    }

    console.log("[AuthDebug] Verifying Token...");
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error("[AuthDebug] JWT Verify Error:", err.message);
            console.log("[AuthDebug] Using Secret (first 4 chars):", JWT_SECRET.substring(0, 4));
            return res.status(403).json({ message: 'Invalid Token' });
        }
        req.user = user;
        console.log("[AuthDebug] Token Verified. User:", user.email, "Role:", user.role);
        next();
    });
};

export const authorizeRole = (role) => {
    return (req, res, next) => {
        console.log(`[AuthDebug] Checking Role: Required=${role}, UserRole=${req.user?.role}, UserID=${req.user?.id}`);
        if (req.user && (req.user.role === role || req.user.role === 'super_admin')) {
            next();
        } else {
            console.log("[AuthDebug] Access Denied");
            res.status(403).json({ message: 'Access Denied: Insufficient Permissions' });
        }
    };
};
