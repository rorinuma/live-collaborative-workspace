import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

const sql = postgres({
  host: process.env.DB_HOST_NAME,
  port: parseInt(process.env.DB_PORT as string, 10) || 5432,
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
});

sql`SELECT 1`
  .then(() => console.log("Connected to PostgreSQL successfully!"))
  .catch((err) => console.error("Failed to connect to PostgreSQL:", err));

export default sql;
