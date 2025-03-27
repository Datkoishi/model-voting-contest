// Remove the problematic import
// import {
//   Chart,
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
//   ChartLegend,
//   ChartLegendContent,
//   ChartStyle
// } from "@/components/ui/chart"

// Define a simple Chart class to avoid errors
class Chart {
    constructor(ctx, config) {
      this.ctx = ctx
      this.config = config
      this.render()
    }
  
    render() {
      console.log("Rendering chart with config:", this.config)
      // Basic rendering
      if (this.ctx) {
        this.ctx.fillStyle = "#333"
        this.ctx.font = "14px Arial"
        this.ctx.fillText("Chart Placeholder", 50, 50)
      }
    }
  
    destroy() {
      console.log("Destroying chart")
      // Clear the canvas
      if (this.ctx && this.ctx.canvas) {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
      }
    }
  }
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
  
  // DOM Elements - Rankings Section
  const rankingsTableBody = document.getElementById("rankings-table-body")
  const searchRankingsInput = document.getElementById("search-rankings")
  const sortRankingsSelect = document.getElementById("sort-rankings")
  
  // DOM Elements - Results Section
  const firstPlace = document.getElementById("first-place")
  const secondPlace = document.getElementById("second-place")
  const thirdPlace = document.getElementById("third-place")
  const resultsTableBody = document.getElementById("results-table-body")
  const resultsChart = document.getElementById("results-chart")
  
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
  const imagePreview = document.getElementById("image-preview")?.querySelector("img")
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
  let chart = null
  
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
  
    try {
      const response = await fetch(url, requestOptions)
  
      if (response.status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem("adminToken")
        localStorage.removeItem("adminUsername")
        window.location.href = "login.html"
        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
      }
  
      const data = await response.json()
  
      if (!response.ok) {
        throw new Error(data.message || "Yêu cầu API thất bại")
      }
  
      return data
    } catch (error) {
      console.error("Lỗi yêu cầu API:", error)
      throw error
    }
  }
  
  // Fetch models
  async function fetchModels() {
    try {
      models = await apiRequest("/api/admin/models")
      renderModelsTable()
    } catch (error) {
      console.error("Lỗi khi tải danh sách người mẫu:", error)
      if (modelsTableBody) {
        modelsTableBody.innerHTML = `
          <tr>
            <td colspan="7" class="error-cell">
              Không thể tải danh sách người mẫu: ${error.message}
              <button class="btn btn-primary btn-sm" onclick="fetchModels()">Thử lại</button>
            </td>
          </tr>
        `
      }
    }
  }
  
  // Render models table
  function renderModelsTable() {
    if (!modelsTableBody) return
  
    if (models.length === 0) {
      modelsTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-cell">Không tìm thấy người mẫu nào. Hãy thêm người mẫu đầu tiên!</td>
        </tr>
      `
      return
    }
  
    // Apply search filter
    const searchTerm = searchModelsInput ? searchModelsInput.value.toLowerCase().trim() : ""
    let filteredModels = models
  
    if (searchTerm) {
      filteredModels = models.filter(
        (model) =>
          model.name.toLowerCase().includes(searchTerm) || (model.team && model.team.toLowerCase().includes(searchTerm)),
      )
    }
  
    // Apply sorting
    const sortOption = sortModelsSelect ? sortModelsSelect.value : "name-asc"
  
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
            <button class="action-btn edit-btn" data-id="${model.id}" title="Sửa">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="action-btn delete-btn" data-id="${model.id}" title="Xóa">
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
      const stats = await apiRequest("/api/stats")
      if (totalVotesElement) totalVotesElement.textContent = stats.totalVotes
      if (todayVotesElement) todayVotesElement.textContent = stats.todayVotes
      if (uniqueVotersElement) uniqueVotersElement.textContent = stats.uniqueVoters
    } catch (error) {
      console.error("Lỗi khi tải danh sách bình chọn:", error)
      if (votesTableBody) {
        votesTableBody.innerHTML = `
          <tr>
            <td colspan="6" class="error-cell">
              Không thể tải danh sách bình chọn: ${error.message}
              <button class="btn btn-primary btn-sm" onclick="fetchVotes()">Thử lại</button>
            </td>
          </tr>
        `
      }
    }
  }
  
  // Render votes table
  function renderVotesTable() {
    if (!votesTableBody) return
  
    if (votes.length === 0) {
      votesTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="empty-cell">Không tìm thấy bình chọn nào.</td>
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
              <button class="action-btn delete-btn" data-id="${vote.id}" title="Xóa">
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
  
  // Fetch rankings
  async function fetchRankings() {
    try {
      const rankings = await apiRequest("/api/rankings")
      renderRankingsTable(rankings)
    } catch (error) {
      console.error("Lỗi khi tải bảng xếp hạng:", error)
      if (rankingsTableBody) {
        rankingsTableBody.innerHTML = `
          <tr>
            <td colspan="6" class="error-cell">
              Không thể tải bảng xếp hạng: ${error.message}
              <button class="btn btn-primary btn-sm" onclick="fetchRankings()">Thử lại</button>
            </td>
          </tr>
        `
      }
    }
  }
  
  // Render rankings table
  function renderRankingsTable(rankings) {
    if (!rankingsTableBody) return
  
    if (!rankings || rankings.length === 0) {
      rankingsTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="empty-cell">Không tìm thấy người mẫu nào.</td>
        </tr>
      `
      return
    }
  
    // Apply search filter
    const searchTerm = searchRankingsInput ? searchRankingsInput.value.toLowerCase().trim() : ""
    let filteredRankings = rankings
  
    if (searchTerm) {
      filteredRankings = rankings.filter(
        (model) =>
          model.name.toLowerCase().includes(searchTerm) || (model.team && model.team.toLowerCase().includes(searchTerm)),
      )
    }
  
    // Apply sorting
    const sortOption = sortRankingsSelect ? sortRankingsSelect.value : "votes-desc"
  
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
  
    // Generate table rows
    rankingsTableBody.innerHTML = filteredRankings
      .map(
        (model, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>
          <img src="${model.image || "/placeholder.svg?height=50&width=50"}" alt="${model.name}" class="model-image">
        </td>
        <td>${model.name}</td>
        <td>${model.code || "-"}</td>
        <td>${model.team || "-"}</td>
        <td>${model.votes || 0}</td>
      </tr>
    `,
      )
      .join("")
  }
  
  // Fetch results
  async function fetchResults() {
    try {
      const results = await apiRequest("/api/results")
      renderPodium(results)
      renderResultsTable(results)
      renderResultsChart(results)
    } catch (error) {
      console.error("Lỗi khi tải kết quả:", error)
      if (resultsTableBody) {
        resultsTableBody.innerHTML = `
          <tr>
            <td colspan="4" class="error-cell">
              Không thể tải kết quả: ${error.message}
              <button class="btn btn-primary btn-sm" onclick="fetchResults()">Thử lại</button>
            </td>
          </tr>
        `
      }
    }
  }
  
  // Render podium winners
  function renderPodium(results) {
    if (!firstPlace || !secondPlace || !thirdPlace || !results || results.length === 0) {
      return
    }
  
    // Sort by votes
    const sortedResults = [...results].sort((a, b) => b.votes - a.votes)
  
    // First place
    if (sortedResults.length >= 1) {
      const winner = sortedResults[0]
      firstPlace.querySelector("img").src = winner.image || "/placeholder.svg?height=150&width=150"
      firstPlace.querySelector("h3").textContent = winner.name
      firstPlace.querySelector(".votes").textContent = `${winner.votes} phiếu`
    }
  
    // Second place
    if (sortedResults.length >= 2) {
      const runnerUp = sortedResults[1]
      secondPlace.querySelector("img").src = runnerUp.image || "/placeholder.svg?height=120&width=120"
      secondPlace.querySelector("h3").textContent = runnerUp.name
      secondPlace.querySelector(".votes").textContent = `${runnerUp.votes} phiếu`
      secondPlace.style.visibility = "visible"
    } else {
      secondPlace.style.visibility = "hidden"
    }
  
    // Third place
    if (sortedResults.length >= 3) {
      const third = sortedResults[2]
      thirdPlace.querySelector("img").src = third.image || "/placeholder.svg?height=100&width=100"
      thirdPlace.querySelector("h3").textContent = third.name
      thirdPlace.querySelector(".votes").textContent = `${third.votes} phiếu`
      thirdPlace.style.visibility = "visible"
    } else {
      thirdPlace.style.visibility = "hidden"
    }
  }
  
  // Render results table
  function renderResultsTable(results) {
    if (!resultsTableBody || !results || results.length === 0) {
      if (resultsTableBody) {
        resultsTableBody.innerHTML = '<tr><td colspan="4">Không có kết quả nào.</td></tr>'
      }
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
  function renderResultsChart(results) {
    if (!resultsChart || !results || results.length === 0) {
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
            label: "Phiếu bầu",
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
  
  // Fetch settings
  async function fetchSettings() {
    try {
      settings = await apiRequest("/api/admin/settings")
  
      // Populate settings form
      const contestNameInput = document.getElementById("contest-name")
      const votingEnabledInput = document.getElementById("voting-enabled")
      const resultsPublicInput = document.getElementById("results-public")
      const votesPerDayInput = document.getElementById("votes-per-day")
  
      if (contestNameInput) contestNameInput.value = settings.contestName || ""
      if (votingEnabledInput) votingEnabledInput.checked = settings.votingEnabled !== false
      if (resultsPublicInput) resultsPublicInput.checked = settings.resultsPublic !== false
      if (votesPerDayInput) votesPerDayInput.value = settings.votesPerDay || 1
    } catch (error) {
      console.error("Lỗi khi tải cài đặt:", error)
      alert(`Không thể tải cài đặt: ${error.message}`)
    }
  }
  
  // Show model modal for adding/editing
  function showModelModal(isEdit = false) {
    if (!modelModal || !modelModalTitle) return
  
    modelModalTitle.textContent = isEdit ? "Chỉnh sửa người mẫu" : "Thêm người mẫu mới"
    modelModal.classList.add("active")
  }
  
  // Close model modal
  function closeModelModal() {
    if (!modelModal || !modelForm) return
  
    modelModal.classList.remove("active")
    modelForm.reset()
    if (modelIdInput) modelIdInput.value = ""
    if (imagePreview) imagePreview.src = "/placeholder.svg?height=200&width=200"
    imageFile = null
  }
  
  // Edit model
  async function editModel(id) {
    try {
      const model = await apiRequest(`/api/admin/models/${id}`)
  
      // Populate form
      if (modelIdInput) modelIdInput.value = model.id
      if (modelNameInput) modelNameInput.value = model.name
      if (modelCodeInput) modelCodeInput.value = model.code || ""
      if (modelTeamInput) modelTeamInput.value = model.team || ""
      if (modelDescriptionInput) modelDescriptionInput.value = model.description || ""
  
      if (imagePreview) {
        if (model.image) {
          imagePreview.src = model.image
        } else {
          imagePreview.src = "/placeholder.svg?height=200&width=200"
        }
      }
  
      showModelModal(true)
    } catch (error) {
      console.error("Lỗi khi tải thông tin người mẫu:", error)
      alert(`Không thể tải thông tin người mẫu: ${error.message}`)
    }
  }
  
  // Show delete confirmation
  function showDeleteConfirmation(type, id) {
    if (!confirmModal || !confirmMessage) return
  
    deleteItemType = type
    deleteItemId = id
  
    if (type === "model") {
      const model = models.find((m) => m.id == id)
      confirmMessage.textContent = `Bạn có chắc chắn muốn xóa người mẫu "${model.name}"? Hành động này không thể hoàn tác.`
    } else if (type === "vote") {
      confirmMessage.textContent = `Bạn có chắc chắn muốn xóa phiếu bầu này? Hành động này không thể hoàn tác.`
    }
  
    confirmModal.classList.add("active")
  }
  
  // Close confirmation modal
  function closeConfirmModal() {
    if (!confirmModal) return
  
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
        await fetchVotes()
        await fetchRankings()
        await fetchResults()
      } else if (deleteItemType === "vote") {
        await apiRequest(`/api/admin/votes/${deleteItemId}`, { method: "DELETE" })
        await fetchVotes()
        await fetchRankings()
        await fetchResults()
      }
  
      closeConfirmModal()
    } catch (error) {
      console.error(`Lỗi khi xóa ${deleteItemType === "model" ? "người mẫu" : "phiếu bầu"}:`, error)
      alert(`Không thể xóa ${deleteItemType === "model" ? "người mẫu" : "phiếu bầu"}: ${error.message}`)
    }
  }
  
  // Save model
  async function saveModel(event) {
    if (!event || !modelForm) return
  
    event.preventDefault()
  
    const formData = new FormData()
    if (modelNameInput) formData.append("name", modelNameInput.value)
    if (modelCodeInput) formData.append("code", modelCodeInput.value)
    if (modelTeamInput) formData.append("team", modelTeamInput.value)
    if (modelDescriptionInput) formData.append("description", modelDescriptionInput.value)
  
    if (imageFile) {
      formData.append("image", imageFile)
    }
  
    const isEdit = modelIdInput && !!modelIdInput.value
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
      await fetchRankings()
      await fetchResults()
    } catch (error) {
      console.error("Lỗi khi lưu người mẫu:", error)
      alert(`Không thể lưu người mẫu: ${error.message}`)
    }
  }
  
  // Save settings
  async function saveSettings(event) {
    if (!event || !settingsForm) return
  
    event.preventDefault()
  
    const contestNameInput = document.getElementById("contest-name")
    const votingEnabledInput = document.getElementById("voting-enabled")
    const resultsPublicInput = document.getElementById("results-public")
    const votesPerDayInput = document.getElementById("votes-per-day")
  
    const updatedSettings = {
      contestName: contestNameInput ? contestNameInput.value : "",
      votingEnabled: votingEnabledInput ? votingEnabledInput.checked : true,
      resultsPublic: resultsPublicInput ? resultsPublicInput.checked : true,
      votesPerDay: votesPerDayInput ? Number.parseInt(votesPerDayInput.value) || 1 : 1,
    }
  
    try {
      await apiRequest("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify(updatedSettings),
      })
  
      alert("Đã lưu cài đặt thành công!")
    } catch (error) {
      console.error("Lỗi khi lưu cài đặt:", error)
      alert(`Không thể lưu cài đặt: ${error.message}`)
    }
  }
  
  // Filter votes by date
  async function filterVotesByDate() {
    if (!dateFromInput || !dateToInput) return
  
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
      console.error("Lỗi khi lọc phiếu bầu:", error)
      alert(`Không thể lọc phiếu bầu: ${error.message}`)
    }
  }
  
  // Handle image upload
  function handleImageUpload(event) {
    if (!event || !event.target || !event.target.files || !event.target.files[0]) return
  
    const file = event.target.files[0]
    imageFile = file
  
    // Preview image
    if (imagePreview) {
      const reader = new FileReader()
      reader.onload = (e) => {
        imagePreview.src = e.target.result
      }
      reader.readAsDataURL(file)
    }
  }
  
  // Logout
  function logout() {
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminUsername")
    window.location.href = "login.html"
  }
  
  // Function to handle navigation
  function handleNavigation(sectionId) {
    console.log("Chuyển đến phần:", sectionId)
  
    // Hide all sections
    document.querySelectorAll(".admin-section").forEach((section) => {
      section.classList.remove("active")
    })
  
    // Show selected section
    const selectedSection = document.getElementById(sectionId + "-section")
    if (selectedSection) {
      selectedSection.classList.add("active")
      console.log("Đã kích hoạt phần:", sectionId)
    } else {
      console.error("Không tìm thấy phần:", sectionId + "-section")
    }
  
    // Update active nav link
    document.querySelectorAll(".admin-nav a").forEach((link) => {
      link.classList.remove("active")
      if (link.dataset.section === sectionId) {
        link.classList.add("active")
      }
    })
  }
  
  // Initialize
  document.addEventListener("DOMContentLoaded", () => {
    console.log("Đang khởi tạo bảng điều khiển quản trị...")
  
    if (!checkAuth()) return
  
    // Fetch initial data
    fetchModels()
    fetchVotes()
    fetchRankings()
    fetchResults()
    fetchSettings()
  
    // Set up navigation - make this more robust
    const navLinks = document.querySelectorAll(".admin-nav a")
    if (navLinks && navLinks.length > 0) {
      console.log("Thiết lập điều hướng với", navLinks.length, "liên kết")
  
      navLinks.forEach((link) => {
        link.addEventListener("click", function (e) {
          e.preventDefault()
          const sectionId = this.dataset.section
          console.log("Đã nhấp vào điều hướng:", sectionId)
  
          if (sectionId) {
            handleNavigation(sectionId)
          } else {
            console.error("Liên kết không có thuộc tính data-section")
          }
        })
      })
    } else {
      console.warn("Không tìm thấy liên kết điều hướng")
    }
  
    // Event listeners - Models
    if (addModelBtn) {
      addModelBtn.addEventListener("click", () => showModelModal(false))
    }
    if (searchModelsInput) {
      searchModelsInput.addEventListener("input", renderModelsTable)
    }
    if (sortModelsSelect) {
      sortModelsSelect.addEventListener("change", renderModelsTable)
    }
  
    // Event listeners - Rankings
    if (searchRankingsInput) {
      searchRankingsInput.addEventListener("input", () => {
        if (searchRankingsInput && sortRankingsSelect) {
          fetchRankings()
        }
      })
    }
    if (sortRankingsSelect) {
      sortRankingsSelect.addEventListener("change", () => {
        if (searchRankingsInput && sortRankingsSelect) {
          fetchRankings()
        }
      })
    }
  
    // Event listeners - Votes
    if (filterVotesBtn) {
      filterVotesBtn.addEventListener("click", filterVotesByDate)
    }
  
    // Event listeners - Forms
    if (modelForm) {
      modelForm.addEventListener("submit", saveModel)
    }
    if (settingsForm) {
      settingsForm.addEventListener("submit", saveSettings)
    }
  
    // Event listeners - Modals
    if (closeModelBtn) {
      closeModelBtn.addEventListener("click", closeModelModal)
    }
    if (cancelModelBtn) {
      cancelModelBtn.addEventListener("click", closeModelModal)
    }
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener("click", deleteItem)
    }
    if (cancelDeleteBtn) {
      cancelDeleteBtn.addEventListener("click", closeConfirmModal)
    }
  
    // Event listeners - Image upload
    if (modelImageInput) {
      modelImageInput.addEventListener("change", handleImageUpload)
    }
  
    // Event listeners - Logout
    if (logoutBtn) {
      logoutBtn.addEventListener("click", logout)
    }
  
    // Close modals when clicking outside
    window.addEventListener("click", (event) => {
      if (modelModal && event.target === modelModal) {
        closeModelModal()
      }
      if (confirmModal && event.target === confirmModal) {
        closeConfirmModal()
      }
    })
  
    console.log("Khởi tạo bảng điều khiển quản trị hoàn tất")
  })
  
  