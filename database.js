const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcryptjs = require('bcryptjs');
const { hashPassword } = require('./auth');

// Connect to SQLite database
const dbPath = path.join(__dirname, 'forgeworks.db');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Enhanced product seeding function
async function checkAndSeedProducts() {
    return new Promise((resolve, reject) => {
        db.get("SELECT COUNT(*) as count FROM products", async (err, row) => {
            if (err) {
                console.error("Error checking products:", err);
                reject(err);
                return;
            }
            
            console.log('Current products in database:', row.count);
            
            if (row.count === 0) {
                console.log("Inserting sample products...");
                const sampleProducts = [
                    {
                        id: 'p1',
                        name: 'Hand-Forged Chef Knife',
                        price: 1299.00,
                        category: 'Kitchen',
                        image: 'images/knife1.png',
                        info: 'High-carbon steel, 8-inch.',
                        description: 'Expertly hand-forged from high-carbon steel for exceptional sharpness and durability.'
                    },
                    {
                        id: 'p2',
                        name: 'Paring Knife',
                        price: 599.00,
                        category: 'Kitchen',
                        image: 'Images/paring.png',
                        info: 'Precise control',
                        description: 'Precision-crafted small blade perfect for detailed kitchen work.'
                    },
                    {
                        id: 'p3',
                        name: 'Custom Fire Poker',
                        price: 349.00,
                        category: 'Home',
                        image: 'Images/poker.png',
                        info: 'Twisted handle',
                        description: 'Hand-forged steel fire poker with textured grip handle.'
                    },
                    {
                        id: 'p4',
                        name: 'Outdoor Camp Axe',
                        price: 1799.00,
                        category: 'Outdoor',
                        image: 'images/axe.png',
                        info: 'Forged head, ash handle.',
                        description: 'Rugged camping axe featuring a sharp steel head.'
                    },
                    {
                        id: 'p5',
                        name: 'Wall Hook Set (4)',
                        price: 299.00,
                        category: 'Home',
                        image: 'Images/hooks.png',
                        info: 'Wrought iron.',
                        description: 'Sleek modern wall hooks crafted from durable materials.'
                    },
                    {
                        id: 'p6',
                        name: 'Custom Bottle Opener',
                        price: 149.00,
                        category: 'Gifts',
                        image: 'Images/opener.png',
                        info: 'Personalizable.',
                        description: 'Heavy-duty bottle opener with ergonomic handle.'
                    },
                    {
                        id: 'p7',
                        name: 'Personalized Letter Opener',
                        price: 199.00,
                        category: 'Gifts',
                        image: 'Images/opener.jpg',
                        info: 'Custom engraving',
                        description: 'Elegant letter opener with optional personalization.'
                    }
                ];
                
                try {
                    for (const product of sampleProducts) {
                        await new Promise((productResolve, productReject) => {
                            db.run(
                                'INSERT OR IGNORE INTO products (id, name, price, category, image, info, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
                                [product.id, product.name, product.price, product.category, product.image, product.info, product.description],
                                function(err) {
                                    if (err) {
                                        console.error('Error inserting product:', product.name, err);
                                        productReject(err);
                                    } else {
                                        productResolve();
                                    }
                                }
                            );
                        });
                    }
                    console.log('Sample products inserted successfully');
                    resolve(true);
                } catch (error) {
                    console.error('Error in product seeding:', error);
                    reject(error);
                }
            } else {
                console.log('Products already exist in database');
                resolve(false);
            }
        });
    });
}

