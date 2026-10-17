import jwt from "jsonwebtoken";

// Checks the bearer token and adds the logged-in user details to the request.
function protectRoute(request, response, next) {
  const authorization = request.headers.authorization;
  const token = authorization?.startsWith("Bearer ")
    ? authorization.split(" ")[1]
    : null;

  if (!token) {
    response.status(401).json({ message: "Please log in first." });
    return;
  }

  try {
    request.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    response.status(401).json({ message: "The login token is not valid." });
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
