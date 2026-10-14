require("dotenv").config();

// ✅ Single file Valkey Serverless client for CommonJS projects
// Compatible with Node 24, Express, and Nodemon

let client = null;

/**
 * Lazily creates or reuses an existing Valkey client
 */
async function getValkeyClient() {
  if (client) return client;

  try {
    // Dynamically import Valkey Glide (ESM-safe)
    const { GlideClusterClient } = await import("@valkey/valkey-glide");

    // Create client connection (TLS required for AWS Serverless)
    client = await GlideClusterClient.createClient({
      addresses: [
        {
          host: process.env.VALKEY_HOST, // e.g. cache-xxxxx.serverless.region.cache.amazonaws.com
          port: Number(process.env.VALKEY_PORT) || 6379,
        },
      ],
      useTLS: true,
      password: process.env.VALKEY_PASSWORD, // optional, only if auth enabled
    });

    console.log("✅ Connected to AWS Valkey Serverless");
    return client;
  } catch (err) {
    console.error("❌ Failed to connect to Valkey Serverless:", err);
    throw err;
  }
}

/**
 * Set data in Valkey with TTL
 */
async function storeInValkey(key, data, ttl = 900) {
  const conn = await getValkeyClient();
  const str = JSON.stringify(data);
  await conn.set(key, str);
  await conn.expire(key, ttl);
  console.log(`💾 Stored key "${key}" in Valkey (TTL ${ttl}s)`);
}

/**
 * Get data from Valkey
 */
async function getFromValkey(key) {
  const conn = await getValkeyClient();
  const value = await conn.get(key);
  console.log(`📦 Retrieved key "${key}" from Valkey`);
  return value ? JSON.parse(value) : null;
}

/**
 * Delete key from Valkey
 */
async function deleteFromValkey(key) {
  const conn = await getValkeyClient();
  await conn.del(key);
  console.log(`🗑️ Deleted key "${key}" from Valkey`);
}

/**
 * Close Valkey connection (optional)
 */
async function closeValkey() {
  if (client) {
    await client.close();
    console.log("🔒 Valkey connection closed");
    client = null;
  }
}

// Export functions for use anywhere in your backend
module.exports = {
  getValkeyClient,
  storeInValkey,
  getFromValkey,
  deleteFromValkey,
  closeValkey,
};
