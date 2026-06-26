import fs from "fs";
import path from "path";
import bcryptjs from "bcryptjs";

// Manually parse .env.local if present FIRST before imports
try {
  const envLocalPath = path.join(__dirname, "../.env.local");
  if (fs.existsSync(envLocalPath)) {
    const content = fs.readFileSync(envLocalPath, "utf8");
    for (const line of content.split("\n")) {
      const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    }
  }
} catch (e) {
  console.error("Error reading .env.local:", e);
}

// Now dynamically import connectDB and User
async function main() {
  const { connectDB } = await import("../src/lib/db");
  const { User } = await import("../src/models");

  console.log("Connecting to Database...");
  await connectDB();
  console.log("Connected. MONGODB_URI:", process.env.MONGODB_URI);

  const users = await User.find({}).lean();
  console.log(`Found ${users.length} users in the database.`);
  for (const u of users) {
    console.log(`- Email: ${u.email}, Name: ${u.name}, Role: ${u.role}`);
    if (u.email === "admin@zfr.com" || u.role === "admin") {
      const match = await bcryptjs.compare("admin123", u.passwordHash);
      console.log(`  Password hash in DB: ${u.passwordHash}`);
      console.log(`  Does it match 'admin123'? ${match}`);
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
