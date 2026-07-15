import { MongoMemoryServer } from "mongodb-memory-server";
import { spawn } from "child_process";

async function main() {
  console.log("Starting MongoDB Memory Server...");
  // Disk-backed storage: keeps data out of RAM on low-memory machines
  const mongod = await MongoMemoryServer.create({
    instance: { storageEngine: "wiredTiger" },
  });
  const uri = mongod.getUri() + "zfr-ecommerce";
  console.log("MongoDB running at:", uri);

  // Run seed as child process
  console.log("Seeding database...");
  await new Promise<void>((resolve, reject) => {
    const seed = spawn("npx", ["tsx", "scripts/seed.ts"], {
      stdio: "inherit",
      env: { ...process.env, MONGODB_URI: uri },
    });
    seed.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Seed exited with code ${code}`));
    });
  });

  console.log("Starting Next.js dev server...");
  const nextDev = spawn("npx", ["next", "dev"], {
    stdio: "inherit",
    env: {
      ...process.env,
      MONGODB_URI: uri,
      NODE_OPTIONS: "--max-old-space-size=2048",
    },
  });

  nextDev.on("close", (code) => {
    console.log(`Next.js dev server exited with code ${code}`);
    mongod.stop();
    process.exit(code || 0);
  });
}

main().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