// Create default admin user
async function createDefaultAdmin() {
    return new Promise((resolve, reject) => {
        db.get("SELECT COUNT(*) as count FROM users WHERE role = 'admin'", async (err, row) => {
            if (err) {
                console.error("Error checking admin users:", err);
                reject(err);
                return;
            }
            
            console.log('Current admin users:', row.count);
            
            if (row.count === 0) {
                console.log("Creating default admin user...");
                try {
                    const hashedPassword = await hashPassword('admin123');
                    
                    db.run(
                        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                        ['Administrator', 'admin@forgeworks.com', hashedPassword, 'admin'],
                        function(err) {
                            if (err) {
                                console.error("Error creating admin user:", err);
                                reject(err);
                            } else {
                                console.log("Default admin user created: admin@forgeworks.com / admin123");
                                console.log("Admin user ID:", this.lastID);
                                resolve(true);
                            }
                        }
                    );
                } catch (error) {
                    console.error("Error hashing password for admin:", error);
                    reject(error);
                }
            } else {
                console.log('Admin user already exists');
                resolve(false);
            }
        });
    });
}

// Initialize tables with migration support
db.serialize(() => {
    console.log('Initializing database tables...');
    
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'customer',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, function(err) {
        if (err) {
            console.error('Error creating users table:', err);
        } else {
            console.log('Users table ready');
        }
    });

    // Products table
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        category TEXT,
        image TEXT,
        info TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, function(err) {
        if (err) {
            console.error('Error creating products table:', err);
        } else {
            console.log('Products table ready');
            // Check if we need to insert sample products
            checkAndSeedProducts().then(() => {
                console.log('Product seeding completed');
            }).catch(err => {
                console.error('Product seeding failed:', err);
            });
        }
    });

    // Orders table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        user_id INTEGER,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT,
        customer_address TEXT,
        delivery_option TEXT,
        status TEXT DEFAULT 'Paid',
        total REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`, function(err) {
        if (err) {
            console.error('Error creating orders table:', err);
        } else {
            console.log('Orders table ready');
        }
    });

    // Order items table
    db.run(`CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
    )`, function(err) {
        if (err) {
            console.error('Error creating order_items table:', err);
        } else {
            console.log('Order items table ready');
        }
    });

    // Suppliers table
    db.run(`CREATE TABLE IF NOT EXISTS suppliers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        materials TEXT,
        lead_time INTEGER
    )`, function(err) {
        if (err) {
            console.error('Error creating suppliers table:', err);
        } else {
            console.log('Suppliers table ready');
        }
    });

    // Check and create admin user after a short delay to ensure tables are created
    setTimeout(() => {
        createDefaultAdmin().then(() => {
            console.log('Admin user setup completed');
        }).catch(err => {
            console.error('Admin user setup failed:', err);
        });
    }, 1000);
});

// Function to reset database (for development)
function resetDatabase() {
    db.serialize(() => {
        db.run("DROP TABLE IF EXISTS users");
        db.run("DROP TABLE IF EXISTS products");
        db.run("DROP TABLE IF EXISTS orders");
        db.run("DROP TABLE IF EXISTS order_items");
        db.run("DROP TABLE IF EXISTS suppliers");
        console.log("Database reset complete. Restart the server to recreate tables.");
    });
}

// Add debug endpoints
function addDebugEndpoints(app) {
    app.get('/api/debug/db-stats', (req, res) => {
        const stats = {};
        
        db.get("SELECT COUNT(*) as count FROM users", (err, userRow) => {
            if (err) {
                stats.users_error = err.message;
            } else {
                stats.users = userRow.count;
            }
            
            db.get("SELECT COUNT(*) as count FROM products", (err, productRow) => {
                if (err) {
                    stats.products_error = err.message;
                } else {
                    stats.products = productRow.count;
                }
                
                db.get("SELECT COUNT(*) as count FROM orders", (err, orderRow) => {
                    if (err) {
                        stats.orders_error = err.message;
                    } else {
                        stats.orders = orderRow.count;
                    }
                    
                    res.json(stats);
                });
            });
        });
    });
    
    app.get('/api/debug/users', (req, res) => {
        db.all("SELECT id, name, email, role FROM users", (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json(rows);
            }
        });
    });

    app.get('/api/debug/products', (req, res) => {
        db.all("SELECT id, name, price, category FROM products", (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json(rows);
            }
        });
    });
}

module.exports = {
    db,
    addDebugEndpoints,
    resetDatabase
};