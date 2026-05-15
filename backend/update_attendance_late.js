import 'dotenv/config';
import { db } from './db.js';

const migrate = async () => {
    try {
        console.log("Updating attendance table schema...");

        // SQLite doesn't support changing constraints directly.
        // We'll rename the old table, create a new one, and copy data.
        
        await db.execute("ALTER TABLE attendance RENAME TO attendance_old");
        
        await db.execute(`
            CREATE TABLE attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                class_id INTEGER NOT NULL,
                student_id INTEGER NOT NULL,
                status TEXT CHECK(status IN ('Present', 'Absent', 'Late', 'Pending')) DEFAULT 'Pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
                FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(class_id, student_id)
            )
        `);

        await db.execute(`
            INSERT INTO attendance (id, class_id, student_id, status, created_at, updated_at)
            SELECT id, class_id, student_id, status, created_at, updated_at FROM attendance_old
        `);

        await db.execute("DROP TABLE attendance_old");

        console.log("Attendance table updated successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

migrate();
