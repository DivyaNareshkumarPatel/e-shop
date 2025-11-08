const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config(); 
const connectToMongo = require('./config/db.js'); // Assuming connection function is here
const authRouterFactory = require('./routes/authRoutes.js'); // The auth router factory
const productRouterFactory = require('./routes/productRoutes'); // <-- 1. IMPORT PRODUCT ROUTER
const cartRouterFactory = require('./routes/cartRoutes'); // If cart routes are needed
const app = express();
const PORT = 3000;

// Middleware (REQUIRED to parse JSON body before the router)
app.use(cors()); 
app.use(bodyParser.json()); 

async function startServer() {
    let mongoClient;
    try {
        // 1. Await the MongoDB connection and get the DB client instance
        mongoClient = await connectToMongo(); 
        
        // --- Get the MongoDB DB object and Collection handlers ---
        const db = mongoClient.db('vibe_commerce_db');
        
        // This is a common pitfall: The router needs the DB connection methods.
        const dbInstanceForRouter = {
            users: () => db.collection('users'),
            products: () => db.collection('products'), // <-- 2. ADD PRODUCTS COLLECTION ACCESS
            cart: () => db.collection('cart'),         // Assuming cart is also needed later
        };

        // 2. Instantiate the router by passing the connected DB handler
        const authRouter = authRouterFactory(dbInstanceForRouter); 
        
        // 3. Mount the routers AFTER bodyParser.json() and AFTER DB connection
        
        // Mount Authentication Routes
        app.use('/api/auth', authRouter); 
        const productRouter = productRouterFactory(dbInstanceForRouter);
        // Mount Product Routes (GET /api/products and POST /api/products)
        app.use('/api/products', productRouter); // <-- 3. MOUNT PRODUCT ROUTER
        const cartRouter = cartRouterFactory(dbInstanceForRouter);
        app.use('/api/cart', cartRouter); // Mount Cart Routes if needed
        // --- Minimal Status Endpoint ---
        app.get('/api/status', async (req, res) => {
            try {
                await db.command({ ping: 1 }); 
                res.json({ 
                    status: "Server and MongoDB Atlas Connected.",
                    timestamp: new Date().toISOString()
                });
            } catch (e) {
                res.status(500).json({ status: "Server is up, but MongoDB connection is failing." });
            }
        });

        // 4. Start the Express server
        app.listen(PORT, () => {
            console.log(`[SERVER] Express running on http://localhost:${PORT}`);
            console.log(`[SERVER] MongoDB connection active.`);
        });

    } catch (err) {
        console.error('Failed to start server:', err);
        // Ensure the application stops on critical failure
        if (mongoClient) mongoClient.close();
        process.exit(1);
    }
}

startServer();