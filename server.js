const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve your HTML, CSS, JS files

// API Routes

// Users endpoints
app.get('/api/users', (req, res) => {
  db.all('SELECT id, name, email, phone FROM users', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/users', (req, res) => {
  const { name, email, phone, password } = req.body;
  db.run(
    'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)',
    [name, email, phone, password],
    function(err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        id: this.lastID,
        name,
        email,
        phone
      });
    }
  );
});

// Products endpoints
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/products', (req, res) => {
  const { id, name, price, category, image, info, description } = req.body;
  db.run(
    'INSERT INTO products (id, name, price, category, image, info, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, name, price, category, image, info, description],
    function(err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        id,
        name,
        price,
        category,
        image,
        info,
        description
      });
    }
  );
});

// Orders endpoints
app.get('/api/orders', (req, res) => {
  const { email } = req.query;
  let query = `
    SELECT o.*, 
           GROUP_CONCAT(oi.product_id || ':' || oi.quantity || ':' || oi.price) as items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
  `;
  
  let params = [];
  if (email) {
    query += ' WHERE o.customer_email = ?';
    params.push(email);
  }
  
  query += ' GROUP BY o.id ORDER BY o.created_at DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Parse items
    const orders = rows.map(order => {
      const items = order.items ? order.items.split(',').map(item => {
        const [product_id, quantity, price] = item.split(':');
        return {
          id: product_id,
          qty: parseInt(quantity),
          price: parseFloat(price)
        };
      }) : [];
      
      return {
        ...order,
        items,
        total: parseFloat(order.total)
      };
    });
    
    res.json(orders);
  });
});

app.post('/api/orders', (req, res) => {
  const { id, customer, items, total, delivery } = req.body;
  const { name, email, phone, address } = customer;
  
  // Start a transaction
  db.serialize(() => {
    // Insert order
    db.run(
      'INSERT INTO orders (id, customer_name, customer_email, customer_phone, customer_address, delivery_option, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, email, phone, address, delivery, total],
      function(err) {
        if (err) {
          res.status(400).json({ error: err.message });
          return;
        }
        
        // Insert order items
        const stmt = db.prepare(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)'
        );
        
        items.forEach(item => {
          stmt.run([id, item.id, item.qty, item.price]);
        });
        
        stmt.finalize((err) => {
          if (err) {
            res.status(400).json({ error: err.message });
            return;
          }
          res.json({
            id,
            customer: { name, email, phone, address },
            items,
            total,
            status: 'Paid',
            createdAt: new Date().toISOString()
          });
        });
      }
    );
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});