// DOM Elements - Navigation
const navLinks = document.querySelectorAll(".admin-nav a")
const sections = document.querySelectorAll(".admin-section")
const adminUsername = document.getElementById("admin-username")
const logoutBtn = document.getElementById("logout-btn")

// DOM Elements - Models Section
const modelsTableBody = document.getElementById("models-table-body")
const addModelBtn = document.getElementById("add-model-btn")
const searchModelsInput = document.getElementById("search-models")
const sortModelsSelect = document.getElementById("sort-models")

// DOM Elements - Votes Section
const votesTableBody = document.getElementById("votes-table-body")
const totalVotesElement = document.getElementById("total-votes")
const todayVotesElement = document.getElementById("today-votes")
const uniqueVotersElement = document.getElementById("unique-voters")
const dateFromInput = document.getElementById("date-from")
const dateToInput = document.getElementById("date-to")
const filterVotesBtn = document.getElementById("filter-votes-btn")

// DOM Elements - Settings Section
const settingsForm = document.getElementById("settings-form")

// DOM Elements - Modals
const modelModal = document.getElementById("model-modal")
const modelForm = document.getElementById("model-form")
const modelModalTitle = document.getElementById("model-modal-title")
const modelIdInput = document.getElementById("model-id")
const modelNameInput = document.getElementById("model-name")
const modelCodeInput = document.getElementById("model-code")
const modelTeamInput = document.getElementById("model-team")
const modelDescriptionInput = document.getElementById("model-description")
const modelImageInput = document.getElementById("model-image")
const imagePreview = document.getElementById("image-preview").querySelector("img")
const cancelModelBtn = document.getElementById("cancel-model-btn")
const closeModelBtn = document.querySelector("#model-modal .close-button")

const confirmModal = document.getElementById("confirm-modal")
const confirmMessage = document.getElementById("confirm-message")
const confirmDeleteBtn = document.getElementById("confirm-delete-btn")
const cancelDeleteBtn = document.getElementById("cancel-delete-btn")

// State
let models = []
let votes = []
let settings = {}
let deleteItemId = null
let deleteItemType = null
let imageFile = null

// Check authentication
function checkAuth() {
  const token = localStorage.getItem("adminToken")
  if (!token) {
    window.location.href = "login.html"
    return false
  }

  // Display username
  const username = localStorage.getItem("adminUsername")
  if (username) {
    adminUsername.textContent = username
  }

  return true
}

// API request helper with authentication
async function apiRequest(url, options = {}) {
  const token = localStorage.getItem("adminToken")

  const headers = {
    Authorization: `Bearer ${token}`,
    ...options.headers,
  }

  if (options.method && options.method !== "GET" && !options.headers?.["Content-Type"] && !options.formData) {
    headers["Content-Type"] = "application/json"
  }

  const requestOptions = {
    ...options,
    headers,
  }

  const response = await fetch(url, requestOptions)

  if (response.status === 401) {
    // Unauthorized - clear token and redirect to login
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminUsername")
    window.location.href = "login.html"
    throw new Error("Session expired. Please login again.")
  }

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "API request failed")
  }

  return data
}

// Fetch models
async function fetchModels() {
  try {
    models = await apiRequest("/api/admin/models")
    renderModelsTable()
  } catch (error) {
    console.error("Error fetching models:", error)
    modelsTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="error-cell">
          Failed to load models: ${error.message}
          <button class="btn btn-primary btn-sm" onclick="fetchModels()">Retry</button>
        </td>
      </tr>
    `
  }
}

// Render models table
function renderModelsTable() {
  if (models.length === 0) {
    modelsTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-cell">No models found. Add your first model!</td>
      </tr>
    `
    return
  }

  // Apply search filter
  const searchTerm = searchModelsInput.value.toLowerCase().trim()
  let filteredModels = models

  if (searchTerm) {
    filteredModels = models.filter(
      (model) =>
        model.name.toLowerCase().includes(searchTerm) || (model.team && model.team.toLowerCase().includes(searchTerm)),
    )
  }

  // Apply sorting
  const sortOption = sortModelsSelect.value

  switch (sortOption) {
    case "name-asc":
      filteredModels.sort((a, b) => a.name.localeCompare(b.name))
      break
    case "name-desc":
      filteredModels.sort((a, b) => b.name.localeCompare(a.name))
      break
    case "id-asc":
      filteredModels.sort((a, b) => a.id - b.id)
      break
    case "id-desc":
      filteredModels.sort((a, b) => b.id - a.id)
      break
    case "votes-desc":
      filteredModels.sort((a, b) => b.votes - a.votes)
      break
    case "votes-asc":
      filteredModels.sort((a, b) => a.votes - b.votes)
      break
  }

  // Generate table rows
  modelsTableBody.innerHTML = filteredModels
    .map(
      (model) => `
    <tr>
      <td>${model.id}</td>
      <td>
        <img src="${model.image || "/placeholder.svg?height=50&width=50"}" alt="${model.name}" class="model-image">
      </td>
      <td>${model.name}</td>
      <td>${model.code || "-"}</td>
      <td>${model.team || "-"}</td>
      <td>${model.votes || 0}</td>
      <td>
        <div class="action-buttons">
          <button class="action-btn edit-btn" data-id="${model.id}" title="Edit">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="action-btn delete-btn" data-id="${model.id}" title="Delete">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  `,
    )
    .join("")

  // Add event listeners to action buttons
  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", () => editModel(button.dataset.id))
  })

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", () => showDeleteConfirmation("model", button.dataset.id))
  })
}

