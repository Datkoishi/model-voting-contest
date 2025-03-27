import mysql from "mysql2/promise"
import { dbConfig } from "../config/database.js"
import bcrypt from "bcrypt"

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
    console.log("Models table created or already exists")

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
      // Create default admin users
      // 1. Default admin (username: admin, password: admin123)
      const adminPasswordHash = await bcrypt.hash("admin123", 10)
      await connection.query("INSERT INTO admin_users (username, password) VALUES (?, ?)", ["admin", adminPasswordHash])

      // 2. Custom admin (username: truongdat, password: 18042005)
      const truongdatPasswordHash = await bcrypt.hash("18042005", 10)
      await connection.query("INSERT INTO admin_users (username, password) VALUES (?, ?)", [
        "truongdat",
        truongdatPasswordHash,
      ])

      console.log("Admin users created")
    }

    // Check if models table is empty
    const [rows] = await connection.query("SELECT COUNT(*) as count FROM models")
    if (rows[0].count === 0) {
      // Insert sample data
      await seedSampleData(connection)
    }
  } catch (error) {
    console.error("Error initializing database:", error)
  } finally {
    await connection.end()
  }
}

// Seed sample data
async function seedSampleData(connection) {
  try {
    // Sample models data
    const models = [
      {
        name: "Emma Johnson",
        code: "EJ001",
        team: "Team Alpha",
        description: "Professional runway model with 5 years of experience in high fashion.",
        image: "/placeholder.svg?height=300&width=250&text=Emma",
      },
      {
        name: "Michael Chen",
        code: "MC002",
        team: "Team Beta",
        description: "Commercial model specializing in fitness and sportswear campaigns.",
        image: "/placeholder.svg?height=300&width=250&text=Michael",
      },
      {
        name: "Sophia Rodriguez",
        code: "SR003",
        team: "Team Alpha",
        description: "Editorial model featured in Vogue, Elle, and Harper's Bazaar.",
        image: "/placeholder.svg?height=300&width=250&text=Sophia",
      },
      {
        name: "James Wilson",
        code: "JW004",
        team: "Team Gamma",
        description: "Fashion model with a unique look, perfect for avant-garde collections.",
        image: "/placeholder.svg?height=300&width=250&text=James",
      },
      {
        name: "Olivia Kim",
        code: "OK005",
        team: "Team Beta",
        description: "Versatile model experienced in both runway and print advertising.",
        image: "/placeholder.svg?height=300&width=250&text=Olivia",
      },
      {
        name: "David Patel",
        code: "DP006",
        team: "Team Gamma",
        description: "Up-and-coming model known for his distinctive style and presence.",
        image: "/placeholder.svg?height=300&width=250&text=David",
      },
      {
        name: "Zoe Thompson",
        code: "ZT007",
        team: "Team Delta",
        description: "Specializes in swimwear and beachwear modeling for major brands.",
        image: "/placeholder.svg?height=300&width=250&text=Zoe",
      },
      {
        name: "Lucas Garcia",
        code: "LG008",
        team: "Team Delta",
        description: "Model and influencer with a strong social media following.",
        image: "/placeholder.svg?height=300&width=250&text=Lucas",
      },
    ]

    // Insert models
    for (const model of models) {
      await connection.query("INSERT INTO models (name, code, team, description, image) VALUES (?, ?, ?, ?, ?)", [
        model.name,
        model.code,
        model.team,
        model.description,
        model.image,
      ])
    }

    console.log("Sample data seeded successfully")
  } catch (error) {
    console.error("Error seeding sample data:", error)
  }
}

export { initializeDatabase }

