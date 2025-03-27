import mysql from "mysql2/promise"
import { dbConfig } from "../config/database.js"

// Create database and tables if they don't exist
async function initializeDatabase() {
  // Create connection without database selected
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
  })

  try {
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`)
    console.log(`Database '${dbConfig.database}' created or already exists`)

    // Use the database
    await connection.query(`USE ${dbConfig.database}`)

    // Check if models table exists
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = '${dbConfig.database}' 
      AND TABLE_NAME = 'models'
    `)

    if (tables.length === 0) {
      // Create models table with additional fields for admin
      await connection.query(`
        CREATE TABLE IF NOT EXISTS models (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          code VARCHAR(50),
          team VARCHAR(100),
          description TEXT,
          image VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)
      console.log("Models table created")
    } else {
      // Check if code and team columns exist
      const [columns] = await connection.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = '${dbConfig.database}' 
        AND TABLE_NAME = 'models'
        AND COLUMN_NAME IN ('code', 'team')
      `)

      const columnNames = columns.map((col) => col.COLUMN_NAME)

      // Add missing columns if needed
      if (!columnNames.includes("code")) {
        await connection.query(`ALTER TABLE models ADD COLUMN code VARCHAR(50)`)
        console.log("Added 'code' column to models table")
      }

      if (!columnNames.includes("team")) {
        await connection.query(`ALTER TABLE models ADD COLUMN team VARCHAR(100)`)
        console.log("Added 'team' column to models table")
      }

      console.log("Models table already exists and has been updated if needed")
    }

    // Create votes table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS votes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        model_id INT NOT NULL,
        email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (model_id) REFERENCES models(id),
        INDEX (email, created_at)
      )
    `)
    console.log("Votes table created or already exists")

    // Create admin users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log("Admin users table created or already exists")

    // Create settings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT PRIMARY KEY DEFAULT 1,
        contest_name VARCHAR(255) DEFAULT 'Model Voting Contest',
        voting_enabled BOOLEAN DEFAULT TRUE,
        results_public BOOLEAN DEFAULT TRUE,
        votes_per_day INT DEFAULT 1,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)
    console.log("Settings table created or already exists")

    // Check if admin user exists, if not create default admin
    const [adminRows] = await connection.query("SELECT COUNT(*) as count FROM admin_users")
    if (adminRows[0].count === 0) {
      // Create truongdat admin account
      await connection.query("INSERT INTO admin_users (username, password) VALUES (?, ?)", ["truongdat", "18042005"])

      console.log("Admin user created")
    }

    // We're not adding sample data anymore as requested by the user
  } catch (error) {
    console.error("Error initializing database:", error)
  } finally {
    await connection.end()
  }
}

export { initializeDatabase }

