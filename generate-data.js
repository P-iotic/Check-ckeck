const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { hashPassword } = require('./auth');

const dbPath = path.join(__dirname, 'forgeworks.db');
const db = new sqlite3.Database(dbPath);

// Sample data generators
const generateUsers = async () => {
    const users = [
        {
            name: 'Admin User',
            email: 'admin@forgeworks.com',
            password: await hashPassword('admin123'),
            role: 'admin',
            phone: '+27 11 123 4567'
        },
        {
            name: 'Supplier Manager',
            email: 'supplier@forgeworks.com', 
            password: await hashPassword('supplier123'),
            role: 'supplier',
            phone: '+27 11 234 5678'
        },
        {
            name: 'John Smith',
            email: 'john.smith@email.com',
            password: await hashPassword('password123'),
            role: 'customer',
            phone: '+27 82 123 4567'
        },
        {
            name: 'Sarah Johnson',
            email: 'sarahj@email.com',
            password: await hashPassword('password123'),
            role: 'customer',
            phone: '+27 83 234 5678'
        },
        {
            name: 'Mike Wilson',
            email: 'mike.wilson@email.com',
            password: await hashPassword('password123'),
            role: 'customer',
            phone: '+27 84 345 6789'
        },
        {
            name: 'Emily Davis',
            email: 'emily.davis@email.com',
            password: await hashPassword('password123'),
            role: 'customer',
            phone: '+27 85 456 7890'
        },
        {
            name: 'David Brown',
            email: 'david.brown@email.com',
            password: await hashPassword('password123'),
            role: 'customer',
            phone: '+27 86 567 8901'
        },
        {
            name: 'Lisa Miller',
            email: 'lisa.miller@email.com',
            password: await hashPassword('password123'),
            role: 'customer',
            phone: '+27 87 678 9012'
        },
        {
            name: 'James Wilson',
            email: 'james.wilson@email.com',
            password: await hashPassword('password123'),
            role: 'customer',
            phone: '+27 88 789 0123'
        },
        {
            name: 'Karen Taylor',
            email: 'karen.taylor@email.com',
            password: await hashPassword('password123'),
            role: 'customer',
            phone: '+27 89 890 1234'
        },
        {
            name: 'Robert Anderson',
            email: 'robert.anderson@email.com',
            password: await hashPassword('password123'),
            role: 'customer',
            phone: '+27 71 901 2345'
        },
        {
            name: 'Jennifer Martin',
            email: 'jennifer.martin@email.com',
            password: await hashPassword('password123'),
            role: 'customer',
            phone: '+27 72 012 3456'
        }
    ];

    return users;
};

const generateSuppliers = () => {
    return [
        {
            id: 's1',
            name: 'Premium Steel Suppliers',
            email: 'orders@premiumsteel.co.za',
            materials: 'carbon steel,stainless steel,tool steel',
            lead_time: 7
        },
        {
            id: 's2', 
            name: 'Artisan Handle Crafters',
            email: 'info@artisanhandles.africa',
            materials: 'oak handles,walnut handles,maple handles,brass fittings',
            lead_time: 5
        },
        {
            id: 's3',
            name: 'African Hardwoods',
            email: 'sales@africanhardwoods.co.za',
            materials: 'ironwood,knobthorn,leadwood',
            lead_time: 10
        }
    ];
};

const products = [
    { id: 'p1', name: 'Hand-Forged Chef Knife', price: 1299.00, category: 'Kitchen' },
    { id: 'p2', name: 'Paring Knife', price: 599.00, category: 'Kitchen' },
    { id: 'p3', name: 'Custom Fire Poker', price: 349.00, category: 'Home' },
    { id: 'p4', name: 'Outdoor Camp Axe', price: 1799.00, category: 'Outdoor' },
    { id: 'p5', name: 'Wall Hook Set (4)', price: 299.00, category: 'Home' },
    { id: 'p6', name: 'Custom Bottle Opener', price: 149.00, category: 'Gifts' },
    { id: 'p7', name: 'Bushcraft Survival Knife', price: 1899.00, category: 'Outdoor' },
    { id: 'p8', name: 'Decorative Wall Sword', price: 2499.00, category: 'Home' },
    { id: 'p9', name: 'Gardening Tool Set', price: 899.00, category: 'Outdoor' },
    { id: 'p10', name: 'Personalized Letter Opener', price: 199.00, category: 'Gifts' }
];

