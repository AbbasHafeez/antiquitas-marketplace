const { createClient } = require("redis");

const redis = createClient();

redis.on("error", (err) => console.error("❌ Redis Error:", err));

(async () => {
  await redis.connect();
  console.log("🔌 Redis Connected");
})();

module.exports = redis;
