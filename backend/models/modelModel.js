import { pool } from "../config/database.js"

// Get all models with vote counts
async function getAllModels() {
  try {
    const [rows] = await pool.query(`
      SELECT m.id, m.name, m.description, m.image, COUNT(v.id) as votes
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

// Get model by ID
async function getModelById(id) {
  try {
    const [rows] = await pool.query("SELECT * FROM models WHERE id = ?", [id])
    return rows[0]
  } catch (error) {
    console.error("Error in getModelById:", error)
    throw error
  }
}

// Create a new model
async function createModel(model) {
  try {
    const { name, description, image } = model
    const [result] = await pool.query("INSERT INTO models (name, description, image) VALUES (?, ?, ?)", [
      name,
      description,
      image,
    ])
    return { id: result.insertId, ...model }
  } catch (error) {
    console.error("Error in createModel:", error)
    throw error
  }
}

// Update a model
async function updateModel(id, model) {
  try {
    const { name, description, image } = model
    await pool.query("UPDATE models SET name = ?, description = ?, image = ? WHERE id = ?", [
      name,
      description,
      image,
      id,
    ])
    return { id, ...model }
  } catch (error) {
    console.error("Error in updateModel:", error)
    throw error
  }
}

// Delete a model
async function deleteModel(id) {
  try {
    await pool.query("DELETE FROM models WHERE id = ?", [id])
    return { id }
  } catch (error) {
    console.error("Error in deleteModel:", error)
    throw error
  }
}

export { getAllModels, getModelById, createModel, updateModel, deleteModel }

