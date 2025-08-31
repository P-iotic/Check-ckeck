// auth.js - Fixed version
const bcryptjs = require('bcryptjs');

// Password hashing function
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcryptjs.hash(password, saltRounds);
};

// Password verification function
const verifyPassword = async (password, hashedPassword) => {
    return await bcryptjs.compare(password, hashedPassword);
};

// Generate a simple session token (for demo purposes)
const generateToken = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    const token = req.headers.authorization;
    
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    // In a real app, you'd verify JWT or check session store
    // For this demo, we'll use a simple approach
    next();
};

module.exports = {
    hashPassword,
    verifyPassword,
    generateToken,
    requireAuth
};