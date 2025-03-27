// Error handling middleware
export function errorHandler(err, req, res, next) {
    console.error("Error:", err.stack)
  
    const statusCode = err.statusCode || 500
    const message = err.message || "Internal Server Error"
  
    res.status(statusCode).json({
      error: {
        message,
        status: statusCode,
        timestamp: new Date().toISOString(),
      },
    })
  }
  
  // 404 Not Found middleware
  export function notFound(req, res, next) {
    const error = new Error(`Not Found - ${req.originalUrl}`)
    error.statusCode = 404
    next(error)
  }
  
  