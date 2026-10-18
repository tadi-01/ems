import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Checks the bearer token and adds the logged-in user details to the request.
async function protectRoute(request, response, next) {
  const authorization = request.headers.authorization;
  const token = authorization?.startsWith("Bearer ")
    ? authorization.split(" ")[1]
    : null;

  if (!token) {
    response.status(401).json({ message: "Please log in first." });
    return;
  }

  let decoded;
  try { decoded = jwt.verify(token, process.env.JWT_SECRET); }
  catch {
    response.status(401).json({ message: "The login token is not valid." });
    return;
  }
  try {
    const user = await User.findById(decoded.userId).select("name email role");
    if (!user) {
      response.status(401).json({ message: "This account no longer exists." });
      return;
    }
    request.user = { userId: user._id, id: user._id, name: user.name,
      email: user.email, role: user.role };
    next();
  } catch (error) {
    response.status(503).json({ message: "Could not verify your account. Try again shortly." });
  }
}

// Allows only selected roles to use a protected route.
function allowRoles(...allowedRoles) {
  return (request, response, next) => {
    if (!allowedRoles.includes(request.user.role)) {
      response.status(403).json({ message: "You do not have permission." });
      return;
    }

    next();
  };
}

export { protectRoute, allowRoles };
