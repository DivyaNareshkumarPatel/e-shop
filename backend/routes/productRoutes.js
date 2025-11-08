const express = require('express');

module.exports = (db) => {
    const router = express.Router();
    router.post('/', async (req, res) => {
        const { id, name, price, category, imageUrl, description, details } = req.body;

        if (!id || !name || !price || !category || !imageUrl || !description || !details) {
            return res.status(400).json({ message: "All fields are required." });
        }
        
        const productIdInt = parseInt(id); 

        try {
            const productsCollection = db.products();

            const existingProduct = await productsCollection.findOne({ _id: productIdInt });
            if (existingProduct) {
                return res.status(409).json({ message: `Product ID ${id} already exists.` });
            }
            
            const newProduct = {
                _id: productIdInt, 
                name,
                price: parseFloat(price),
                category,
                imageUrl, 
                description,
                details, 
                createdAt: new Date()
            };

            await productsCollection.insertOne(newProduct);
            
            res.status(201).json({ 
                message: "Product added successfully.",
                product: newProduct
            });

        } catch (error) {
            console.error('Product insertion error:', error);
            res.status(500).json({ message: "Server error while adding product." });
        }
    });
    router.get('/', async (req, res) => {
        try {
            const products = await db.products().find({}).toArray();
            const mappedProducts = products.map(p => ({
                id: p._id, 
                name: p.name, 
                price: p.price, 
                category: p.category,
                imageUrl: p.imageUrl,
                description: p.description,
                details: p.details 
            }));
            res.json(mappedProducts);
        } catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).json({ message: "Database error fetching products." });
        }
    });

    return router;
};