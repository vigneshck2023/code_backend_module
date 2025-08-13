const mongoose = require("mongoose");

const initializeDatabase = async () => {
    if (!process.env.MONGODB) {
        throw new Error("MONGODB environment variable is missing");
    }
    try {
        await mongoose.connect(process.env.MONGODB, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        throw error; // Let Vercel logs show the real reason
    }
};

module.exports = { initializeDatabase };
