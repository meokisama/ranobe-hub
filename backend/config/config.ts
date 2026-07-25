// Validate required environment variables
const requiredEnvVars = ["JWT_SECRET", "ADMIN_PASSWORD"];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`ERROR: Missing required environment variable: ${varName}`);
    console.error("Please check your .env file and ensure all required variables are set.");
    process.exit(1);
  }
});

// Validate JWT_SECRET strength
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.warn("WARNING: JWT_SECRET should be at least 32 characters long for security.");
}

interface AppConfig {
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  ADMIN_PASSWORD: string;
  RATE_LIMIT_WINDOW: number;
  RATE_LIMIT_MAX: number;
}

// Validated above, so guaranteed to exist; cast to string.
const config: AppConfig = {
  JWT_SECRET: process.env.JWT_SECRET as string,
  JWT_EXPIRES_IN: "24h",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD as string,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 5, // 5 attempts
};

export default config;
