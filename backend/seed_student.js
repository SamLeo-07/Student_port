import { db } from './db.js';
import bcrypt from 'bcryptjs';

async function seedStudent() {
  try {
    const hashedPassword = await bcrypt.hash('pass123', 10);
    await db.execute({
      sql: `INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)`,
      args: ['x@gmail.com', hashedPassword, 'student', 'Student Demo']
    });
    console.log("Student seeded successfully");
  } catch (err) {
    if (err.message.includes("UNIQUE constraint failed")) {
      console.log("Student already exists.");
    } else {
      console.error(err);
    }
  }
}

seedStudent();
