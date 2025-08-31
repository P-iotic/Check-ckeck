const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { db } = require('./database');
const { hashPassword, verifyPassword, generateToken, requireAuth } = require('./auth');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// Basic root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Test database connection
app.get('/api/test-db', (req, res) => {
  db.get("SELECT name FROM sqlite_master WHERE type='table'", (err, row) => {
    if (err) {
      console.error('Database connection error:', err);
      return res.status(500).json({ error: 'Database connection failed' });
    }
    res.json({ message: 'Database connected successfully', tables: row });
  });
});

// Register new user
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, phone, password, role = 'customer' } = req.body;
    
    console.log('Registration attempt:', { name, email, role });
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    
    const allowedRoles = ['customer', 'supplier'];
    const userRole = allowedRoles.includes(role) ? role : 'customer';
    
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (row) {
        return res.status(400).json({ error: 'User already exists with this email' });
      }
      
      try {
        const hashedPassword = await hashPassword(password);
        db.run(
          'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
          [name, email, phone || '', hashedPassword, userRole],
          function(err) {
            if (err) {
              console.error('Insert error:', err);
              return res.status(500).json({ error: 'Failed to create user' });
            }
            res.json({
              id: this.lastID,
              name,
              email,
              phone: phone || '',
              role: userRole,
              message: 'User registered successfully'
            });
          }
        );
      } catch (hashError) {
        console.error('Password hash error:', hashError);
        res.status(500).json({ error: 'Server error during registration' });
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login user
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: err.message });
      }
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      const isValidPassword = await verifyPassword(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      const token = generateToken();
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token,
        message: 'Login successful'
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get all users (admin only)
app.get('/api/users', requireAuth, (req, res) => {
  db.all('SELECT id, name, email, phone, role, created_at FROM users', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
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

app.post('/api/products', requireAuth, (req, res) => {
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

// Orders endpoints - GET all orders or filtered by email
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
    
    const orders = rows.map(order => {
      const items = order.items ? order.items.split(',').map(item => {
        const [product_id, quantity, price] = item.split(':');
        return {
          product_id,
          quantity: parseInt(quantity) || 0,
          price: parseFloat(price) || 0
        };
      }) : [];
      
      return {
        ...order,
        items,
        total: parseFloat(order.total) || 0
      };
    });
    
    res.json(orders);
  });
});

// Get order by ID
app.get('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  
  console.log(`Fetching order with ID: ${id}`);
  
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
      console.error('Error fetching order:', err);
      return res.status(500).json({ error: err.message });
    }
    
    if (!row) {
      console.error(`Order not found: ${id}`);
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = {
      ...row,
      items: row.items ? row.items.split(',').map(item => {
        const [product_id, quantity, price, name] = item.split(':');
        const parsedQuantity = parseInt(quantity);
        const parsedPrice = parseFloat(price);
        return {
          product_id,
          name: name || 'Unknown Product',
          quantity: Number.isInteger(parsedQuantity) ? parsedQuantity : 0,
          price: Number.isFinite(parsedPrice) ? parsedPrice : 0
        };
      }) : [],
      total: parseFloat(row.total) || 0
    };
    
    console.log('Order data sent:', JSON.stringify(order, null, 2));
    res.json(order);
  });
});

// Update order status
app.post('/api/orders/update-status', requireAuth, (req, res) => {
  const { id, status } = req.body;
  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id], function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ success: true });
  });
});

// Create new order
app.post('/api/orders', (req, res) => {
  const { id, customer_name, customer_email, customer_phone, customer_address, delivery_option, total, items, status = 'Pending' } = req.body;

  console.log('Received order payload:', JSON.stringify(req.body, null, 2));

  if (!id || !customer_name || !customer_email || !total || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Missing required fields: id, customer_name, customer_email, total, and non-empty items array are required' });
  }

  for (const item of items) {
    if (!item.product_id || typeof item.product_id !== 'string' || item.product_id.trim() === '') {
      return res.status(400).json({ error: 'Invalid item data: product_id must be a non-empty string' });
    }
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      return res.status(400).json({ error: 'Invalid item data: quantity must be a positive integer' });
    }
    if (typeof item.price !== 'number' || item.price <= 0) {
      return res.status(400).json({ error: 'Invalid item data: price must be a positive number' });
    }
  }

  db.all('SELECT id FROM products WHERE id IN (' + items.map(() => '?').join(',') + ')', items.map(item => item.product_id), (err, rows) => {
    if (err) {
      console.error('Error verifying product IDs:', err);
      return res.status(500).json({ error: 'Failed to verify product IDs' });
    }

    const validProductIds = rows.map(row => row.id);
    const invalidProductIds = items.filter(item => !validProductIds.includes(item.product_id)).map(item => item.product_id);

    if (invalidProductIds.length > 0) {
      console.error('Invalid product IDs:', invalidProductIds);
      return res.status(400).json({ error: `Invalid product IDs: ${invalidProductIds.join(', ')}` });
    }

    db.serialize(() => {
      db.run(
        `INSERT INTO orders (id, customer_name, customer_email, customer_phone, customer_address, delivery_option, status, total, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, customer_name, customer_email, customer_phone || '', customer_address || '', delivery_option || 'standard', status, total, new Date().toISOString()],
        function (err) {
          if (err) {
            console.error('Error inserting order:', err);
            return res.status(400).json({ error: err.message });
          }

          const stmt = db.prepare(
            'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)'
          );

          let itemsError = null;
          items.forEach(item => {
            stmt.run([id, item.product_id, item.quantity, item.price], (err) => {
              if (err) {
                console.error('Error inserting order item:', err);
                itemsError = err;
              }
            });
          });

          stmt.finalize((err) => {
            if (err || itemsError) {
              console.error('Error finalizing order items:', err || itemsError);
              return res.status(400).json({ error: (err || itemsError).message });
            }

            res.json({
              id,
              customer_name,
              customer_email,
              customer_phone: customer_phone || '',
              customer_address: customer_address || '',
              delivery_option: delivery_option || 'standard',
              status,
              total,
              items,
              created_at: new Date().toISOString()
            });
          });
        }
      );
    });
  });
});

// Debug endpoint for orders
app.get('/api/debug/orders', (req, res) => {
  db.all('SELECT * FROM orders', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view your site`);
  console.log(`Admin dashboard: http://localhost:${PORT}/admin-dashboard.html`);
  console.log(`Test DB: http://localhost:${PORT}/api/test-db`);
});