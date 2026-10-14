const redis = require("redis");
require("dotenv").config();

const client = redis.createClient({
  url: `rediss://${process.env.REDIS_URL}`,
});

// Log when the client is ready
client.on("ready", () => {
  console.log("Client connected to Redis and ready to use...");
});

client.on("connect", () => {
  console.log("Connected to Redis...");
});

client.on("reconnecting", () => {
  console.log("Reconnecting to Redis...");
});

client.on("error", (err) => {
  console.error("Redis connection error:", err);
});

client.on("end", () => {
  console.log("Client disconnected from Redis");
});

// Start the connection
client.connect().catch((err) => {
  console.error("Failed to connect to Redis:", err);
});

// module.exports = client;

module.exports = function () {
  const storeOtpInRedis = async (key, otpData, ttl) => {
    const otpDataString = JSON.stringify(otpData);

    await client.set(key, otpDataString, "EX", ttl);
  };

  const getOtpFromRedis = async (key) => {
    const otp = await client.get(key);
    return otp;
  };

  const deleteOtpFromRedis = async (key) => {
    await client.del(key);
  };

  return { storeOtpInRedis, deleteOtpFromRedis, getOtpFromRedis };
};
