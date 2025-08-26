const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Add these security middleware to your server.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Add to your server.js after requiring dependencies
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Add CSRF protection for forms
const csurf = require('csurf');
app.use(csurf());

// Then make sure to include the CSRF token in your forms

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

// Add these endpoints to your server.js file

// Get user by ID
app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT id, name, email, phone FROM users WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

// Update user
app.post('/api/users/update', (req, res) => {
  const { id, name, email, phone, password } = req.body;
  
  let query, params;
  if (password) {
    query = 'UPDATE users SET name = ?, email = ?, phone = ?, password = ? WHERE id = ?';
    params = [name, email, phone, password, id];
  } else {
    query = 'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?';
    params = [name, email, phone, id];
  }
  
  db.run(query, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ id, name, email, phone });
  });
});

// Delete user
app.post('/api/users/delete', (req, res) => {
  const { id } = req.body;
  db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ success: true });
  });
});

// Get order by ID
app.get('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  
  db.get(`
    SELECT o.*, 
           GROUP_CONCAT(oi.product_id || ':' || oi.quantity || ':' || oi.price || ':' || p.name) as items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.id = ?
    GROUP BY o.id
  `, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!row) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    
    // Parse items
    const order = {
      ...row,
      items: row.items ? row.items.split(',').map(item => {
        const [product_id, quantity, price, name] = item.split(':');
        return {
          id: product_id,
          name,
          qty: parseInt(quantity),
          price: parseFloat(price)
        };
      }) : [],
      total: parseFloat(row.total)
    };
    
    res.json(order);
  });
});

// Update order status
app.post('/api/orders/update-status', (req, res) => {
  const { id, status } = req.body;
  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id], function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ success: true });
  });
});