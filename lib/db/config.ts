import mysql from "mysql2/promise";

export const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "rms_db",
  port: parseInt(process.env.DB_PORT || "3306"),
};

export async function createConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log("Database connected successfully");
    return connection;
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
}
