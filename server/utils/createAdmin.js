import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config();

// Creates the first Admin account, or turns an existing account into an Admin.
// Run it once from the server folder with: npm run create-admin
// It reads MONGO_URI, ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD from the .env
// file, so no password is ever written in the code.
async function createAdmin() {
  const { MONGO_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!MONGO_URI || !ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log(
      "Set MONGO_URI, ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in the .env file first.",
    );
    process.exitCode = 1;
    return;
  }

  await mongoose.connect(MONGO_URI);
  const email = ADMIN_EMAIL.trim().toLowerCase();
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    // The person already registered, so only the role changes. Their password
    // is left as it was.
    existingUser.role = "Admin";
    await existingUser.save();
    console.log(`${email} already existed and is now an Admin.`);
    return;
  }

  // The User model hashes the password before saving it.
  await User.create({
    name: ADMIN_NAME,
    email,
    password: ADMIN_PASSWORD,
    role: "Admin",
  });
  console.log(`Admin account created for ${email}.`);
}

// Runs the setup, reports any error, and always closes the database connection.
createAdmin()
  .catch((error) => {
    console.error("Could not create the Admin account:", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
