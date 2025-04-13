import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
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

  // Validation
  if (!name || !email || !password) {
    throw new ApiError(400, "Please provide all required fields");
  }

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new ApiError(400, "User already exists");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    });
  } else {
    throw new ApiError(400, "Invalid user data");
  }
});

// @desc    Authenticate a user
// @route   POST /auth/login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    throw new ApiError(400, "Please provide email and password");
  }

  // Check for user
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Check if password matches
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  res.json({
    token: generateToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
  });
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
