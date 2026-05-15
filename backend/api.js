import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import serverless from 'serverless-http';
import { fileURLToPath } from 'url';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config(); // fallback

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

const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/courses', courseRoutes);
apiRouter.use('/students', studentRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/projects', projectRoutes);
apiRouter.use('/batches', batchesRouter);
apiRouter.use('/modules', modulesRouter);
apiRouter.use('/videos', videosRouter);
apiRouter.use('/attendance', attendanceRouter);
apiRouter.use('/youtube', youtubeRouter);

// Mount on multiple possible path prefixes for Netlify compatibility
app.use('/api', apiRouter);
app.use('/.netlify/functions/api', apiRouter);

// Health check route
app.get('/api/health', async (req, res) => {
    try {
        await db.execute("SELECT 1");
        res.json({ status: 'ok', database: 'connected' });
    } catch (e) {
        res.status(500).json({ status: 'error', database: e.message });
    }
});

app.get('/', (req, res) => {
    res.json({ message: 'Student Portal API is running' });
});

if (process.env.NETLIFY !== 'true') {
    app.listen(PORT, () => {
        console.log(`\x1b[32m➜\x1b[0m  \x1b[1mBackend\x1b[0m:   \x1b[36mhttp://localhost:${PORT}/\x1b[0m`);
    });
}

export const handler = serverless(app);
export default app;
