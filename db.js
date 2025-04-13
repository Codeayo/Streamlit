const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',                
  password: 's9017203.',  
  database: 'adjudicators_db'
});

db.connect((err) => {
  if (err) {
    console.error("❌ Error connecting to the database:", err);
    return;
  }
  console.log("✅ MySQL connected!");
});

module.exports = db;
