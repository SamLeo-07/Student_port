import { db } from './db.js';

const initDb = async () => {
    try {
        console.log("Initializing Database...");

        // Users Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT UNIQUE,
                password TEXT,
                role TEXT CHECK(role IN ('student', 'admin', 'super_admin')) DEFAULT 'student',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Courses Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS courses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                description TEXT,
                duration TEXT,
                thumbnail TEXT
            )
        `);

        // Classes Table (linked to course)
        await db.execute(`
            CREATE TABLE IF NOT EXISTS classes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                course_id INTEGER,
                title TEXT,
                video_url TEXT,
                schedule DATETIME,
                FOREIGN KEY(course_id) REFERENCES courses(id)
            )
        `);

        // Assignments Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS assignments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                course_id INTEGER,
                title TEXT,
                description TEXT,
                due_date DATETIME,
                FOREIGN KEY(course_id) REFERENCES courses(id)
            )
        `);

        // Submissions Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS submissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                assignment_id INTEGER,
                student_id INTEGER,
                submission_link TEXT,
                grade TEXT,
                status TEXT DEFAULT 'submitted',
                submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(assignment_id) REFERENCES assignments(id),
                FOREIGN KEY(student_id) REFERENCES users(id)
            )
        `);

        // Projects Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER,
                course_id INTEGER,
                title TEXT,
                repo_link TEXT,
                status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
                submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(student_id) REFERENCES users(id),
                FOREIGN KEY(course_id) REFERENCES courses(id)
            )
        `);

        // Mock Tests Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS mock_tests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                course_id INTEGER,
                module_id INTEGER,
                title TEXT,
                duration INTEGER,
                total_marks INTEGER,
                type TEXT CHECK(type IN ('MCQ', 'Coding')) DEFAULT 'MCQ',
                questions JSON, -- Store questions as JSON string for simplicity in SQLite
                FOREIGN KEY(course_id) REFERENCES courses(id),
                FOREIGN KEY(module_id) REFERENCES modules(id)
            )
        `);

        // Test Results Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS test_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                test_id INTEGER,
                student_id INTEGER,
                score INTEGER,
                total_questions INTEGER,
                answers JSON,
                completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(test_id) REFERENCES mock_tests(id),
                FOREIGN KEY(student_id) REFERENCES users(id)
            )
        `);

        // Certificate Requests Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS certificate_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER,
                course_id INTEGER,
                video_link TEXT,
                status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
                request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(student_id) REFERENCES users(id),
                FOREIGN KEY(course_id) REFERENCES courses(id)
            )
        `);

        // Certificates Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS certificates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER,
                course_id INTEGER,
                issue_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(student_id) REFERENCES users(id),
                FOREIGN KEY(course_id) REFERENCES courses(id)
            )
        `);

        console.log("Database initialized successfully!");
    } catch (error) {
        console.error("Error initializing database:", error);
    }
};

initDb();
