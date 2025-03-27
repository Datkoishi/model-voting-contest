import { pool } from "../config/database.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Verify admin credentials and generate token
async function login(username, password) {
  try {
    // In a real application, you would fetch this from a database
    // For simplicity, we're using hardcoded credentials
    const adminUsers = [
      {
        id: 1,
        username: "admin",
        // Default password: admin123
        passwordHash: "$2b$10$XFE/UzEFMfhpGx2U9BFOGOq9RWf6sZhLNM4JNxhzPKz8.TZ5jCNye",
      },
      {
        id: 2,
        username: "truongdat",
        // Password: 18042005
        passwordHash: "$2b$10$Ht0vQSz8VWDCFgQC1Yl.9.Ql1KJl.Pf9EMeZwsYQNJTHUlIcsr7Uy",
      },
    ]

    // Find user by username
    const adminUser = adminUsers.find((user) => user.username === username)

    // Check if username matches
    if (!adminUser) {
      throw new Error("Invalid username or password")
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, adminUser.passwordHash)
    if (!passwordMatch) {
      throw new Error("Invalid username or password")
    }

    // Generate JWT token
    const token = jwt.sign({ id: adminUser.id, username: adminUser.username }, JWT_SECRET, { expiresIn: "24h" })

    return {
      token,
      username: adminUser.username,
    }
  } catch (error) {
    console.error("Error in admin login:", error)
    throw error
  }
}

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    throw new Error("Invalid or expired token")
  }
}

// Get all models with vote counts (admin version with more details)
async function getAllModels() {
  try {
    const [rows] = await pool.query(`
      SELECT m.id, m.name, m.code, m.team, m.description, m.image, COUNT(v.id) as votes
      FROM models m
      LEFT JOIN votes v ON m.id = v.model_id
      GROUP BY m.id
      ORDER BY m.name ASC
    `)
    return rows
  } catch (error) {
    console.error("Error in getAllModels:", error)
    throw error
  }
}

// Get model by ID (admin version with all details)
async function getModelById(id) {
  try {
    const [rows] = await pool.query(
      `
      SELECT m.*, COUNT(v.id) as votes
      FROM models m
      LEFT JOIN votes v ON m.id = v.model_id
      WHERE m.id = ?
      GROUP BY m.id
    `,
      [id],
    )
    return rows[0]
  } catch (error) {
    console.error("Error in getModelById:", error)
    throw error
  }
}

// Create a new model
async function createModel(model) {
  try {
    const { name, code, team, description, image } = model
    const [result] = await pool.query(
      "INSERT INTO models (name, code, team, description, image) VALUES (?, ?, ?, ?, ?)",
      [name, code, team, description, image],
    )
    return { id: result.insertId, ...model }
  } catch (error) {
    console.error("Error in createModel:", error)
    throw error
  }
}

// Update a model
async function updateModel(id, model) {
  try {
    const { name, code, team, description, image } = model

    // If image is provided, update it, otherwise keep the existing one
    let query, params

    if (image !== undefined) {
      query = "UPDATE models SET name = ?, code = ?, team = ?, description = ?, image = ? WHERE id = ?"
      params = [name, code, team, description, image, id]
    } else {
      query = "UPDATE models SET name = ?, code = ?, team = ?, description = ? WHERE id = ?"
      params = [name, code, team, description, id]
    }

    await pool.query(query, params)
    return { id, ...model }
  } catch (error) {
    console.error("Error in updateModel:", error)
    throw error
  }
}

// Delete a model
async function deleteModel(id) {
  try {
    // First delete all votes for this model
    await pool.query("DELETE FROM votes WHERE model_id = ?", [id])

    // Then delete the model
    await pool.query("DELETE FROM models WHERE id = ?", [id])
    return { id }
  } catch (error) {
    console.error("Error in deleteModel:", error)
    throw error
  }
}

// Get all votes with model details
async function getAllVotes() {
  try {
    const [rows] = await pool.query(`
      SELECT v.id, v.model_id, m.name as model_name, v.email, v.created_at
      FROM votes v
      JOIN models m ON v.model_id = m.id
      ORDER BY v.created_at DESC
    `)
    return rows
  } catch (error) {
    console.error("Error in getAllVotes:", error)
    throw error
  }
}

// Get votes filtered by date
async function getVotesByDate(dateFrom, dateTo) {
  try {
    let query = `
      SELECT v.id, v.model_id, m.name as model_name, v.email, v.created_at
      FROM votes v
      JOIN models m ON v.model_id = m.id
      WHERE 1=1
    `

    const params = []

    if (dateFrom) {
      query += " AND DATE(v.created_at) >= ?"
      params.push(dateFrom)
    }

    if (dateTo) {
      query += " AND DATE(v.created_at) <= ?"
      params.push(dateTo)
    }

    query += " ORDER BY v.created_at DESC"

    const [rows] = await pool.query(query, params)
    return rows
  } catch (error) {
    console.error("Error in getVotesByDate:", error)
    throw error
  }
}

// Delete a vote
async function deleteVote(id) {
  try {
    await pool.query("DELETE FROM votes WHERE id = ?", [id])
    return { id }
  } catch (error) {
    console.error("Error in deleteVote:", error)
    throw error
  }
}

// Get settings
async function getSettings() {
  try {
    // In a real application, you would fetch this from a database
    // For simplicity, we're returning default settings
    return {
      contestName: "Model Voting Contest",
      votingEnabled: true,
      resultsPublic: true,
      votesPerDay: 1,
    }
  } catch (error) {
    console.error("Error in getSettings:", error)
    throw error
  }
}

// Update settings
async function updateSettings(settings) {
  try {
    // In a real application, you would save this to a database
    // For simplicity, we're just returning the updated settings
    return settings
  } catch (error) {
    console.error("Error in updateSettings:", error)
    throw error
  }
}

export {
  login,
  verifyToken,
  getAllModels,
  getModelById,
  createModel,
  updateModel,
  deleteModel,
  getAllVotes,
  getVotesByDate,
  deleteVote,
  getSettings,
  updateSettings,
}

