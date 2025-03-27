import mysql from "mysql2/promise"
import dotenv from "dotenv"

dotenv.config()

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "truongdat",
  password: process.env.DB_PASSWORD || "18042005",
  database: process.env.DB_NAME || "vnusDB",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Create connection pool
const pool = mysql.createPool(dbConfig)

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log("Database connection successful")
    connection.release()
    return true
  } catch (error) {
    console.error("Database connection failed:", error)
    return false
  }
}

export { pool, testConnection, dbConfig }

