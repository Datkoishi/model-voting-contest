import express from "express"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"

// Import routes
import modelRoutes from "./routes/modelRoutes.js"
import voteRoutes from "./routes/voteRoutes.js"

// Import middleware
import { errorHandler, notFound } from "./middleware/errorHandler.js"

// Import database utilities
import { testConnection } from "./config/database.js"
import { initializeDatabase } from "./utils/dbInit.js"

// Load environment variables
dotenv.config()

// Create Express app
const app = express()
const PORT = process.env.PORT || 3000

// Get current file directory (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, "../frontend")))

// API Routes
app.use("/api/models", modelRoutes)
app.use("/api", voteRoutes)

// Serve frontend for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"))
})

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase()

    // Test database connection
    const dbConnected = await testConnection()

    if (!dbConnected) {
      console.error("Database connection failed. Server will start but may not function correctly.")
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
      console.log(`API endpoints available at http://localhost:${PORT}/api`)
      console.log(`Frontend available at http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

startServer()

