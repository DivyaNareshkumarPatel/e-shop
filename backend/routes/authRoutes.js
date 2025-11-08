const express = require('express');
const bcrypt = require('bcryptjs');

// We are no longer importing db directly; the factory function will receive it.
// const db = require('../config/db.js'); 

// Factory function that creates the router, receiving the connected db object
module.exports = (db) => {
    const router = express.Router();
    
    // --- Helper function to get collection (defined here since we don't know the exact structure of your db.js) ---
    // Assuming db object has methods: db.users() and db.products()
    // NOTE: If db is already the client, we need to access the database name here.
    // Assuming your database.js exports a structure where db.users() is accessible:

    /**
     * POST /register
     */
    router.post('/register', async (req, res) => {
        console.log('Registration request body:', req.body);
        const { name, email, password } = req.body;
    
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }
    
        try {
            // FIX: Access db.users() provided via the factory function argument
            const usersCollection = db.users(); 
            
            // 1. Check if user already exists
            const existingUser = await usersCollection.findOne({ email });
            if (existingUser) {
                return res.status(409).json({ message: "An account with this email already exists." });
            }
    
            // 2. Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
    
            // 3. Create and save new user
            const newUser = {
                name,
                email,
                password: hashedPassword,
                createdAt: new Date(),
            };
    
            const result = await usersCollection.insertOne(newUser);
    
            res.status(201).json({ 
                message: "Registration successful. Please log in.",
                userId: result.insertedId 
            });
    
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: "Server error during registration." });
        }
    });

    /**
     * POST /login
     */
    router.post('/login', async (req, res) => {
        console.log('Login request body:', req.body);
        const { email, password } = req.body;
    
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }
    
        try {
            // FIX: Access db.users() provided via the factory function argument
            const usersCollection = db.users();
            const user = await usersCollection.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: "Invalid credentials." });
            }
    
            // 2. Compare the submitted password with the hashed password
            const isMatch = await bcrypt.compare(password, user.password);
    
            if (!isMatch) {
                return res.status(401).json({ message: "Invalid credentials." });
            }
    
            // 3. Success
            res.status(200).json({
                message: "Login successful.",
                user: { id: user._id, name: user.name, email: user.email }
            });
    
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: "Server error during login." });
        }
    });
    
    return router;
};