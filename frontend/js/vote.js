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
      throw new Error("Không thể tải danh sách người mẫu")
    }
    models = await response.json()
    renderModels()
  } catch (error) {
    console.error("Lỗi khi tải danh sách người mẫu:", error)
    modelsContainer.innerHTML = `
      <div class="error-message">
        <p>Không thể tải danh sách người mẫu. Vui lòng thử lại sau.</p>
        <button class="btn btn-primary" onclick="fetchModels()">Thử lại</button>
      </div>
    `
  }
}

// Render models to the page with animation
function renderModels() {
  if (models.length === 0) {
    modelsContainer.innerHTML = '<p class="no-models">Hiện tại chưa có người mẫu nào.</p>'
    return
  }

  modelsContainer.innerHTML = models
    .map(
      (model, index) => `
  <div class="model-card ${index % 2 === 0 ? "slide-in-left" : "slide-in-right"}" style="animation-delay: ${index * 0.1}s">
    <img src="${model.image || "/placeholder.svg?height=300&width=250"}" alt="${model.name}" class="model-image">
    <div class="model-info">
      <h3>${model.name}</h3>
      <p>${model.description || "Chưa có mô tả."}</p>
      <button class="btn btn-primary btn-block vote-btn" data-id="${model.id}">
        <i class="fas fa-vote-yea"></i> Bình Chọn
      </button>
    </div>
  </div>
`,
    )
    .join("")

  // Add event listeners to vote buttons
  const voteButtons = document.querySelectorAll(".vote-btn")
  voteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const modelId = button.getAttribute("data-id")
      openVoteModal(modelId)
    })
  })

  // Add animation to elements when they come into view
  animateOnScroll()
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
      showNotification("Bạn đã bình chọn hôm nay rồi. Vui lòng quay lại vào ngày mai!", "error")
      return
    }

    // Show modal with animation
    voteModal.classList.add("active")

    // Focus on email input
    setTimeout(() => {
      voterEmail.focus()
    }, 300)
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
    showNotification("Vui lòng chọn một người mẫu để bình chọn.", "error")
    return
  }

  const email = voterEmail.value.trim()
  if (!email) {
    showNotification("Vui lòng nhập địa chỉ email của bạn.", "error")
    return
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    showNotification("Vui lòng nhập một địa chỉ email hợp lệ.", "error")
    return
  }

  // Show loading state
  const submitBtn = voteForm.querySelector('button[type="submit"]')
  const originalBtnText = submitBtn.innerHTML
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...'
  submitBtn.disabled = true

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
      throw new Error(data.message || "Không thể gửi phiếu bầu")
    }

    // Save vote timestamp to localStorage
    localStorage.setItem("lastVote", new Date().toDateString())

    // Show success message
    closeVoteModal()
    showNotification("Cảm ơn bạn đã bình chọn! Phiếu bầu của bạn đã được ghi nhận.", "success")

    // Add confetti effect
    createConfetti()
  } catch (error) {
    console.error("Lỗi khi gửi phiếu bầu:", error)
    showNotification(error.message || "Không thể gửi phiếu bầu. Vui lòng thử lại.", "error")
  } finally {
    // Restore button state
    submitBtn.innerHTML = originalBtnText
    submitBtn.disabled = false
  }
}

