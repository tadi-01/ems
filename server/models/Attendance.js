import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    // The day of the record as text in the form YYYY-MM-DD, for example 2026-10-17.
    date: { type: String, required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, default: null },
    // Hours between check-in and check-out, rounded to 2 decimal places.
    workingHours: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

// A unique compound index: MongoDB allows only one record for each
// employee + date pair, so a second check-in on the same day is rejected
// by the database itself (error code 11000), even if two requests arrive together.
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
