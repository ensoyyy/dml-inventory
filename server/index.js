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

  // Create users table if it doesn't exist
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(100) NOT NULL,
      role ENUM('admin', 'student') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.query(createUsersTable, (err) => {
    if (err) {
      console.error('Error creating users table:', err);
      return;
    }
    console.log('Users table ready');

    // Check if we have any users
    db.query('SELECT COUNT(*) as count FROM users', (err, results) => {
      if (err) {
        console.error('Error checking users:', err);
        return;
      }

      // If no users exist, create test users
      if (results[0].count === 0) {
        const testUsers = [
          {
            username: 'admin',
            password: 'admin123', // In production, this should be hashed
            name: 'Lab Manager',
            role: 'admin'
          },
          {
            username: 'student',
            password: 'student123', // In production, this should be hashed
            name: 'Test Student',
            role: 'student'
          }
        ];

        const insertUser = 'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)';
        testUsers.forEach(user => {
          db.query(insertUser, [user.username, user.password, user.name, user.role], (err) => {
            if (err) {
              console.error('Error inserting test user:', err);
            }
          });
        });
        console.log('Test users created');
      }
    });
  });

  // Add Borrow Requests table creation
  const createBorrowRequestsTable = `
    CREATE TABLE IF NOT EXISTS borrow_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      item_id INT NOT NULL,
      student_name VARCHAR(100) NOT NULL,
      due_date DATE NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      status ENUM('pending', 'approved', 'rejected', 'returned') DEFAULT 'pending',
      request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
    )
  `;

  db.query(createBorrowRequestsTable, (err) => {
    if (err) {
      console.error('Error creating borrow_requests table:', err);
      return;
    }
    console.log('Borrow Requests table ready');
  });
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // Query to check user credentials
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('Error during login:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    const user = results[0];
    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name
    });
  });
});

// Signup endpoint
app.post('/api/signup', (req, res) => {
  const { username, password, name } = req.body;

  // Ensure all fields are provided
  if (!username || !password || !name) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Insert the new student into the database
  const query = 'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)';
  db.query(query, [username, password, name, 'student'], (err) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Username already exists' });
      }
      console.error('Error creating account:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    res.status(201).json({ message: 'Account created successfully' });
  });
});

// Get all items
app.get('/api/items', (req, res) => {
  db.query('SELECT * FROM items', (err, results) => {
    if (err) {
      console.error('Error fetching items:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    res.json(results);
  });
});

// Add new item
app.post('/api/items', (req, res) => {
  const { name, category, quantity, location, lastChecked } = req.body;
  const query = 'INSERT INTO items (name, category, quantity, location, lastChecked) VALUES (?, ?, ?, ?, ?)';
  
  db.query(query, [name, category, quantity, location, lastChecked], (err, result) => {
    if (err) {
      console.error('Error adding item:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    
    const newItem = {
      id: result.insertId,
      name,
      category,
      quantity,
      location,
      lastChecked
    };
    res.status(201).json(newItem);
  });
});

// Update item
app.put('/api/items/:id', (req, res) => {
  const { id } = req.params;
  const { name, category, quantity, location, lastChecked } = req.body;
  const query = 'UPDATE items SET name = ?, category = ?, quantity = ?, location = ?, lastChecked = ? WHERE id = ?';
  
  db.query(query, [name, category, quantity, location, lastChecked, id], (err) => {
    if (err) {
      console.error('Error updating item:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    res.json({ message: 'Item updated successfully' });
  });
});

// Delete item
app.delete('/api/items/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM items WHERE id = ?';
  
  db.query(query, [id], (err) => {
    if (err) {
      console.error('Error deleting item:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    res.json({ message: 'Item deleted successfully' });
  });
});

// Endpoint to create a new borrow request
app.post('/api/borrow-requests', (req, res) => {
  const { itemId, studentName, dueDate, quantity } = req.body;

  if (!itemId || !studentName || !dueDate || !quantity) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const query = 'INSERT INTO borrow_requests (item_id, student_name, due_date, quantity) VALUES (?, ?, ?, ?)';
  db.query(query, [itemId, studentName, dueDate, quantity], (err, result) => {
    if (err) {
      console.error('Error creating borrow request:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    res.status(201).json({
      id: result.insertId,
      itemId,
      studentName,
      dueDate,
      quantity,
      status: 'pending',
      requestDate: new Date().toISOString().split('T')[0],
    });
  });
});

// Endpoint to fetch all borrow requests
app.get('/api/borrow-requests', (req, res) => {
  const query = `
    SELECT br.id, br.item_id AS itemId, i.name AS itemName, br.student_name AS studentName, 
           br.due_date AS dueDate, br.status, br.request_date AS requestDate, br.quantity
    FROM borrow_requests br
    JOIN items i ON br.item_id = i.id
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching borrow requests:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    res.json(results);
  });
});

// Endpoint to update the status of a borrow request
app.put('/api/borrow-requests/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'approved', 'rejected', 'returned'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  // First, get the borrow request to know the item and quantity
  db.query('SELECT item_id, quantity FROM borrow_requests WHERE id = ?', [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(500).json({ message: 'Borrow request not found' });
    }
    const { item_id, quantity } = results[0];

    if (status === 'approved') {
      // Deduct quantity from items
      db.query('UPDATE items SET quantity = quantity - ? WHERE id = ?', [quantity, item_id], (err) => {
        if (err) {
          return res.status(500).json({ message: 'Failed to update item quantity' });
        }
        db.query('UPDATE borrow_requests SET status = ? WHERE id = ?', [status, id], (err) => {
          if (err) {
            return res.status(500).json({ message: 'Failed to update borrow request status' });
          }
          res.json({ message: 'Borrow request approved and item quantity updated' });
        });
      });
    } else if (status === 'returned') {
      // Add back quantity to items
      db.query('UPDATE items SET quantity = quantity + ? WHERE id = ?', [quantity, item_id], (err) => {
        if (err) {
          return res.status(500).json({ message: 'Failed to update item quantity on return' });
        }
        db.query('UPDATE borrow_requests SET status = ? WHERE id = ?', [status, id], (err) => {
          if (err) {
            return res.status(500).json({ message: 'Failed to update borrow request status' });
          }
          res.json({ message: 'Borrow request marked as returned and item quantity updated' });
        });
      });
    } else {
      // Just update the status
      db.query('UPDATE borrow_requests SET status = ? WHERE id = ?', [status, id], (err) => {
        if (err) {
          return res.status(500).json({ message: 'Failed to update borrow request status' });
        }
        res.json({ message: 'Borrow request status updated' });
      });
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});