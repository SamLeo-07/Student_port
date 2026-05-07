import { db } from './db.js';
import bcrypt from 'bcryptjs';

async function reset() {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const studentPassword = await bcrypt.hash('student123', 10);

    console.log('Resetting passwords...');

    // Reset admin@gmail.com
    await db.execute({
        sql: "UPDATE users SET password = ? WHERE email = ?",
        args: [adminPassword, 'admin@gmail.com']
    });

    // Reset student@gmail.com
    await db.execute({
        sql: "UPDATE users SET password = ? WHERE email = ?",
        args: [studentPassword, 'student@gmail.com']
    });

    console.log('Passwords reset successfully for admin@gmail.com and student@gmail.com');
    process.exit(0);
}

reset().catch(err => {
    console.error(err);
    process.exit(1);
});
