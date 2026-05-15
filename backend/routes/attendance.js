import express from 'express';
import { db } from '../db.js';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware.js';
import { getAuthenticatedSheets } from './youtube.js';

const router = express.Router();

// --- Student Routes ---

// Get Attendance for the logged-in student
router.get('/my-attendance', authenticateToken, async (req, res) => {
    try {
        const studentId = req.user.id;

        // 1. Get user's batch_id and courses they are enrolled in
        const userRes = await db.execute({
            sql: "SELECT batch_id FROM users WHERE id = ?",
            args: [studentId]
        });
        const batchId = userRes.rows[0]?.batch_id;

        // 2. Fetch all classes the student should see (based on enrollments or batch)
        let sql = `
            SELECT c.*, m.title as module_name, a.status 
            FROM classes c
            LEFT JOIN modules m ON c.module_id = m.id
            LEFT JOIN attendance a ON c.id = a.class_id AND a.student_id = ?
            WHERE c.course_id IN (
                SELECT course_id FROM enrollments WHERE student_id = ?
                UNION
                SELECT course_id FROM batch_courses WHERE batch_id = ?
            )
            ORDER BY c.schedule DESC
        `;
        const args = [studentId, studentId, batchId];

        const result = await db.execute({ sql, args });
        
        // Map null status to 'Pending'
        const records = result.rows.map(row => ({
            ...row,
            status: row.status || 'Pending'
        }));

        res.json(records);
    } catch (error) {
        console.error("Error fetching my attendance:", error);
        res.status(500).json({ message: error.message });
    }
});

// --- Admin Routes ---

// Get all students and their attendance for a specific class
router.get('/class/:classId', authenticateToken, authorizeRole('admin'), async (req, res) => {
    try {
        const classId = req.params.classId;

        // 1. Get the class details to know the course_id
        const classRes = await db.execute({
            sql: "SELECT course_id FROM classes WHERE id = ?",
            args: [classId]
        });
        if (classRes.rows.length === 0) return res.status(404).json({ message: "Class not found" });
        const courseId = classRes.rows[0].course_id;

        // 2. Get all students enrolled in this course (direct or via batch)
        const studentsRes = await db.execute({
            sql: `
                SELECT DISTINCT u.id, u.name, u.email, u.batch_id, b.batch_name, a.status
                FROM users u
                LEFT JOIN batches b ON u.batch_id = b.id
                LEFT JOIN attendance a ON a.student_id = u.id AND a.class_id = ?
                WHERE u.role = 'student' AND (u.course_id = ? OR u.id IN (SELECT student_id FROM enrollments WHERE course_id = ?))
                ORDER BY u.name ASC
            `,
            args: [classId, courseId, courseId]
        });

        const records = studentsRes.rows.map(row => ({
            ...row,
            status: row.status || 'Pending'
        }));

        res.json(records);
    } catch (error) {
        console.error("Error fetching class attendance:", error);
        res.status(500).json({ message: error.message });
    }
});

// Mark/Update Attendance
router.post('/mark', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const { class_id, student_id, status } = req.body;

    if (!['Present', 'Absent', 'Late', 'Pending'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }

    try {
        const classInt = parseInt(class_id);
        const studentInt = parseInt(student_id);

        await db.execute({
            sql: `INSERT INTO attendance (class_id, student_id, status) 
                  VALUES (?, ?, ?) 
                  ON CONFLICT(class_id, student_id) 
                  DO UPDATE SET status = EXCLUDED.status, updated_at = CURRENT_TIMESTAMP`,
            args: [classInt, studentInt, status]
        });
        res.json({ message: "Attendance marked successfully" });
    } catch (error) {
        console.error("Error marking attendance:", error);
        res.status(500).json({ message: error.message });
    }
});

