import { Request, Response, NextFunction } from "express";
import rateLimit, { Options } from "express-rate-limit";
import { CONSTANTS } from "../constants";

// Define different rate limits based on endpoint type
const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many requests, please try again later.",
  },
});

// More strict rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Limit each IP to 5 login/register attempts per windowMs
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many authentication attempts, please try again later.",
  },
});

// Rate limiter for AI generation endpoints
const aiGenerationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10, // Limit each IP to 10 AI generation requests per hour
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    status: "error",
    message:
      "You have reached the limit of AI generation requests. Please try again later or upgrade your plan.",
  },
});

// Project creation/update limiter
const projectLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 20, // Limit each IP to 20 project operations per hour
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    status: "error",
    message:
      "You have reached the project creation/update limit. Please try again later.",
  },
});

/**
 * Apply the appropriate rate limiter based on the request path
 */
export const rateLimitMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const path = req.path;

  // Apply auth rate limiter for authentication routes
  if (path.includes("/auth/login") || path.includes("/auth/register")) {
    return authLimiter(req, res, next);
  }

  // Apply AI generation rate limiter
  if (path.includes("/template") || path.includes("/chat")) {
    return aiGenerationLimiter(req, res, next);
  }

  // Apply project rate limiter
  if (
    path.includes("/projects") &&
    (req.method === "POST" || req.method === "PUT")
  ) {
    return projectLimiter(req, res, next);
  }

  // Apply default rate limiter for all other routes
  return defaultLimiter(req, res, next);
};

// Skip rate limiting for certain scenarios (e.g., in development or for specific IPs)
export const skipRateLimit = (req: Request) => {
  // Skip rate limiting in development
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  // Skip for whitelisted IPs (e.g., your own servers or trusted partners)
  const whitelistedIPs = CONSTANTS.WHITELISTED_IPS || [];
  const clientIP = req.ip || req.socket.remoteAddress;

  return whitelistedIPs.includes(clientIP || "");
};
