const API_URL = 'http://localhost:3000/api';

function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = "login.html";
  }
}
checkAuth();

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

const addEventBtn = document.getElementById("addEventBtn");
const eventForm = document.getElementById("eventForm");
const saveEventBtn = document.getElementById("saveEventBtn");
const cancelEventBtn = document.getElementById("cancelEventBtn");

if (addEventBtn) {
  addEventBtn.addEventListener("click", () => eventForm.style.display = "block");
}
if (cancelEventBtn) {
  cancelEventBtn.addEventListener("click", () => eventForm.style.display = "none");
}
if (saveEventBtn) {
  saveEventBtn.addEventListener("click", async () => {
    const name = document.getElementById("eventName").value;
    const date = document.getElementById("eventDate").value;
    const location = document.getElementById("eventLocation").value;
    const level = document.getElementById("eventLevel").value;
    const status = document.getElementById("eventStatus").value;

    try {
      const res = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, date, location, level, status })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create event');

      alert(`✅ ${data.message}`);
      eventForm.style.display = "none";
    } catch (err) {
      alert(err.message);
    }
  });
}

const addJudgeBtn = document.getElementById("addJudgeBtn");
const judgeForm = document.getElementById("judgeForm");
const saveJudgeBtn = document.getElementById("saveJudgeBtn");
const cancelJudgeBtn = document.getElementById("cancelJudgeBtn");

if (addJudgeBtn) {
  addJudgeBtn.addEventListener("click", () => judgeForm.style.display = "block");
}
if (cancelJudgeBtn) {
  cancelJudgeBtn.addEventListener("click", () => judgeForm.style.display = "none");
}
if (saveJudgeBtn) {
  saveJudgeBtn.addEventListener("click", async () => {
    const fullName = document.getElementById("judgeName").value;
    const email = document.getElementById("judgeEmail").value;
    const password = document.getElementById("judgePassword").value;

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // no token needed
        body: JSON.stringify({ fullName, email, password, role: 'judge' })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create judge');

      alert("✅ Judge created successfully!");
      judgeForm.style.display = "none";
    } catch (err) {
      alert(err.message);
    }
  });
}


const addProjectBtn = document.getElementById("addProjectBtn");
const projectForm = document.getElementById("projectForm");
const saveProjectBtn = document.getElementById("saveProjectBtn");
const cancelProjectBtn = document.getElementById("cancelProjectBtn");

if (addProjectBtn) {
  addProjectBtn.addEventListener("click", () => projectForm.style.display = "block");
}
if (cancelProjectBtn) {
  cancelProjectBtn.addEventListener("click", () => projectForm.style.display = "none");
}
if (saveProjectBtn) {
  saveProjectBtn.addEventListener("click", async () => {
    const title = document.getElementById("projectName").value;
    const description = document.getElementById("projectDesc").value;
    const eventId = document.getElementById("eventId").value;
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.UserID;

    try {
      const res = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title, description, eventId, userId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create project');

      alert("✅ Project created successfully!");
      projectForm.style.display = "none";
    } catch (err) {
      alert(err.message);
    }
  });
}
