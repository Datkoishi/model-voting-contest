import express from "express"
import * as voteController from "../controllers/voteController.js"

const router = express.Router()

// GET /api/rankings - Get current rankings
router.get("/rankings", voteController.getRankings)

// GET /api/results - Get final results
router.get("/results", voteController.getResults)

// POST /api/vote - Submit a vote
router.post("/vote", voteController.submitVote)

// GET /api/stats - Get vote statistics
router.get("/stats", voteController.getVoteStats)

export default router

