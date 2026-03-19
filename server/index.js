const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// SQLite Database
const db = new Database(path.join(__dirname, 'todos.db'));
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT (datetime('now'))
  )
`);
console.log('SQLite database ready');

// Routes
app.get('/api/todos', (req, res) => {
  try {
    const todos = db.prepare('SELECT * FROM todos ORDER BY createdAt DESC').all();
    res.json(todos.map(formatTodo));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/todos', (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ message: 'Text is required' });
  }
  try {
    const result = db.prepare('INSERT INTO todos (text) VALUES (?)').run(text.trim());
    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(formatTodo(todo));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/todos/:id', (req, res) => {
  try {
    const { completed } = req.body;
    const result = db.prepare('UPDATE todos SET completed = ? WHERE id = ?').run(completed ? 1 : 0, req.params.id);
    if (result.changes === 0) return res.status(404).json({ message: 'Todo not found' });
    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
    res.json(formatTodo(todo));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/todos/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM todos WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ message: 'Todo not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

function formatTodo(row) {
  return { _id: row.id, text: row.text, completed: !!row.completed, createdAt: row.createdAt };
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
