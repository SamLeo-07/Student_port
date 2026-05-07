import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import serverless from 'serverless-http';
import { fileURLToPath } from 'url';
import { db } from './db.js';

dotenv.config();

// Path compatibility for Netlify/ESM/CJS
const __dirname = path.resolve();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

// Global Logger (Temporary)
app.use((req, res, next) => {
    console.log(`[GLOBAL LOG] ${req.method} ${req.originalUrl}`);
    next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Log DB Connection
console.log("Database URL:", process.env.TURSO_DATABASE_URL ? "Loaded" : "Not Loaded");

// Routes
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import studentRoutes from './routes/students.js';
import adminRoutes from './routes/admin.js';
import projectRoutes from './routes/projects.js';
import batchesRouter from './routes/batches.js';
import modulesRouter from './routes/modules.js';
import videosRouter from './routes/videos.js';

import attendanceRouter from './routes/attendance.js';
import youtubeRouter from './routes/youtube.js';

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/batches', batchesRouter);
app.use('/api/modules', modulesRouter);
app.use('/api/videos', videosRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/youtube', youtubeRouter);

app.get('/', (req, res) => {
    res.json({ message: 'Student Portal API is running' });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export const handler = serverless(app);
export default app;