// Fetch votes
async function fetchVotes() {
  try {
    votes = await apiRequest("/api/admin/votes")
    renderVotesTable()

    // Update stats
    const stats = await apiRequest("/api/admin/stats")
    totalVotesElement.textContent = stats.totalVotes
    todayVotesElement.textContent = stats.todayVotes
    uniqueVotersElement.textContent = stats.uniqueVoters
  } catch (error) {
    console.error("Error fetching votes:", error)
    votesTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="error-cell">
          Failed to load votes: ${error.message}
          <button class="btn btn-primary btn-sm" onclick="fetchVotes()">Retry</button>
        </td>
      </tr>
    `
  }
}

// Render votes table
function renderVotesTable() {
  if (votes.length === 0) {
    votesTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-cell">No votes found.</td>
      </tr>
    `
    return
  }

  // Generate table rows
  votesTableBody.innerHTML = votes
    .map((vote) => {
      const date = new Date(vote.created_at)
      const formattedDate = date.toLocaleDateString()
      const formattedTime = date.toLocaleTimeString()

      return `
      <tr>
        <td>${vote.id}</td>
        <td>${vote.model_name}</td>
        <td>${vote.email}</td>
        <td>${formattedDate}</td>
        <td>${formattedTime}</td>
        <td>
          <div class="action-buttons">
            <button class="action-btn delete-btn" data-id="${vote.id}" title="Delete">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `
    })
    .join("")

  // Add event listeners to delete buttons
  document.querySelectorAll("#votes-table-body .delete-btn").forEach((button) => {
    button.addEventListener("click", () => showDeleteConfirmation("vote", button.dataset.id))
  })
}

// Fetch settings
async function fetchSettings() {
  try {
    settings = await apiRequest("/api/admin/settings")

    // Populate settings form
    document.getElementById("contest-name").value = settings.contestName || ""
    document.getElementById("voting-enabled").checked = settings.votingEnabled !== false
    document.getElementById("results-public").checked = settings.resultsPublic !== false
    document.getElementById("votes-per-day").value = settings.votesPerDay || 1
  } catch (error) {
    console.error("Error fetching settings:", error)
    alert(`Failed to load settings: ${error.message}`)
  }
}

// Show model modal for adding/editing
function showModelModal(isEdit = false) {
  modelModalTitle.textContent = isEdit ? "Edit Model" : "Add New Model"
  modelModal.classList.add("active")
}

// Close model modal
function closeModelModal() {
  modelModal.classList.remove("active")
  modelForm.reset()
  modelIdInput.value = ""
  imagePreview.src = "/placeholder.svg?height=200&width=200"
  imageFile = null
}

// Edit model
async function editModel(id) {
  try {
    const model = await apiRequest(`/api/admin/models/${id}`)

    // Populate form
    modelIdInput.value = model.id
    modelNameInput.value = model.name
    modelCodeInput.value = model.code || ""
    modelTeamInput.value = model.team || ""
    modelDescriptionInput.value = model.description || ""

    if (model.image) {
      imagePreview.src = model.image
    } else {
      imagePreview.src = "/placeholder.svg?height=200&width=200"
    }

    showModelModal(true)
  } catch (error) {
    console.error("Error fetching model details:", error)
    alert(`Failed to load model details: ${error.message}`)
  }
}

// Show delete confirmation
function showDeleteConfirmation(type, id) {
  deleteItemType = type
  deleteItemId = id

  if (type === "model") {
    const model = models.find((m) => m.id == id)
    confirmMessage.textContent = `Are you sure you want to delete the model "${model.name}"? This action cannot be undone.`
  } else if (type === "vote") {
    confirmMessage.textContent = `Are you sure you want to delete this vote? This action cannot be undone.`
  }

  confirmModal.classList.add("active")
}

// Close confirmation modal
function closeConfirmModal() {
  confirmModal.classList.remove("active")
  deleteItemId = null
  deleteItemType = null
}

