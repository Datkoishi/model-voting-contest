import * as adminModel from "../models/adminModel.js"

// Authenticate admin requests
export function authenticateAdmin(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" })
    }

    const token = authHeader.split(" ")[1]
    if (!token) {
      return res.status(401).json({ message: "Authentication required" })
    }

    // Verify token
    const decoded = adminModel.verifyToken(token)

    // Add user info to request
    req.user = decoded

    next()
  } catch (error) {
    console.error("Authentication error:", error)
    res.status(401).json({ message: "Authentication failed" })
  }
}