const generateOrders = (users) => {
    const orders = [];
    const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    const deliveryOptions = ['standard', 'express', 'pickup'];
    
    // Generate orders for the past 90 days
    for (let i = 0; i < 50; i++) {
        const customer = users[Math.floor(Math.random() * (users.length - 2)) + 2]; // Skip admin and supplier
        const orderDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
        
        const order = {
            id: `order_${1000 + i}`,
            customer_name: customer.name,
            customer_email: customer.email,
            customer_phone: customer.phone || '+27 82 123 4567',
            customer_address: `${Math.floor(Math.random() * 100) + 1} Main St, Johannesburg, South Africa`,
            delivery_option: deliveryOptions[Math.floor(Math.random() * deliveryOptions.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            total: 0,
            created_at: orderDate.toISOString(),
            items: []
        };
        
        // Add 1-4 random items to each order
        const itemCount = Math.floor(Math.random() * 4) + 1;
        const selectedProducts = [];
        
        for (let j = 0; j < itemCount; j++) {
            const product = products[Math.floor(Math.random() * products.length)];
            const quantity = Math.floor(Math.random() * 3) + 1;
            
            // Avoid duplicate products in same order
            if (!selectedProducts.includes(product.id)) {
                selectedProducts.push(product.id);
                
                order.items.push({
                    product_id: product.id,
                    quantity: quantity,
                    price: product.price
                });
                
                order.total += product.price * quantity;
            }
        }
        
        // Add shipping cost
        order.total += order.delivery_option === 'express' ? 129 : 79;
        orders.push(order);
    }
    
    return orders;
};

async function generateSampleData() {
    console.log('Starting data generation...');
    
    try {
        // Generate users
        console.log('Generating users...');
        const users = await generateUsers();
        
        // Insert users
        for (const user of users) {
            await new Promise((resolve, reject) => {
                db.run(
                    `INSERT OR REPLACE INTO users (name, email, phone, password, role) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [user.name, user.email, user.phone, user.password, user.role],
                    function(err) {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        }
        console.log(`✅ Inserted ${users.length} users`);
        
        // Insert suppliers
        console.log('Generating suppliers...');
        const suppliers = generateSuppliers();
        
        for (const supplier of suppliers) {
            await new Promise((resolve, reject) => {
                db.run(
                    `INSERT OR REPLACE INTO suppliers (id, name, email, materials, lead_time) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [supplier.id, supplier.name, supplier.email, supplier.materials, supplier.lead_time],
                    function(err) {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        }
        console.log(`✅ Inserted ${suppliers.length} suppliers`);
        
        // Generate and insert orders
        console.log('Generating orders...');
        const orders = generateOrders(users);
        
        for (const order of orders) {
            // Insert order
            await new Promise((resolve, reject) => {
                db.run(
                    `INSERT OR REPLACE INTO orders 
                     (id, customer_name, customer_email, customer_phone, customer_address, delivery_option, status, total, created_at) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        order.id, 
                        order.customer_name, 
                        order.customer_email,
                        order.customer_phone,
                        order.customer_address,
                        order.delivery_option,
                        order.status,
                        order.total,
                        order.created_at
                    ],
                    function(err) {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
            
            // Insert order items
            for (const item of order.items) {
                await new Promise((resolve, reject) => {
                    db.run(
                        `INSERT OR REPLACE INTO order_items (order_id, product_id, quantity, price) 
                         VALUES (?, ?, ?, ?)`,
                        [order.id, item.product_id, item.quantity, item.price],
                        function(err) {
                            if (err) reject(err);
                            else resolve();
                        }
                    );
                });
            }
        }
        console.log(`✅ Inserted ${orders.length} orders with ${orders.reduce((acc, order) => acc + order.items.length, 0)} items`);
        
        console.log('\n📊 DATA GENERATION COMPLETE!');
        console.log('================================');
        console.log(`👥 Users: ${users.length} (including admin and supplier)`);
        console.log(`🏭 Suppliers: ${suppliers.length}`);
        console.log(`📦 Orders: ${orders.length}`);
        console.log(`🛒 Order Items: ${orders.reduce((acc, order) => acc + order.items.length, 0)}`);
        console.log(`💰 Total Revenue: R ${orders.reduce((acc, order) => acc + order.total, 0).toFixed(2)}`);
        
        // Show sample data
        console.log('\n🔍 SAMPLE DATA:');
        console.log('Admin login: admin@forgeworks.com / admin123');
        console.log('Supplier login: supplier@forgeworks.com / supplier123');
        console.log('Last order amount:', `R ${orders[orders.length - 1].total.toFixed(2)}`);
        
    } catch (error) {
        console.error('Error generating data:', error);
    } finally {
        db.close();
    }
}

// Run the data generation
generateSampleData();