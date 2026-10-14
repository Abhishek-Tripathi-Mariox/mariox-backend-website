// const mongoose = require("mongoose");

// const url = process.env.LOCAL_MONGO_DB;
// mongoose.connect(url);

// const con = mongoose.connection;
// // mongoose.set("debug", true);

// con.on("open", () => {
//   console.log("connected to database");
// });

// con.on("error", (error) => {
//   console.error("Error connecting to database:", error);
// });

// module.exports = con;

const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    // const url = "mongodb://localhost:27017/db-mariox";
    const url = process.env.LOCAL_MONGO_DB;

    console.log("⏳ Connecting to MongoDB...", url);

    await mongoose.connect(url, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      autoIndex: false, // Disable auto-indexing for performance
      maxPoolSize: 50, // 🔥 increase pool size for concurrent requests
      minPoolSize: 10,
      serverSelectionTimeoutMS: 5000, // Stop hanging if Mongo isn’t reachable
      socketTimeoutMS: 45000, // Close idle sockets
    });

    const con = mongoose.connection;

    con.on("connected", () => {
      console.log("✅ MongoDB Connected:", url);
    });

    con.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err.message);
    });

    con.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected!");
    });

    // Graceful shutdown on process exit
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("💤 MongoDB connection closed due to app termination");
      process.exit(0);
    });
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