// Bulk Mark Attendance
router.post('/mark-bulk', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const { class_id, updates } = req.body; // updates: [{student_id, status}]

    if (!Array.isArray(updates)) return res.status(400).json({ message: "Updates must be an array" });

    try {
        for (const update of updates) {
            if (!['Present', 'Absent', 'Late', 'Pending'].includes(update.status)) continue;

            await db.execute({
                sql: `INSERT INTO attendance (class_id, student_id, status) 
                      VALUES (?, ?, ?) 
                      ON CONFLICT(class_id, student_id) 
                      DO UPDATE SET status = EXCLUDED.status, updated_at = CURRENT_TIMESTAMP`,
                args: [class_id, update.student_id, update.status]
            });
        }
        res.json({ message: `Marked attendance for ${updates.length} students` });
    } catch (error) {
        console.error("Error bulk marking attendance:", error);
        res.status(500).json({ message: error.message });
    }
});

// Get Summary for Admin (Segregated by courses and batches)
router.get('/summary', authenticateToken, authorizeRole('admin'), async (req, res) => {
    try {
        const { batch_id, course_id, student_id, date, class_id } = req.query;

        let sql = `
            SELECT DISTINCT
                u.id as student_id, u.name as student_name, 
                b.batch_name, c.title as course_title, c.id as course_id,
                cls.id as class_id, cls.title as class_title, cls.topic, cls.instructor_name, cls.schedule,
                a.status, a.updated_at, a.id as attendance_record_id
            FROM users u
            LEFT JOIN batches b ON u.batch_id = b.id
            JOIN courses c ON u.course_id = c.id
            JOIN classes cls ON c.id = cls.course_id
            LEFT JOIN attendance a ON a.student_id = u.id AND a.class_id = cls.id
            WHERE u.role = 'student'
        `;
        const args = [];

        if (batch_id) {
            sql += " AND b.id = ?";
            args.push(batch_id);
        }
        if (course_id) {
            sql += " AND c.id = ?";
            args.push(course_id);
        }
        if (student_id) {
            sql += " AND u.id = ?";
            args.push(student_id);
        }
        if (class_id) {
            sql += " AND cls.id = ?";
            args.push(class_id);
        }
        if (date) {
            sql += " AND DATE(cls.schedule) = DATE(?)";
            args.push(date);
        }

        sql += " ORDER BY cls.schedule DESC, u.name ASC";

        const result = await db.execute({ sql, args });
        
        const records = result.rows.map(row => ({
            ...row,
            status: row.status || 'Pending'
        }));

        res.json(records);
    } catch (error) {
        console.error("Error fetching attendance summary:", error);
        res.status(500).json({ message: error.message });
    }
});

// Delete Attendance Record
router.delete('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
    try {
        await db.execute({
            sql: "DELETE FROM attendance WHERE id = ?",
            args: [req.params.id]
        });
        res.json({ message: "Attendance record deleted successfully" });
    } catch (error) {
        console.error("Error deleting attendance:", error);
        res.status(500).json({ message: error.message });
    }
});

// Find or Create Class Session for Attendance
router.post('/get-session', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const { course_id, module_id, date } = req.body;

    if (!course_id || !date) {
        return res.status(400).json({ message: "Course and Date are required" });
    }

    try {
        // 1. Check if a class already exists for this course and date (and module if provided)
        let sql = `SELECT id FROM classes WHERE course_id = ? AND DATE(schedule) = DATE(?)`;
        let args = [course_id, date];
        
        if (module_id) {
            sql += " AND module_id = ?";
            args.push(module_id);
        }
        
        sql += " LIMIT 1";

        const existingRes = await db.execute({ sql, args });

        if (existingRes.rows.length > 0) {
            return res.json({ class_id: existingRes.rows[0].id });
        }

        // 2. If not, create a new one
        let title = "Daily Attendance";
        if (module_id) {
            const modRes = await db.execute({
                sql: "SELECT title FROM modules WHERE id = ?",
                args: [module_id]
            });
            if (modRes.rows[0]) title = modRes.rows[0].title;
        } else {
            // Get course title
            const courseRes = await db.execute({
                sql: "SELECT title FROM courses WHERE id = ?",
                args: [course_id]
            });
            if (courseRes.rows[0]) title = `${courseRes.rows[0].title} Attendance`;
        }
        
        const newClassTitle = `${title} - ${date}`;

        const insertRes = await db.execute({
            sql: `INSERT INTO classes (course_id, module_id, title, schedule, instructor_name) 
                  VALUES (?, ?, ?, ?, ?)`,
            args: [course_id, module_id || null, newClassTitle, date, req.user.name || 'Admin']
        });

        res.status(201).json({ class_id: Number(insertRes.lastInsertRowid) });
    } catch (error) {
        console.error("Error in get-session:", error);
        res.status(500).json({ message: error.message });
    }
});

