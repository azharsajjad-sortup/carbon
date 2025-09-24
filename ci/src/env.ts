import * as dotenv from "dotenv";
dotenv.config();

const mask = (value?: string): string =>
  value ? `${value.slice(0, 6)}… (len:${value.length})` : "EMPTY";

const SUPABASE_URL = process.env.SUPABASE_URL as string;
console.log("SUPABASE_URL", SUPABASE_URL || "EMPTY");
const SUPABASE_SERVICE_ROLE_KEY = process.env
  .SUPABASE_SERVICE_ROLE_KEY as string;
console.log(
  "SUPABASE_SERVICE_ROLE_KEY",
  mask(process.env.SUPABASE_SERVICE_ROLE_KEY)
);
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN as string;
console.log("SUPABASE_ACCESS_TOKEN", mask(process.env.SUPABASE_ACCESS_TOKEN));
const SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID = process.env
  .SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID as string;
console.log(
  "SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID",
  mask(process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID)
);
const SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET = process.env
  .SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET as string;
console.log(
  "SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET",
  mask(process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET)
);
const SUPABASE_AUTH_EXTERNAL_GOOGLE_REDIRECT_URI = process.env
  .SUPABASE_AUTH_EXTERNAL_GOOGLE_REDIRECT_URI as string;
console.log(
  "SUPABASE_AUTH_EXTERNAL_GOOGLE_REDIRECT_URI",
  SUPABASE_AUTH_EXTERNAL_GOOGLE_REDIRECT_URI || "EMPTY"
);

// Optional: surface whether step debug is enabled in Actions without leaking anything
console.log(
  "ACTIONS_STEP_DEBUG",
  process.env.ACTIONS_STEP_DEBUG ? "ENABLED" : "DISABLED"
);

if (!SUPABASE_ACCESS_TOKEN) throw new Error("Missing SUPABASE_ACCESS_TOKEN");
if (!SUPABASE_URL) throw new Error("Missing SUPABASE_URL");
if (!SUPABASE_SERVICE_ROLE_KEY)
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

export {
  SUPABASE_ACCESS_TOKEN,
  SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID,
  SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET,
  SUPABASE_AUTH_EXTERNAL_GOOGLE_REDIRECT_URI,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
};
