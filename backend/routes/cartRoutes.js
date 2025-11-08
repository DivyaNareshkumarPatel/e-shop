const express = require('express');

// Fixed costs (readability)
const SHIPPING_COST = 15.00;
const TAX_RATE = 0.08; 

// Helper function to calculate totals from MongoDB result set
const calculateTotals = (cartItems, allProducts) => {
    let subtotal = 0;

    const detailedCart = cartItems.map(item => {
        // Find product details from the array of all products fetched
        const product = allProducts.find(p => p._id === item.productId); 
        
        if (product) {
            const lineTotal = item.qty * product.price;
            subtotal += lineTotal;
            return {
                productId: item.productId,
                name: product.name,
                price: product.price,
                qty: item.qty,
                imageUrl: product.imageUrl, // Assuming imageUrl is returned by products API
                lineTotal: parseFloat(lineTotal.toFixed(2)),
            };
        }
        return null;
    }).filter(item => item !== null);

    const tax = subtotal * TAX_RATE;
    const grandTotal = subtotal + tax + SHIPPING_COST;

    return {
        items: detailedCart,
        subtotal: parseFloat(subtotal.toFixed(2)),
        shipping: SHIPPING_COST,
        tax: parseFloat(tax.toFixed(2)),
        grandTotal: parseFloat(grandTotal.toFixed(2)),
    };
};


module.exports = (db) => {
    const router = express.Router();

    /**
     * GET /api/cart?userId=...
     * Retrieves the current cart contents and total breakdown for a specific user.
     */
    router.get('/', async (req, res) => {
        const userId = req.query.userId; // Expecting ID in query params for GET
        
        if (!userId) {
             return res.status(401).json({ message: "User ID is required to view cart." });
        }
        const userIdInt = parseInt(userId);

        try {
            const cartItems = await db.cart().find({ userId: userIdInt }).toArray();
            const allProducts = await db.products().find({}).toArray();
            
            res.json(calculateTotals(cartItems, allProducts));
        } catch (error) {
            console.error('Error fetching cart:', error);
            res.status(500).json({ message: "Database error fetching cart." });
        }
    });


    /**
     * POST /api/cart
     * Adds a new product or updates the quantity of an existing one.
     * Body: { userId: Number, productId: Number, qty: Number }
     */
    router.post('/', async (req, res) => {
        const { userId, productId, qty } = req.body;
        const prodIdNum = parseInt(productId);
        const userIdInt = parseInt(userId); // Convert to required type

        if (!userId || typeof qty !== 'number' || qty < 0) {
            return res.status(400).json({ message: "User ID and valid Quantity are required." });
        }

        try {
            const product = await db.products().findOne({ _id: prodIdNum });
            if (!product) {
                return res.status(404).json({ message: "Product not found." });
            }

            if (qty === 0) {
                // If quantity is zero, remove the item entirely
                await db.cart().deleteOne({ userId: userIdInt, productId: prodIdNum });
            } else {
                // Add or Update item (upsert operation)
                await db.cart().updateOne(
                    { userId: userIdInt, productId: prodIdNum },
                    { $set: { qty: qty } },
                    { upsert: true } 
                );
            }

            // Return the updated cart details
            const updatedCartItems = await db.cart().find({ userId: userIdInt }).toArray();
            const allProducts = await db.products().find({}).toArray();
            res.status(200).json(calculateTotals(updatedCartItems, allProducts));

        } catch (error) {
            console.error('Error updating cart:', error);
            res.status(500).json({ message: "Database error updating cart." });
        }
    });

    /**
     * DELETE /api/cart/:id?userId=...
     * Removes a specific product item from the cart.
     */
    router.delete('/:id', async (req, res) => {
        const productId = parseInt(req.params.id);
        const userId = req.query.userId; 
        const userIdInt = parseInt(userId);

        if (!userId) {
            return res.status(401).json({ message: "User ID is required to modify cart." });
        }

        try {
            const result = await db.cart().deleteOne({ userId: userIdInt, productId: productId });
            
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: "Item not found in cart." });
            }

            // Return the updated cart details
            const updatedCartItems = await db.cart().find({ userId: userIdInt }).toArray();
            const allProducts = await db.products().find({}).toArray();
            res.status(200).json(calculateTotals(updatedCartItems, allProducts));

        } catch (error) {
            console.error('Error deleting item from cart:', error);
            res.status(500).json({ message: "Database error deleting item." });
        }
    });

    // =======================================================
    // ======== POST /api/checkout ROUTE =======================
    // =======================================================

    /**
     * POST /api/checkout
     * Processes mock payment, generates receipt, and clears the cart.
     * Body: { name: String, email: String, grandTotal: Number, cartItems: Array, userId: Number }
     */
    router.post('/checkout', async (req, res) => {
        const { name, email, grandTotal, userId } = req.body;
        const userIdInt = parseInt(userId);
        
        if (!userId || !name || !email) {
            return res.status(400).json({ message: "User ID, name, and email are required for checkout." });
        }
        
        try {
            const cartData = await db.cart().find({ userId: userIdInt }).toArray();
            
            if (!cartData || cartData.length === 0) {
                return res.status(400).json({ message: "Cannot checkout with an empty cart." });
            }

            // 1. Capture order details
            const allProducts = await db.products().find({}).toArray();
            const totals = calculateTotals(cartData, allProducts);

            // 2. Generate Mock Receipt
            const receipt = {
                orderId: Math.floor(Math.random() * 1000000),
                timestamp: new Date().toISOString(),
                customer: { name, email, userId: userIdInt },
                totalPaid: totals.grandTotal,
                items: totals.items,
            };
            
            // 3. Clear the cart (Critical step for assignment completion)
            await db.cart().deleteMany({ userId: userIdInt }); 

            // Success response
            res.status(200).json({
                message: "Checkout successful!",
                receipt: receipt,
            });
        } catch (error) {
            console.error('Checkout error:', error);
            res.status(500).json({ message: "Checkout failed due to server or database error." });
        }
    });

    return router;
};