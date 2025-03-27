import * as voteModel from "../models/voteModel.js"
import * as modelModel from "../models/modelModel.js"

// Get rankings
export async function getRankings(req, res) {
  try {
    const rankings = await voteModel.getRankings()
    res.json(rankings)
  } catch (error) {
    console.error("Error fetching rankings:", error)
    res.status(500).json({ message: "Failed to fetch rankings" })
  }
}

// Get results
export async function getResults(req, res) {
  try {
    const results = await voteModel.getResults()
    res.json(results)
  } catch (error) {
    console.error("Error fetching results:", error)
    res.status(500).json({ message: "Failed to fetch results" })
  }
}

// Submit vote
export async function submitVote(req, res) {
  const { modelId, email } = req.body

  if (!modelId || !email) {
    return res.status(400).json({ message: "Model ID and email are required" })
  }

  try {
    // Check if model exists
    const model = await modelModel.getModelById(modelId)
    if (!model) {
      return res.status(404).json({ message: "Model not found" })
    }

    // Check if user has already voted today
    const hasVoted = await voteModel.hasVotedToday(email)
    if (hasVoted) {
      return res.status(400).json({ message: "You have already voted today" })
    }

    // Submit vote
    await voteModel.submitVote(modelId, email)
    res.status(201).json({ message: "Vote submitted successfully" })
  } catch (error) {
    console.error("Error submitting vote:", error)
    res.status(500).json({ message: "Failed to submit vote" })
  }
}

// Get vote statistics
export async function getVoteStats(req, res) {
  try {
    const stats = await voteModel.getVoteStats()
    res.json(stats)
  } catch (error) {
    console.error("Error fetching vote statistics:", error)
    res.status(500).json({ message: "Failed to fetch vote statistics" })
  }
}

