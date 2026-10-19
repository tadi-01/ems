import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// Sends only safe user details back to the client after authentication.
function createUserResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
}

// Registers a new user after checking the required fields and email uniqueness.
// Everyone who registers here becomes an Employee, and any role sent by the
// browser is ignored. An Admin is made with the setup script
// (server/utils/createAdmin.js), never from the public form.
async function registerUser(request, response) {
  try {
    const { name, password } = request.body;
    const email = typeof request.body.email === "string" ? request.body.email.trim().toLowerCase() : "";
    const phone = typeof request.body.phone === "string" ? request.body.phone.trim() : "";

    if (typeof name !== "string" || !name.trim() || !email || !phone || typeof password !== "string" || password.length < 6 || Buffer.byteLength(password) > 72) {
      response
        .status(400)
        .json({ message: "Enter a name, email and password of 6 to 72 bytes." });
      return;
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      response
        .status(400)
        .json({ message: "An account with this email already exists." });
      return;
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: "Employee",
    });
    response
      .status(201)
      .json({
        user: createUserResponse(user),
        token: generateToken(user._id, user.role),
      });
  } catch (error) {
    response.status(error.code === 11000 || error.name === "ValidationError" ? 400 : 500).json({ message: "Registration failed. Check your details or use another email." });
  }
}

// Logs in a user when the email and password match.
async function loginUser(request, response) {
  try {
    const { password } = request.body;
    const email = typeof request.body.email === "string" ? request.body.email.trim().toLowerCase() : "";
    if (!email || typeof password !== "string" || !password) {
      response.status(400).json({ message: "Email and password are required." });
      return;
    }
    const user = await User.findOne({ email });

    if (!user || !(await user.checkPassword(password))) {
      response.status(401).json({ message: "Email or password is incorrect." });
      return;
    }

    response.json({
      user: createUserResponse(user),
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    response.status(500).json({ message: "Login failed." });
  }
}

// Returns the token details after the middleware has verified the JWT.
function getCurrentUser(request, response) {
  response.json({ user: request.user });
}

export { registerUser, loginUser, getCurrentUser };
