const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI; 
if (!uri) {
    console.error("FATAL ERROR: MONGO_URI is not defined.");
    process.exit(1);
}

const client = new MongoClient(uri);

async function connectToMongo() {
    try {
        console.log('[DB] Attempting connection to MongoDB Atlas...');
        await client.connect();
        return client; 

    } catch (err) {
        console.error('[DB] Failed to connect to MongoDB Atlas:', err);
        process.exit(1); 
    }
}

module.exports = connectToMongo;