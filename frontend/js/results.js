import { Chart } from "@/components/ui/chart"
// DOM Elements
const firstPlace = document.getElementById("first-place")
const secondPlace = document.getElementById("second-place")
const thirdPlace = document.getElementById("third-place")
const resultsTableBody = document.getElementById("results-table-body")
const resultsChart = document.getElementById("results-chart")

// State
let results = []
let chart = null

// Fetch results from API
async function fetchResults() {
  try {
    const response = await fetch("/api/results")
    if (!response.ok) {
      throw new Error("Failed to fetch results")
    }
    results = await response.json()
    renderResults()
    renderChart()
  } catch (error) {
    console.error("Error fetching results:", error)
    resultsTableBody.innerHTML = `
      <tr>
        <td colspan="4" class="error-cell">
          Failed to load results. Please try again later.
          <button class="btn btn-primary" onclick="fetchResults()">Retry</button>
        </td>
      </tr>
    `
  }
}

// Render podium winners
function renderPodium() {
  if (results.length === 0) {
    return
  }

  // Sort by votes
  const sortedResults = [...results].sort((a, b) => b.votes - a.votes)

  // First place
  if (sortedResults.length >= 1) {
    const winner = sortedResults[0]
    firstPlace.querySelector("img").src = winner.image || "/placeholder.svg?height=150&width=150"
    firstPlace.querySelector("h3").textContent = winner.name
    firstPlace.querySelector(".votes").textContent = `${winner.votes} votes`
  }

  // Second place
  if (sortedResults.length >= 2) {
    const runnerUp = sortedResults[1]
    secondPlace.querySelector("img").src = runnerUp.image || "/placeholder.svg?height=120&width=120"
    secondPlace.querySelector("h3").textContent = runnerUp.name
    secondPlace.querySelector(".votes").textContent = `${runnerUp.votes} votes`
  } else {
    secondPlace.style.visibility = "hidden"
  }

  // Third place
  if (sortedResults.length >= 3) {
    const third = sortedResults[2]
    thirdPlace.querySelector("img").src = third.image || "/placeholder.svg?height=100&width=100"
    thirdPlace.querySelector("h3").textContent = third.name
    thirdPlace.querySelector(".votes").textContent = `${third.votes} votes`
  } else {
    thirdPlace.style.visibility = "hidden"
  }
}

// Render results table
function renderResultsTable() {
  if (results.length === 0) {
    resultsTableBody.innerHTML = '<tr><td colspan="4">No results available.</td></tr>'
    return
  }

  // Sort by votes
  const sortedResults = [...results].sort((a, b) => b.votes - a.votes)

  // Calculate total votes
  const totalVotes = sortedResults.reduce((sum, model) => sum + model.votes, 0)

  // Generate table rows
  resultsTableBody.innerHTML = sortedResults
    .map((model, index) => {
      const percentage = totalVotes > 0 ? ((model.votes / totalVotes) * 100).toFixed(2) : "0.00"
      return `
      <tr>
        <td>${index + 1}</td>
        <td>
          <div class="ranking-model">
            <img src="${model.image || "/placeholder.svg?height=40&width=40"}" alt="${model.name}" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 10px;">
            ${model.name}
          </div>
        </td>
        <td>${model.votes}</td>
        <td>${percentage}%</td>
      </tr>
    `
    })
    .join("")
}

// Render chart
function renderChart() {
  if (results.length === 0) {
    return
  }

  // Sort by votes
  const sortedResults = [...results].sort((a, b) => b.votes - a.votes)

  // Take top 10 for chart
  const topResults = sortedResults.slice(0, 10)

  // Prepare data for chart
  const labels = topResults.map((model) => model.name)
  const data = topResults.map((model) => model.votes)
  const backgroundColors = [
    "#2c6bed",
    "#6c5ce7",
    "#fd79a8",
    "#00b894",
    "#fdcb6e",
    "#e17055",
    "#0984e3",
    "#badc58",
    "#c7ecee",
    "#dff9fb",
  ]

  // Destroy previous chart if exists
  if (chart) {
    chart.destroy()
  }

  // Create new chart
  const ctx = resultsChart.getContext("2d")
  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Votes",
          data: data,
          backgroundColor: backgroundColors.slice(0, topResults.length),
          borderColor: "rgba(0, 0, 0, 0.1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.dataset.label}: ${context.raw}`,
          },
        },
      },
    },
  })
}

// Render all results
function renderResults() {
  renderPodium()
  renderResultsTable()
}

// Event Listeners
document.addEventListener("DOMContentLoaded", fetchResults)

