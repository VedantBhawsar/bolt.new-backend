import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import mongoose from "mongoose";
import { CONSTANTS } from "../constants";
import { asyncHandler, ApiError } from "../middleware/errorMiddleware";

// Function to generate JWT token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, CONSTANTS.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /auth/register
// @access  Public
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  console.log("Registration attempt for email:", email);

  // Validation
  if (!name || !email || !password) {
    throw new ApiError(400, "Please provide all required fields");
  }

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new ApiError(400, "User already exists");
  }

  try {
    // Create user with plain password
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      console.log("User created successfully:", user.email);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      });
    } else {
      throw new ApiError(400, "Invalid user data");
    }
  } catch (error) {
    console.error("Error during user registration:", error);
    throw new ApiError(500, "Registration failed");
  }
});

// @desc    Authenticate a user
// @route   POST /auth/login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log("Login attempt with email:", email);
  console.log("Password provided (length):", password?.length || 0);

  // Validation
  if (!email || !password) {
    throw new ApiError(400, "Please provide email and password");
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      console.log("User not found with email:", email);
      throw new ApiError(401, "Invalid credentials");
    }

    // Type-safe access to mongoose document properties
    const userId =
      user._id instanceof mongoose.Types.ObjectId
        ? user._id.toString()
        : String(user._id);
    // Check if password is correct
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      throw new ApiError(401, "Invalid credentials");
    }

    const token = generateToken(userId);

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Login failed");
  }
});

// @desc    Get current user profile
// @route   GET /auth/me
// @access  Private
export const getCurrentUser = asyncHandler(
  async (req: Request & { userId?: string }, res: Response) => {
    if (!req.userId) {
      throw new ApiError(401, "Not authorized");
    }

    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res.json(user);
  }
);
