import { MongoMemoryServer } from "mongodb-memory-server";
import { spawn } from "child_process";

async function startDev() {
  console.log("Starting MongoDB Memory Server...");
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  console.log("MongoDB Memory Server running at:", uri);

  // Set environment variable
  process.env.MONGODB_URI = uri + "zfr-ecommerce";

  // Run seed
  console.log("Running seed...");
  const seed = await import("./seed");
  
  // Start Next.js dev server
  console.log("Starting Next.js dev server...");
  const nextDev = spawn("npx", ["next", "dev"], {
    stdio: "inherit",
    env: { ...process.env, MONGODB_URI: uri + "zfr-ecommerce" },
  });

  nextDev.on("close", (code) => {
    console.log(`Next.js dev server exited with code ${code}`);
    mongod.stop();
    process.exit(code || 0);
  });
}

startDev().catch((err) => {
  console.error("Failed to start dev environment:", err);
  process.exit(1);
});
