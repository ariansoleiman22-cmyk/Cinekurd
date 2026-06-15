// Securely writes a new DB password into the .env connection URLs (URL-encoded).
// The password is read from the PW env var so it never appears in your command or shell history.
import { readFileSync, writeFileSync } from "node:fs";

const pw = process.env.PW || "";
if (!pw) {
  console.error("No password provided. Re-run and paste your password when prompted.");
  process.exit(1);
}
const enc = encodeURIComponent(pw);
const USER = "postgres.vasvyphmqmiwgmsekgsi";
const HOST = "@aws-1-ap-northeast-1.pooler.supabase.com";
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

let env = readFileSync(".env", "utf8");
let n = 0;
env = env.replace(
  new RegExp("(" + esc(USER) + ":)([\\s\\S]*?)(" + esc(HOST) + ")", "g"),
  (_m, a, _b, c) => {
    n++;
    return a + enc + c;
  },
);
writeFileSync(".env", env);
console.log(`✓ Updated ${n} connection URL(s) with the new password.`);
