// DOM Elements
const modelsContainer = document.getElementById("models-container")
const voteModal = document.getElementById("vote-modal")
const closeButton = document.querySelector(".close-button")
const voteForm = document.getElementById("vote-form")
const modalModelImage = document.getElementById("modal-model-image")
const modalModelName = document.getElementById("modal-model-name")
const voterEmail = document.getElementById("voter-email")

// State
let models = []
let selectedModel = null

// Fetch models from API
async function fetchModels() {
  try {
    const response = await fetch("/api/models")
    if (!response.ok) {
      throw new Error("Failed to fetch models")
    }
    models = await response.json()
    renderModels()
  } catch (error) {
    console.error("Error fetching models:", error)
    modelsContainer.innerHTML = `
      <div class="error-message">
        <p>Failed to load models. Please try again later.</p>
        <button class="btn btn-primary" onclick="fetchModels()">Retry</button>
      </div>
    `
  }
}

// Render models to the page
function renderModels() {
  if (models.length === 0) {
    modelsContainer.innerHTML = '<p class="no-models">No models available at the moment.</p>'
    return
  }

  modelsContainer.innerHTML = models
    .map(
      (model) => `
    <div class="model-card">
      <img src="${model.image || "/placeholder.svg?height=300&width=250"}" alt="${model.name}" class="model-image">
      <div class="model-info">
        <h3>${model.name}</h3>
        <p>${model.description || "No description available."}</p>
        <button class="btn btn-primary btn-block" data-id="${model.id}">Vote</button>
      </div>
    </div>
  `,
    )
    .join("")

  // Add event listeners to vote buttons
  const voteButtons = document.querySelectorAll(".model-card .btn")
  voteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const modelId = button.getAttribute("data-id")
      openVoteModal(modelId)
    })
  })
}

// Open vote modal
function openVoteModal(modelId) {
  selectedModel = models.find((model) => model.id == modelId)

  if (selectedModel) {
    modalModelImage.src = selectedModel.image || "/placeholder.svg?height=150&width=150"
    modalModelName.textContent = selectedModel.name

    // Check if user has already voted today
    const lastVote = localStorage.getItem("lastVote")
    const today = new Date().toDateString()

    if (lastVote === today) {
      alert("You have already voted today. Please come back tomorrow!")
      return
    }

    // Show modal
    voteModal.classList.add("active")
  }
}

// Close vote modal
function closeVoteModal() {
  voteModal.classList.remove("active")
  voteForm.reset()
}

// Submit vote
async function submitVote(event) {
  event.preventDefault()

  if (!selectedModel) {
    alert("Please select a model to vote for.")
    return
  }

  const email = voterEmail.value.trim()
  if (!email) {
    alert("Please enter your email address.")
    return
  }

  try {
    const response = await fetch("/api/vote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        modelId: selectedModel.id,
        email: email,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Failed to submit vote")
    }

    // Save vote timestamp to localStorage
    localStorage.setItem("lastVote", new Date().toDateString())

    // Show success message
    alert("Thank you for your vote!")
    closeVoteModal()
  } catch (error) {
    console.error("Error submitting vote:", error)
    alert(error.message || "Failed to submit your vote. Please try again.")
  }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", fetchModels)
closeButton.addEventListener("click", closeVoteModal)
voteForm.addEventListener("submit", submitVote)

// Close modal when clicking outside
window.addEventListener("click", (event) => {
  if (event.target === voteModal) {
    closeVoteModal()
  }
})

