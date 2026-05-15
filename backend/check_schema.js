import { createClient } from "@libsql/client/web";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function run() {
    try {
        const res1 = await db.execute("PRAGMA table_info(mock_tests)");
        console.log("MOCK_TESTS:", res1.rows.map(r => r.name));

        const res2 = await db.execute("PRAGMA table_info(modules)");
        console.log("MODULES:", res2.rows.map(r => r.name));
    } catch (err) {
        console.error(err);
    }
}

run();
