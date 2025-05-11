const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database!');
});

// Example route: Get all items
app.get('/api/items', (req, res) => {
  db.query('SELECT * FROM items', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Add a new item
app.post('/api/items', (req, res) => {
  const { name, category, quantity, location, lastChecked } = req.body;
  const sql = 'INSERT INTO items (name, category, quantity, location, lastChecked) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [name, category, quantity, location, lastChecked], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ id: result.insertId, name, category, quantity, location, lastChecked });
  });
});


// Edit (update) an item
app.put('/api/items/:id', (req, res) => {
    console.log('PUT /api/items/:id', req.params.id, req.body); // Add this line
    const { id } = req.params;
    const { name, category, quantity, location, lastChecked } = req.body;
    const sql = 'UPDATE items SET name=?, category=?, quantity=?, location=?, lastChecked=? WHERE id=?';
    db.query(sql, [name, category, quantity, location, lastChecked, id], (err, result) => {
      if (err) {
        console.error('Update error:', err); // Add this line
        return res.status(500).json({ error: err });
      }
      res.json({ success: true });
    });
  });

// Delete an item
app.delete('/api/items/:id', (req, res) => {
    console.log('DELETE /api/items/:id', req.params.id); // Add this line
    const { id } = req.params;
    db.query('DELETE FROM items WHERE id=?', [id], (err, result) => {
      if (err) {
        console.error('Delete error:', err); // Add this line
        return res.status(500).json({ error: err });
      }
      res.json({ success: true });
    });
  });

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 