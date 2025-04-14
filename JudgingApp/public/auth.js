// Student Login
document.addEventListener("DOMContentLoaded", () => {
  const studentLoginForm = document.getElementById("studentLoginForm");
  if (studentLoginForm) {
    studentLoginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const errorDisplay = document.getElementById("studentLoginError");

      try {
        const response = await fetch("http://localhost:3000/api/student/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
          errorDisplay.textContent = data.error || "Login failed.";
        } else {
          localStorage.setItem("user", JSON.stringify(data.user));
          window.location.href = "student-dashboard.html";
        }
      } catch (err) {
        errorDisplay.textContent = "Server error.";
      }
    });
  }
});
