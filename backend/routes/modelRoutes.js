import express from "express"
import * as modelController from "../controllers/modelController.js"

const router = express.Router()

// GET /api/models - Get all models
router.get("/", modelController.getAllModels)

// GET /api/models/:id - Get model by ID
router.get("/:id", modelController.getModelById)

// POST /api/models - Create a new model
router.post("/", modelController.createModel)

// PUT /api/models/:id - Update a model
router.put("/:id", modelController.updateModel)

// DELETE /api/models/:id - Delete a model
router.delete("/:id", modelController.deleteModel)

export default router

