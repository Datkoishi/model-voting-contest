// DOM Elements
const loginForm = document.getElementById("admin-login-form")
const usernameInput = document.getElementById("username")
const passwordInput = document.getElementById("password")
const loginMessage = document.getElementById("login-message")

// Check if user is already logged in
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("adminToken")
  if (token) {
    // Redirect to index page with admin token set
    window.location.href = "index.html"
  }
})

// Handle login form submission
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault()

  const username = usernameInput.value.trim()
  const password = passwordInput.value.trim()

  // Clear previous messages
  loginMessage.className = "form-message"
  loginMessage.textContent = ""
  loginMessage.style.display = "none"

  try {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Đăng nhập thất bại")
    }

    // Store token and user info
    localStorage.setItem("adminToken", data.token)
    localStorage.setItem("adminUsername", data.username)

    // Show success message
    loginMessage.textContent = "Đăng nhập thành công! Đang chuyển hướng..."
    loginMessage.classList.add("success")
    loginMessage.style.display = "block"

    // Redirect to index page
    setTimeout(() => {
      window.location.href = "index.html"
    }, 1000)
  } catch (error) {
    console.error("Lỗi đăng nhập:", error)

    // Show error message
    loginMessage.textContent = error.message || "Tên đăng nhập hoặc mật khẩu không đúng"
    loginMessage.classList.add("error")
    loginMessage.style.display = "block"

    // Clear password field
    passwordInput.value = ""
  }
})

