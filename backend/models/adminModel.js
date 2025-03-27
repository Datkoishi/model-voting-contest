import { pool } from "../config/database.js"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Verify admin credentials and generate token
async function login(username, password) {
  try {
    // For simplicity, we're using hardcoded credentials
    // In a real application, you would fetch this from a database

    // Check for the default admin account
    if (username === "admin" && password === "admin123") {
      const token = jwt.sign({ id: 1, username: "admin" }, JWT_SECRET, { expiresIn: "24h" })

      return {
        token,
        username: "admin",
      }
    }

    // Check for truongdat account
    if (username === "truongdat" && password === "18042005") {
      const token = jwt.sign({ id: 2, username: "truongdat" }, JWT_SECRET, { expiresIn: "24h" })

      return {
        token,
        username: "truongdat",
      }
    }

    // If no match found
    throw new Error("Invalid username or password")
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
    // Modified query to check if columns exist first
    const [columns] = await pool.query(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'models'
  `)

    const columnNames = columns.map((col) => col.COLUMN_NAME)

    // Build query based on existing columns
    let query = `
    SELECT m.id, m.name, m.description, m.image, COUNT(v.id) as votes
  `

    // Add code and team columns if they exist
    if (columnNames.includes("code")) {
      query += `, m.code`
    }

    if (columnNames.includes("team")) {
      query += `, m.team`
    }

    query += `
    FROM models m
    LEFT JOIN votes v ON m.id = v.model_id
    GROUP BY m.id
    ORDER BY m.name ASC
  `

    const [rows] = await pool.query(query)

    // Add empty values for missing columns
    return rows.map((row) => ({
      ...row,
      code: row.code || null,
      team: row.team || null,
    }))
  } catch (error) {
    console.error("Error in getAllModels:", error)
    throw error
  }
}

// Get model by ID (admin version with all details)
async function getModelById(id) {
  try {
    // Modified query to check if columns exist first
    const [columns] = await pool.query(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'models'
  `)

    const columnNames = columns.map((col) => col.COLUMN_NAME)

    // Build query based on existing columns
    let query = `
    SELECT m.id, m.name, m.description, m.image, COUNT(v.id) as votes
  `

    // Add code and team columns if they exist
    if (columnNames.includes("code")) {
      query += `, m.code`
    }

    if (columnNames.includes("team")) {
      query += `, m.team`
    }

    query += `
    FROM models m
    LEFT JOIN votes v ON m.id = v.model_id
    WHERE m.id = ?
    GROUP BY m.id
  `

    const [rows] = await pool.query(query, [id])

    if (rows.length === 0) {
      return null
    }

    // Add empty values for missing columns
    return {
      ...rows[0],
      code: rows[0].code || null,
      team: rows[0].team || null,
    }
  } catch (error) {
    console.error("Error in getModelById:", error)
    throw error
  }
}

// Create a new model
async function createModel(model) {
  try {
    const { name, code, team, description, image } = model

    // Check if columns exist first
    const [columns] = await pool.query(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'models'
  `)

    const columnNames = columns.map((col) => col.COLUMN_NAME)

    // If code and team columns don't exist, add them
    if (!columnNames.includes("code")) {
      await pool.query(`ALTER TABLE models ADD COLUMN code VARCHAR(50)`)
    }

    if (!columnNames.includes("team")) {
      await pool.query(`ALTER TABLE models ADD COLUMN team VARCHAR(100)`)
    }

    // Now we can safely insert with all columns
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

    // Check if columns exist first
    const [columns] = await pool.query(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'models'
  `)

    const columnNames = columns.map((col) => col.COLUMN_NAME)

    // If code and team columns don't exist, add them
    if (!columnNames.includes("code")) {
      await pool.query(`ALTER TABLE models ADD COLUMN code VARCHAR(50)`)
    }

    if (!columnNames.includes("team")) {
      await pool.query(`ALTER TABLE models ADD COLUMN team VARCHAR(100)`)
    }

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
    // First delete all votes for this model - using a transaction to ensure data integrity
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      // Delete all votes for this model
      await connection.query("DELETE FROM votes WHERE model_id = ?", [id])
      console.log(`Đã xóa tất cả phiếu bầu cho người mẫu ID ${id}`)

      // Then delete the model
      await connection.query("DELETE FROM models WHERE id = ?", [id])
      console.log(`Đã xóa người mẫu ID ${id}`)

      await connection.commit()
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }

    return { id }
  } catch (error) {
    console.error("Lỗi khi xóa người mẫu:", error)
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

