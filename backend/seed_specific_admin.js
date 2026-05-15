import { db } from './db.js';
import bcrypt from 'bcryptjs';

async function seedSpecificAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin@123', 10);
    // Check if user exists
    const result = await db.execute({
      sql: `SELECT * FROM users WHERE email = ?`,
      args: ['admin@gmail.com']
    });

    if (result.rows.length > 0) {
      await db.execute({
        sql: `UPDATE users SET password = ?, role = 'admin', name = 'Admin' WHERE email = ?`,
        args: [hashedPassword, 'admin@gmail.com']
      });
      console.log("Admin updated successfully: admin@gmail.com / admin@123");
    } else {
      await db.execute({
        sql: `INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)`,
        args: ['admin@gmail.com', hashedPassword, 'admin', 'Admin']
      });
      console.log("Admin created successfully: admin@gmail.com / admin@123");
    }
  } catch (err) {
    console.error(err);
  }
}

seedSpecificAdmin();
