import { createClient } from "@libsql/client/web";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function fix() {
    const email = 'admin@gmail.com';
    const password = 'admin123';
    const hashed = await bcrypt.hash(password, 10);
    
    console.log("Setting password for", email, "to", password);
    const res = await db.execute({
        sql: "UPDATE users SET password = ? WHERE email = ?",
        args: [hashed, email]
    });
    console.log("Result:", res);
}

fix();
