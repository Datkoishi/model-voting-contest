import * as adminModel from "../models/adminModel.js"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs/promises"

// Get current file directory (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Admin login
export async function login(req, res) {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" })
    }

    const result = await adminModel.login(username, password)
    res.json(result)
  } catch (error) {
    console.error("Login error:", error)
    res.status(401).json({ message: error.message || "Authentication failed" })
  }
}

// Get all models
export async function getAllModels(req, res) {
  try {
    const models = await adminModel.getAllModels()
    res.json(models)
  } catch (error) {
    console.error("Error fetching models:", error)
    res.status(500).json({ message: "Failed to fetch models" })
  }
}

// Get model by ID
export async function getModelById(req, res) {
  try {
    const id = req.params.id
    const model = await adminModel.getModelById(id)

    if (!model) {
      return res.status(404).json({ message: "Model not found" })
    }

    res.json(model)
  } catch (error) {
    console.error("Error fetching model:", error)
    res.status(500).json({ message: "Failed to fetch model" })
  }
}

// Create a new model
export async function createModel(req, res) {
  try {
    const { name, code, team, description } = req.body

    if (!name) {
      return res.status(400).json({ message: "Model name is required" })
    }

    let imagePath = null

    // Handle image upload if present
    if (req.file) {
      const uploadDir = path.join(__dirname, "../../frontend/uploads")

      // Create uploads directory if it doesn't exist
      try {
        await fs.access(uploadDir)
      } catch (error) {
        await fs.mkdir(uploadDir, { recursive: true })
      }

      // Save image with unique filename
      const timestamp = Date.now()
      const filename = `model_${timestamp}_${req.file.originalname}`
      const filePath = path.join(uploadDir, filename)

      await fs.writeFile(filePath, req.file.buffer)

      // Set image path for database
      imagePath = `/uploads/${filename}`
    }

    const newModel = await adminModel.createModel({
      name,
      code: code || null,
      team: team || null,
      description: description || null,
      image: imagePath,
    })

    res.status(201).json(newModel)
  } catch (error) {
    console.error("Error creating model:", error)
    res.status(500).json({ message: "Failed to create model" })
  }
}

// Update a model
export async function updateModel(req, res) {
  try {
    const id = req.params.id
    const { name, code, team, description } = req.body

    if (!name) {
      return res.status(400).json({ message: "Model name is required" })
    }

    // Check if model exists
    const model = await adminModel.getModelById(id)
    if (!model) {
      return res.status(404).json({ message: "Model not found" })
    }

    let imagePath = undefined // undefined means don't update the image

    // Handle image upload if present
    if (req.file) {
      const uploadDir = path.join(__dirname, "../../frontend/uploads")

      // Create uploads directory if it doesn't exist
      try {
        await fs.access(uploadDir)
      } catch (error) {
        await fs.mkdir(uploadDir, { recursive: true })
      }

      // Delete old image if exists and not a placeholder
      if (model.image && !model.image.includes("placeholder")) {
        try {
          const oldImagePath = path.join(__dirname, "../../frontend", model.image)
          await fs.unlink(oldImagePath)
        } catch (error) {
          console.error("Error deleting old image:", error)
          // Continue even if old image deletion fails
        }
      }

      // Save new image with unique filename
      const timestamp = Date.now()
      const filename = `model_${timestamp}_${req.file.originalname}`
      const filePath = path.join(uploadDir, filename)

      await fs.writeFile(filePath, req.file.buffer)

      // Set image path for database
      imagePath = `/uploads/${filename}`
    }

    const updatedModel = await adminModel.updateModel(id, {
      name,
      code: code || null,
      team: team || null,
      description: description || null,
      image: imagePath,
    })

    res.json(updatedModel)
  } catch (error) {
    console.error("Error updating model:", error)
    res.status(500).json({ message: "Failed to update model" })
  }
}

// Delete a model
export async function deleteModel(req, res) {
  try {
    const id = req.params.id

    // Get model to check if it has an image to delete
    const model = await adminModel.getModelById(id)
    if (!model) {
      return res.status(404).json({ message: "Model not found" })
    }

    // Delete image file if exists and not a placeholder
    if (model.image && !model.image.includes("placeholder")) {
      try {
        const imagePath = path.join(__dirname, "../../frontend", model.image)
        await fs.unlink(imagePath)
      } catch (error) {
        console.error("Error deleting image file:", error)
        // Continue even if image deletion fails
      }
    }

    await adminModel.deleteModel(id)
    res.json({ message: "Model deleted successfully" })
  } catch (error) {
    console.error("Error deleting model:", error)
    res.status(500).json({ message: "Failed to delete model" })
  }
}

// Get all votes
export async function getAllVotes(req, res) {
  try {
    const { from, to } = req.query

    let votes
    if (from || to) {
      votes = await adminModel.getVotesByDate(from, to)
    } else {
      votes = await adminModel.getAllVotes()
    }

    res.json(votes)
  } catch (error) {
    console.error("Error fetching votes:", error)
    res.status(500).json({ message: "Failed to fetch votes" })
  }
}

// Delete a vote
export async function deleteVote(req, res) {
  try {
    const id = req.params.id
    await adminModel.deleteVote(id)
    res.json({ message: "Vote deleted successfully" })
  } catch (error) {
    console.error("Error deleting vote:", error)
    res.status(500).json({ message: "Failed to delete vote" })
  }
}

// Get settings
export async function getSettings(req, res) {
  try {
    const settings = await adminModel.getSettings()
    res.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    res.status(500).json({ message: "Failed to fetch settings" })
  }
}

// Update settings
export async function updateSettings(req, res) {
  try {
    const settings = req.body
    const updatedSettings = await adminModel.updateSettings(settings)
    res.json(updatedSettings)
  } catch (error) {
    console.error("Error updating settings:", error)
    res.status(500).json({ message: "Failed to update settings" })
  }
}

