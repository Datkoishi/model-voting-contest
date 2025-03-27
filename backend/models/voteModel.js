import { pool } from "../config/database.js"

// Get rankings (models ordered by vote count)
async function getRankings() {
  try {
    const [rows] = await pool.query(`
      SELECT m.id, m.name, m.description, m.image, COUNT(v.id) as votes
      FROM models m
      LEFT JOIN votes v ON m.id = v.model_id
      GROUP BY m.id
      ORDER BY votes DESC, m.name ASC
    `)
    return rows
  } catch (error) {
    console.error("Error in getRankings:", error)
    throw error
  }
}

// Get final results with rankings
async function getResults() {
  try {
    const [rows] = await pool.query(`
      SELECT m.id, m.name, m.description, m.image, COUNT(v.id) as votes
      FROM models m
      LEFT JOIN votes v ON m.id = v.model_id
      GROUP BY m.id
      ORDER BY votes DESC, m.name ASC
    `)

    // Add rank and title information
    return rows.map((model, index) => ({
      ...model,
      rank: index + 1,
      title: index === 0 ? "Winner" : index === 1 ? "1st Runner-up" : index === 2 ? "2nd Runner-up" : "",
    }))
  } catch (error) {
    console.error("Error in getResults:", error)
    throw error
  }
}

// Check if user has already voted today
async function hasVotedToday(email) {
  try {
    const [rows] = await pool.query(
      "SELECT COUNT(*) as count FROM votes WHERE email = ? AND DATE(created_at) = CURDATE()",
      [email],
    )
    return rows[0].count > 0
  } catch (error) {
    console.error("Error in hasVotedToday:", error)
    throw error
  }
}

// Submit a vote
async function submitVote(modelId, email) {
  try {
    const [result] = await pool.query("INSERT INTO votes (model_id, email, created_at) VALUES (?, ?, NOW())", [
      modelId,
      email,
    ])
    return { id: result.insertId, modelId, email }
  } catch (error) {
    console.error("Error in submitVote:", error)
    throw error
  }
}

// Get vote statistics
async function getVoteStats() {
  try {
    const [totalVotes] = await pool.query("SELECT COUNT(*) as count FROM votes")
    const [todayVotes] = await pool.query("SELECT COUNT(*) as count FROM votes WHERE DATE(created_at) = CURDATE()")
    const [uniqueVoters] = await pool.query("SELECT COUNT(DISTINCT email) as count FROM votes")

    return {
      totalVotes: totalVotes[0].count,
      todayVotes: todayVotes[0].count,
      uniqueVoters: uniqueVoters[0].count,
    }
  } catch (error) {
    console.error("Error in getVoteStats:", error)
    throw error
  }
}

export { getRankings, getResults, hasVotedToday, submitVote, getVoteStats }

