import bcrypt from "bcrypt";
import { SignJWT, jwtVerify } from "jose";
import {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  RATE_LIMIT_WINDOW,
  MAX_REQUESTS_PER_WINDOW,
} from "./config";
import { JwtPayload } from "./types";

// Rate limiting store
export const rateLimitStore = new Map<
  string,
  { count: number; timestamp: number }
>();

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function generateSchoolId(schoolName: string): string {
  console.log("Generating school ID for:", schoolName);
  // Remove any spaces from the school name first
  const cleanName = schoolName.replace(/\s+/g, "");
  const firstThree = cleanName.substring(0, 3).toUpperCase();
  const randomNum = Math.floor(Math.random() * 10000);
  const paddedNum = randomNum.toString().padStart(4, "0");
  const schoolId = `${firstThree}${paddedNum}`;
  console.log("Generated school ID:", {
    firstThree,
    randomNum,
    paddedNum,
    schoolId,
  });
  return schoolId;
}

export function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(email);

  if (!userLimit) {
    rateLimitStore.set(email, { count: 1, timestamp: now });
    return true;
  }

  if (now - userLimit.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitStore.set(email, { count: 1, timestamp: now });
    return true;
  }

  if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  userLimit.count++;
  return true;
}

export async function createToken(
  payload: JwtPayload,
  rememberMe: boolean = false
) {
  try {
    console.log("Creating token with payload:", {
      ...payload,
      password: payload.password ? "***" : undefined,
    });

    if (!payload || typeof payload !== "object") {
      console.error("Invalid payload:", payload);
      throw new Error("Invalid payload for token creation");
    }

    // Ensure required fields are present
    if (!payload.id || !payload.role) {
      console.error("Missing required fields in payload:", {
        id: payload.id,
        role: payload.role,
      });
      throw new Error("Missing required fields in token payload");
    }

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(rememberMe ? JWT_EXPIRES_IN : "1d")
      .sign(JWT_SECRET);

    console.log("Token created successfully");
    return token;
  } catch (error) {
    console.error("Token creation error:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    throw new Error("Failed to create token");
  }
}

export async function verifyToken(token: string) {
  try {
    if (!token) {
      throw new Error("No token provided");
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload) {
      throw new Error("Invalid token payload");
    }
    return payload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}
