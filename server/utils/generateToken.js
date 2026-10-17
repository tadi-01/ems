import jwt from "jsonwebtoken";

// Creates a JWT containing the user's id and role for protected requests.
function generateToken(userId, role) {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
}

export default generateToken;
