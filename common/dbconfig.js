const mongoose = require("mongoose");

const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.mongodb_uri);
    console.log("MongoDB connection established successfully.");
  } catch (error) {
    console.error("Unable to connect to MongoDB:", error);
    throw error;
  }
};

module.exports = { connectToDb };