// --- Google Sheets Sync ---

// helper to extract spreadsheet ID from URL
function extractSpreadsheetId(url) {
    if (!url) return null;
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : url;
}

// Sync Attendance from Google Sheets
router.post('/sync-gsheets', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const { class_id, spreadsheet_url, sheet_name = 'Sheet1' } = req.body;

    if (!class_id || !spreadsheet_url) {
        return res.status(400).json({ message: "Class ID and Spreadsheet URL/ID are required" });
    }

    const spreadsheetId = extractSpreadsheetId(spreadsheet_url);

    try {
        const sheets = await getAuthenticatedSheets();

        // 1. Fetch spreadsheet values
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheet_name}!A1:Z500`, // Fetch a reasonable range
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: "No data found in the spreadsheet." });
        }

        // 2. Find the "Email" column
        const headers = rows[0].map(h => h.toLowerCase().trim());
        const emailIdx = headers.indexOf('email');

        if (emailIdx === -1) {
            return res.status(400).json({ message: "Could not find an 'Email' column in the spreadsheet. Please ensure your sheet has an 'Email' header." });
        }

        const dataRows = rows.slice(1);
        const emailsFromSheet = dataRows
            .map(row => row[emailIdx]?.toLowerCase().trim())
            .filter(email => !!email);

        if (emailsFromSheet.length === 0) {
            return res.json({ message: "No valid emails found in the sheet.", count: 0 });
        }

        // 3. Get all students enrolled in this class
        const classRes = await db.execute({
            sql: "SELECT course_id FROM classes WHERE id = ?",
            args: [class_id]
        });
        if (classRes.rows.length === 0) return res.status(404).json({ message: "Class not found" });
        const courseId = classRes.rows[0].course_id;

        const studentsRes = await db.execute({
            sql: `
                SELECT DISTINCT u.id, u.email
                FROM users u
                WHERE u.role = 'student' AND (
                    u.id IN (SELECT student_id FROM enrollments WHERE course_id = ?)
                    OR u.batch_id IN (SELECT batch_id FROM batch_courses WHERE course_id = ?)
                )
            `,
            args: [courseId, courseId]
        });

        const students = studentsRes.rows;
        let syncCount = 0;

        // 4. Mark attendance for matching emails
        for (const student of students) {
            if (emailsFromSheet.includes(student.email.toLowerCase().trim())) {
                await db.execute({
                    sql: `INSERT INTO attendance (class_id, student_id, status) 
                          VALUES (?, ?, 'Present') 
                          ON CONFLICT(class_id, student_id) 
                          DO UPDATE SET status = 'Present', updated_at = CURRENT_TIMESTAMP`,
                    args: [class_id, student.id]
                });
                syncCount++;
            }
        }

        res.json({ 
            message: `Successfully synced attendance from Google Sheets.`, 
            count: syncCount,
            totalFound: emailsFromSheet.length
        });

    } catch (error) {
        if (error.message === 'NOT_AUTHENTICATED') {
            return res.status(401).json({ message: "Google account not connected. Please authenticate first." });
        }
        console.error("Google Sheets Sync Error:", error);
        res.status(500).json({ message: error.message });
    }
});


export default router;
