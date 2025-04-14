require("dotenv").config(); // Load env vars

const express = require("express");
const path = require("path");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

// Database connection using Railway's DATABASE_URL
const db = mysql.createConnection(process.env.DATABASE_URL);
db.connect(err => {
  if (err) {
    console.error("❌ Database connection failed:", err.stack);
    return;
  }
  console.log("✅ Connected to MySQL database");
});

// Promise wrapper
const dbPromise = db.promise();

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ROUTES

app.post("/api/student/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await dbPromise.query("SELECT * FROM students WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(401).json({ error: "Invalid credentials" });

    const student = rows[0];
    const match = await bcrypt.compare(password, student.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    res.json({ user: { id: student.id, email: student.email, name: student.name || "Student" } });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/student/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const [existing] = await dbPromise.query("SELECT * FROM students WHERE email = ?", [email]);
    if (existing.length > 0) return res.status(400).json({ error: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);
    await dbPromise.query("INSERT INTO students (name, email, password) VALUES (?, ?, ?)", [name, email, hash]);

    res.status(201).json({ message: "Student registered" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/student/update", async (req, res) => {
  const { id, name, password } = req.body;
  const hash = password ? await bcrypt.hash(password, 10) : null;

  const query = hash
    ? "UPDATE students SET name = ?, password = ? WHERE id = ?"
    : "UPDATE students SET name = ? WHERE id = ?";
  const params = hash ? [name, hash, id] : [name, id];

  await dbPromise.query(query, params);
  res.json({ message: "Profile updated" });
});

app.get("/api/events", async (req, res) => {
  const [rows] = await dbPromise.query("SELECT * FROM events ORDER BY date DESC");
  res.json(rows);
});

app.post("/api/events", async (req, res) => {
  const { name, date } = req.body;
  await dbPromise.query("INSERT INTO events (name, date) VALUES (?, ?)", [name, date]);
  res.json({ message: "Event created" });
});

app.put("/api/events/:id", async (req, res) => {
  const { name, date } = req.body;
  await dbPromise.query("UPDATE events SET name = ?, date = ? WHERE id = ?", [name, date, req.params.id]);
  res.json({ message: "Event updated" });
});

app.delete("/api/events/:id", async (req, res) => {
  await dbPromise.query("DELETE FROM events WHERE id = ?", [req.params.id]);
  res.json({ message: "Event deleted" });
});

app.get("/api/events/judge/:judgeId", async (req, res) => {
  const { judgeId } = req.params;
  try {
    const [rows] = await dbPromise.query(`
      SELECT e.id, e.name, e.date
      FROM events e
      JOIN judge_event je ON e.id = je.event_id
      WHERE je.judge_id = ?
    `, [judgeId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch events" });
  }
});

app.post("/api/judges", async (req, res) => {
  const { id, password } = req.body;
  const [exists] = await dbPromise.query("SELECT * FROM judges WHERE id = ?", [id]);
  if (exists.length > 0) return res.status(400).json({ error: "Judge already exists" });

  const hashed = await bcrypt.hash(password, 10);
  await dbPromise.query("INSERT INTO judges (id, password) VALUES (?, ?)", [id, hashed]);
  res.json({ message: "Judge created" });
});

app.delete("/api/judges/:id", async (req, res) => {
  await dbPromise.query("DELETE FROM judges WHERE id = ?", [req.params.id]);
  res.json({ message: "Judge deleted" });
});

app.post("/api/judge_event", async (req, res) => {
  const { judgeId, eventId } = req.body;
  await dbPromise.query(
    "INSERT IGNORE INTO judge_event (judge_id, event_id) VALUES (?, ?)",
    [judgeId, eventId]
  );
  res.json({ message: "Judge assigned" });
});

app.put("/api/judge/update", async (req, res) => {
  const { id, name, password } = req.body;
  const hash = password ? await bcrypt.hash(password, 10) : null;

  const query = hash
    ? "UPDATE judges SET password = ? WHERE id = ?"
    : "UPDATE judges SET id = id WHERE id = ?";
  const params = hash ? [hash, id] : [id];

  await dbPromise.query(query, params);
  res.json({ message: "Password updated" });
});

app.get("/api/judges", async (req, res) => {
  const [rows] = await dbPromise.query("SELECT id FROM judges");
  res.json(rows);
});

app.get("/api/projects", async (req, res) => {
  const [rows] = await dbPromise.query("SELECT * FROM projects");
  res.json(rows);
});

app.post("/api/projects", async (req, res) => {
  const { title, description, event_id, user_id } = req.body;
  await dbPromise.query(
    "INSERT INTO projects (title, description, event_id, user_id) VALUES (?, ?, ?, ?)",
    [title, description, event_id, user_id]
  );
  res.json({ message: "Project added" });
});

app.delete("/api/projects/:id", async (req, res) => {
  await dbPromise.query("DELETE FROM projects WHERE id = ?", [req.params.id]);
  res.json({ message: "Project deleted" });
});

app.get("/api/projects/event/:eventId", async (req, res) => {
  const { eventId } = req.params;
  try {
    const [rows] = await dbPromise.query("SELECT * FROM projects WHERE event_id = ?", [eventId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch projects" });
  }
});

app.get("/api/projects/student/:studentId", async (req, res) => {
  const { studentId } = req.params;
  try {
    const [projects] = await dbPromise.query("SELECT * FROM projects WHERE user_id = ?", [studentId]);
    const projectIds = projects.map(p => p.id);
    if (projectIds.length === 0) return res.json([]);

    const [reviews] = await dbPromise.query("SELECT * FROM reviews WHERE project_id IN (?)", [projectIds]);

    const projectsWithReviews = projects.map(project => ({
      ...project,
      reviews: reviews.filter(r => r.project_id === project.id)
    }));

    res.json(projectsWithReviews);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch student projects." });
  }
});

app.get("/api/project/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [projectRows] = await dbPromise.query(`
      SELECT p.*, e.name AS event_name
      FROM projects p
      JOIN events e ON p.event_id = e.id
      WHERE p.id = ?
    `, [id]);
    if (projectRows.length === 0) return res.status(404).json({ error: "Project not found" });

    const [reviews] = await dbPromise.query("SELECT * FROM reviews WHERE project_id = ?", [id]);

    res.json({
      project: projectRows[0],
      reviews: reviews
    });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch project details" });
  }
});

app.post("/api/projects/review", async (req, res) => {
  const { judgeId, projectId, score, feedback } = req.body;
  try {
    await dbPromise.query(`
      INSERT INTO reviews (judge_id, project_id, score, feedback)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE score = ?, feedback = ?
    `, [judgeId, projectId, score, feedback, score, feedback]);

    res.json({ message: "Review saved" });
  } catch (err) {
    res.status(500).json({ error: "Could not save review" });
  }
});

app.get("/api/leaderboard", async (req, res) => {
  try {
    const [rows] = await dbPromise.query(`
      SELECT 
        p.title, 
        e.name AS event_name,
        AVG(r.score) AS avg_score
      FROM projects p
      JOIN events e ON p.event_id = e.id
      JOIN reviews r ON r.project_id = p.id
      GROUP BY p.id
      ORDER BY avg_score DESC
      LIMIT 10
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Could not load leaderboard" });
  }
});

app.get("/api/admin/analytics", async (req, res) => {
  try {
    const [[{ totalStudents }]] = await dbPromise.query("SELECT COUNT(*) AS totalStudents FROM students");
    const [[{ totalJudges }]] = await dbPromise.query("SELECT COUNT(*) AS totalJudges FROM judges");
    const [[{ totalEvents }]] = await dbPromise.query("SELECT COUNT(*) AS totalEvents FROM events");
    const [[{ totalProjects }]] = await dbPromise.query("SELECT COUNT(*) AS totalProjects FROM projects");

    const [[topEvent]] = await dbPromise.query(`
      SELECT e.name, COUNT(p.id) AS count
      FROM events e
      JOIN projects p ON e.id = p.event_id
      GROUP BY e.id
      ORDER BY count DESC
      LIMIT 1
    `);

    const [[topProject]] = await dbPromise.query(`
      SELECT p.title, AVG(r.score) AS avg_score
      FROM projects p
      JOIN reviews r ON r.project_id = p.id
      GROUP BY p.id
      ORDER BY avg_score DESC
      LIMIT 1
    `);

    res.json({
      totalStudents,
      totalJudges,
      totalEvents,
      totalProjects,
      topEvent: topEvent?.name || null,
      topProject: topProject?.title || null
    });
  } catch (err) {
    res.status(500).json({ error: "Analytics failed" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
