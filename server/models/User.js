import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, default: "", trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["Admin", "HR", "Employee"],
      default: "Employee",
    },
  },
  { timestamps: true },
);

// Hashes a password before saving it so plain passwords are not stored.
userSchema.pre("save", async function savePassword(next) {
  if (!this.isModified("password")) {
    next();
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Checks whether a login password matches the saved password hash.
userSchema.methods.checkPassword = function checkPassword(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