// Delete item
async function deleteItem() {
  if (!deleteItemId || !deleteItemType) return

  try {
    if (deleteItemType === "model") {
      await apiRequest(`/api/admin/models/${deleteItemId}`, { method: "DELETE" })
      await fetchModels()
    } else if (deleteItemType === "vote") {
      await apiRequest(`/api/admin/votes/${deleteItemId}`, { method: "DELETE" })
      await fetchVotes()
    }

    closeConfirmModal()
  } catch (error) {
    console.error(`Error deleting ${deleteItemType}:`, error)
    alert(`Failed to delete ${deleteItemType}: ${error.message}`)
  }
}

// Save model
async function saveModel(event) {
  event.preventDefault()

  const formData = new FormData()
  formData.append("name", modelNameInput.value)
  formData.append("code", modelCodeInput.value)
  formData.append("team", modelTeamInput.value)
  formData.append("description", modelDescriptionInput.value)

  if (imageFile) {
    formData.append("image", imageFile)
  }

  const isEdit = !!modelIdInput.value
  const url = isEdit ? `/api/admin/models/${modelIdInput.value}` : "/api/admin/models"
  const method = isEdit ? "PUT" : "POST"

  try {
    await apiRequest(url, {
      method,
      body: formData,
      formData: true, // Skip Content-Type header for FormData
    })

    closeModelModal()
    await fetchModels()
  } catch (error) {
    console.error("Error saving model:", error)
    alert(`Failed to save model: ${error.message}`)
  }
}

// Save settings
async function saveSettings(event) {
  event.preventDefault()

  const updatedSettings = {
    contestName: document.getElementById("contest-name").value,
    votingEnabled: document.getElementById("voting-enabled").checked,
    resultsPublic: document.getElementById("results-public").checked,
    votesPerDay: Number.parseInt(document.getElementById("votes-per-day").value) || 1,
  }

  try {
    await apiRequest("/api/admin/settings", {
      method: "PUT",
      body: JSON.stringify(updatedSettings),
    })

    alert("Settings saved successfully!")
  } catch (error) {
    console.error("Error saving settings:", error)
    alert(`Failed to save settings: ${error.message}`)
  }
}

// Filter votes by date
async function filterVotesByDate() {
  const dateFrom = dateFromInput.value
  const dateTo = dateToInput.value

  if (!dateFrom && !dateTo) {
    return fetchVotes()
  }

  try {
    const params = new URLSearchParams()
    if (dateFrom) params.append("from", dateFrom)
    if (dateTo) params.append("to", dateTo)

    votes = await apiRequest(`/api/admin/votes?${params.toString()}`)
    renderVotesTable()
  } catch (error) {
    console.error("Error filtering votes:", error)
    alert(`Failed to filter votes: ${error.message}`)
  }
}

// Handle image upload
function handleImageUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  imageFile = file

  // Preview image
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.src = e.target.result
  }
  reader.readAsDataURL(file)
}

// Logout
function logout() {
  localStorage.removeItem("adminToken")
  localStorage.removeItem("adminUsername")
  window.location.href = "login.html"
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  if (!checkAuth()) return

  // Fetch initial data
  fetchModels()
  fetchVotes()
  fetchSettings()

  // Set up navigation
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()

      // Update active link
      navLinks.forEach((l) => l.classList.remove("active"))
      this.classList.add("active")

      // Show corresponding section
      const sectionId = this.dataset.section + "-section"
      sections.forEach((section) => {
        section.classList.remove("active")
        if (section.id === sectionId) {
          section.classList.add("active")
        }
      })
    })
  })

  // Event listeners - Models
  addModelBtn.addEventListener("click", () => showModelModal(false))
  searchModelsInput.addEventListener("input", renderModelsTable)
  sortModelsSelect.addEventListener("change", renderModelsTable)

  // Event listeners - Votes
  filterVotesBtn.addEventListener("click", filterVotesByDate)

  // Event listeners - Forms
  modelForm.addEventListener("submit", saveModel)
  settingsForm.addEventListener("submit", saveSettings)

  // Event listeners - Modals
  closeModelBtn.addEventListener("click", closeModelModal)
  cancelModelBtn.addEventListener("click", closeModelModal)
  confirmDeleteBtn.addEventListener("click", deleteItem)
  cancelDeleteBtn.addEventListener("click", closeConfirmModal)

  // Event listeners - Image upload
  modelImageInput.addEventListener("change", handleImageUpload)

  // Event listeners - Logout
  logoutBtn.addEventListener("click", logout)

  // Close modals when clicking outside
  window.addEventListener("click", (event) => {
    if (event.target === modelModal) {
      closeModelModal()
    }
    if (event.target === confirmModal) {
      closeConfirmModal()
    }
  })
})

