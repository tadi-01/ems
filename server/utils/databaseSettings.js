// Requires an explicit database so setup scripts cannot silently write to test.
function getDatabaseUrl() {
  const value = process.env.MONGO_URI;
  if (!value) throw new Error("Set MONGO_URI with an explicit database name.");
  const url = new URL(value);
  if (!["mongodb:", "mongodb+srv:"].includes(url.protocol) || url.pathname.length < 2) {
    throw new Error("MONGO_URI must include a database name before the query string.");
  }
  return value;
}

export { getDatabaseUrl };
