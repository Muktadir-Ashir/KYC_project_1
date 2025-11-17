import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

const JWT_SECRET =
  process.env.JWT_SECRET || "your_jwt_secret_key_change_in_env";

// Register new user
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Username or email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ success: false, message: "Error registering user" });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    console.log(`🔍 Login attempt: username=${username}`);

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    // Find user by username
    const user = await User.findOne({ username });

    if (!user) {
      console.log(`❌ User not found: ${username}`);
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    }

    console.log(`✅ User found: ${username}, role: ${user.role}`);

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log(`❌ Password invalid for user: ${username}`);
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    }

    console.log(`✅ Password valid, generating token for: ${username}`);

    // Generate JWT token (expires in 24 hours)
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          userId: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ success: false, message: "Error logging in" });
  }
};

// Get current user info
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching user info" });
  }
};
