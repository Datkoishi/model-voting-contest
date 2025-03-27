// DOM Elements
const rankingList = document.getElementById("ranking-list")
const searchInput = document.getElementById("search-ranking")
const sortSelect = document.getElementById("sort-by")

// State
let rankings = []
let filteredRankings = []

// Fetch rankings from API
async function fetchRankings() {
  try {
    const response = await fetch("/api/rankings")
    if (!response.ok) {
      throw new Error("Failed to fetch rankings")
    }
    rankings = await response.json()
    filteredRankings = [...rankings]
    applyFiltersAndSort()
  } catch (error) {
    console.error("Error fetching rankings:", error)
    rankingList.innerHTML = `
      <div class="error-message">
        <p>Failed to load rankings. Please try again later.</p>
        <button class="btn btn-primary" onclick="fetchRankings()">Retry</button>
      </div>
    `
  }
}

// Render rankings to the page
function renderRankings() {
  if (filteredRankings.length === 0) {
    rankingList.innerHTML = '<p class="no-rankings">No models found matching your search.</p>'
    return
  }

  rankingList.innerHTML = filteredRankings
    .map(
      (model, index) => `
    <div class="ranking-item">
      <div class="ranking-position">${index + 1}</div>
      <div class="ranking-model">
        <img src="${model.image || "/placeholder.svg?height=60&width=60"}" alt="${model.name}">
        <div class="ranking-model-info">
          <h3>${model.name}</h3>
          <p>${model.description || "No description available."}</p>
        </div>
      </div>
      <div class="ranking-votes">${model.votes} votes</div>
    </div>
  `,
    )
    .join("")
}

// Apply filters and sort
function applyFiltersAndSort() {
  const searchTerm = searchInput.value.toLowerCase().trim()
  const sortOption = sortSelect.value

  // Filter by search term
  filteredRankings = rankings.filter((model) => model.name.toLowerCase().includes(searchTerm))

  // Sort rankings
  switch (sortOption) {
    case "votes-desc":
      filteredRankings.sort((a, b) => b.votes - a.votes)
      break
    case "votes-asc":
      filteredRankings.sort((a, b) => a.votes - b.votes)
      break
    case "name-asc":
      filteredRankings.sort((a, b) => a.name.localeCompare(b.name))
      break
    case "name-desc":
      filteredRankings.sort((a, b) => b.name.localeCompare(a.name))
      break
  }

  renderRankings()
}

// Event Listeners
document.addEventListener("DOMContentLoaded", fetchRankings)
searchInput.addEventListener("input", applyFiltersAndSort)
sortSelect.addEventListener("change", applyFiltersAndSort)

// Auto-refresh rankings every minute
setInterval(fetchRankings, 60000)

