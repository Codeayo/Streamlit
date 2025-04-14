const mysql = require('mysql2');

// Use Railway-provided DATABASE_URL environment variable
const db = mysql.createConnection(process.env.DATABASE_URL);

db.connect((err) => {
  if (err) {
    console.error("❌ Error connecting to the database:", err);
    return;
  }
  console.log("✅ Connected to MySQL!");
});

module.exports = db;
