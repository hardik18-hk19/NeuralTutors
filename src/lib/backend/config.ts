import { TextEncoder } from "util";

export const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

export const JWT_EXPIRES_IN = "7d"; // 7 days for "Remember me"
export const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
export const MAX_REQUESTS_PER_WINDOW = 3;
export const VERIFICATION_CODE_EXPIRY = 10 * 60 * 1000; // 10 minutes

// Test School Management
export const TEST_SCHOOL = {
  name: "Test School",
  id: crypto.randomUUID().substring(0, 8).toUpperCase(),
  userId: "test_user",
  email: "test@example.com",
};
