import mongoose from "mongoose";

// Keeps a sensitive change and its audit record atomic; requires a replica set.
async function transaction(work) {
  return mongoose.connection.transaction(work);
}
export default transaction;
