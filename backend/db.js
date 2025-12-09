// backend/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to SQLite database file (created in backend folder)
const dbPath = path.join(__dirname, 'database.sqlite');

// Open (or create) the database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at', dbPath);
  }
});

// Create "documents" table if it doesn't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      filepath TEXT NOT NULL,
      filesize INTEGER NOT NULL,
      created_at TEXT NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('Error creating documents table:', err.message);
    } else {
      console.log('Ensured that "documents" table exists.');
    }
  });
});

module.exports = db;
