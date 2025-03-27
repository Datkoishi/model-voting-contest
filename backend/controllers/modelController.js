import * as modelModel from "../models/modelModel.js"

// Get all models
export async function getAllModels(req, res) {
  try {
    const models = await modelModel.getAllModels()
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
    const model = await modelModel.getModelById(id)

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
    const { name, description, image } = req.body

    if (!name) {
      return res.status(400).json({ message: "Model name is required" })
    }

    const newModel = await modelModel.createModel({ name, description, image })
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
    const { name, description, image } = req.body

    if (!name) {
      return res.status(400).json({ message: "Model name is required" })
    }

    const model = await modelModel.getModelById(id)
    if (!model) {
      return res.status(404).json({ message: "Model not found" })
    }

    const updatedModel = await modelModel.updateModel(id, { name, description, image })
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

    const model = await modelModel.getModelById(id)
    if (!model) {
      return res.status(404).json({ message: "Model not found" })
    }

    await modelModel.deleteModel(id)
    res.json({ message: "Model deleted successfully" })
  } catch (error) {
    console.error("Error deleting model:", error)
    res.status(500).json({ message: "Failed to delete model" })
  }
}

