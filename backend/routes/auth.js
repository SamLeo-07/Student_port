import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// --- Functional Helpers ---

const findUserByEmail = async (email) => {
    const result = await db.execute({
        sql: "SELECT * FROM users WHERE email = ?",
        args: [email]
    });
    return result.rows.length > 0 ? result.rows[0] : null;
};

const validateUserCredentials = async (email, password) => {
    const user = await findUserByEmail(email);
    if (!user) return { valid: false };

    const isMatch = await bcrypt.compare(password, user.password);
    return isMatch ? { valid: true, user } : { valid: false };
};

const createToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

const registerUser = async (name, email, password, role) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = (role === 'super_admin' || role === 'admin') ? role : 'student';

    await db.execute({
        sql: "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        args: [name, email, hashedPassword, userRole]
    });
};

// --- Routes ---

// Register
router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        await registerUser(name, email, password, role);
        res.status(201).json({ message: 'User registered successfully' });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const { valid, user } = await validateUserCredentials(email, password);

        if (!valid) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = createToken(user);

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