// Show notification
function showNotification(message, type = "info") {
  // Check if notification container exists, if not create it
  let notifContainer = document.querySelector(".notification-container")
  if (!notifContainer) {
    notifContainer = document.createElement("div")
    notifContainer.className = "notification-container"
    document.body.appendChild(notifContainer)

    // Add styles
    const style = document.createElement("style")
    style.textContent = `
      .notification-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
      }
      .notification {
        padding: 15px 20px;
        margin-bottom: 10px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        min-width: 300px;
        max-width: 450px;
        transform: translateX(120%);
        animation: slideIn 0.3s forwards, fadeOut 0.5s 4.5s forwards;
        backdrop-filter: blur(10px);
      }
      .notification.success {
        background-color: rgba(0, 184, 148, 0.9);
        color: white;
        border-left: 5px solid #00b894;
      }
      .notification.error {
        background-color: rgba(214, 48, 49, 0.9);
        color: white;
        border-left: 5px solid #d63031;
      }
      .notification.info {
        background-color: rgba(9, 132, 227, 0.9);
        color: white;
        border-left: 5px solid #0984e3;
      }
      .notification i {
        margin-right: 10px;
        font-size: 20px;
      }
      @keyframes slideIn {
        to { transform: translateX(0); }
      }
      @keyframes fadeOut {
        to { opacity: 0; transform: translateX(120%); }
      }
    `
    document.head.appendChild(style)
  }

  // Create notification element
  const notification = document.createElement("div")
  notification.className = `notification ${type}`

  // Add icon based on type
  let icon = "info-circle"
  if (type === "success") icon = "check-circle"
  if (type === "error") icon = "exclamation-circle"

  notification.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`
  notifContainer.appendChild(notification)

  // Remove notification after animation completes
  setTimeout(() => {
    notification.remove()
  }, 5000)
}

// Create confetti effect
function createConfetti() {
  const confettiContainer = document.createElement("div")
  confettiContainer.className = "confetti-container"
  document.body.appendChild(confettiContainer)

  // Add styles
  const style = document.createElement("style")
  style.textContent = `
    .confetti-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9998;
    }
    .confetti {
      position: absolute;
      width: 10px;
      height: 10px;
      background-color: var(--primary-color);
      opacity: 0.8;
      animation: fall linear forwards;
    }
    @keyframes fall {
      to {
        transform: translateY(100vh) rotate(360deg);
        opacity: 0;
      }
    }
  `
  document.head.appendChild(style)

  // Create confetti pieces
  const colors = ["#c91f28", "#d4af37", "#1e3a8a", "#00b894", "#fdcb6e"]
  const shapes = ["square", "circle", "triangle"]

  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement("div")
    confetti.className = "confetti"

    // Random position
    const left = Math.random() * 100
    confetti.style.left = `${left}vw`
    confetti.style.top = `-10px`

    // Random color
    const color = colors[Math.floor(Math.random() * colors.length)]
    confetti.style.backgroundColor = color

    // Random shape
    const shape = shapes[Math.floor(Math.random() * shapes.length)]
    if (shape === "circle") {
      confetti.style.borderRadius = "50%"
    } else if (shape === "triangle") {
      confetti.style.width = "0"
      confetti.style.height = "0"
      confetti.style.backgroundColor = "transparent"
      confetti.style.borderLeft = "5px solid transparent"
      confetti.style.borderRight = "5px solid transparent"
      confetti.style.borderBottom = `10px solid ${color}`
    }

    // Random size
    const size = Math.random() * 10 + 5
    confetti.style.width = `${size}px`
    confetti.style.height = shape === "triangle" ? "auto" : `${size}px`

    // Random rotation
    const rotation = Math.random() * 360
    confetti.style.transform = `rotate(${rotation}deg)`

    // Random animation duration
    const duration = Math.random() * 3 + 2
    confetti.style.animationDuration = `${duration}s`

    confettiContainer.appendChild(confetti)
  }

  // Remove confetti container after animations complete
  setTimeout(() => {
    confettiContainer.remove()
  }, 5000)
}

// Add animation to elements when they come into view
function animateOnScroll() {
  const elements = document.querySelectorAll(
    ".fade-in, .slide-in-left, .slide-in-right, .bounce-in, .scale-in, .rotate-in",
  )

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1"
          entry.target.style.transform = "translateX(0) scale(1) rotate(0)"
          observer.unobserve(entry.target)
        }
      })
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    },
  )

  elements.forEach((element) => {
    element.style.opacity = "0"
    if (element.classList.contains("slide-in-left")) {
      element.style.transform = "translateX(-50px)"
    } else if (element.classList.contains("slide-in-right")) {
      element.style.transform = "translateX(50px)"
    } else if (element.classList.contains("scale-in")) {
      element.style.transform = "scale(0.8)"
    } else if (element.classList.contains("rotate-in")) {
      element.style.transform = "rotate(-10deg) scale(0.8)"
    }
    observer.observe(element)
  })
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  fetchModels()

  // Add parallax effect to bronze drums
  document.addEventListener("mousemove", (e) => {
    const drums = document.querySelectorAll(".bronze-drum")
    const x = e.clientX / window.innerWidth
    const y = e.clientY / window.innerHeight

    drums.forEach((drum) => {
      const speed = drum.classList.contains("top-right") ? 20 : 15
      drum.style.transform = `translate(${x * speed}px, ${y * speed}px)`
    })
  })
})

closeButton.addEventListener("click", closeVoteModal)
voteForm.addEventListener("submit", submitVote)

// Close modal when clicking outside
window.addEventListener("click", (event) => {
  if (event.target === voteModal) {
    closeVoteModal()
  }
})

// Add smooth scrolling for all links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()

    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      window.scrollTo({
        top: target.offsetTop,
        behavior: "smooth",
      })
    }
  })
})

