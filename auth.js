const crypto = require("crypto");

function secret() {
  if (!process.env.ADMIN_SESSION_SECRET) {
    throw new Error("ADMIN_SESSION_SECRET is not configured");
  }
  return process.env.ADMIN_SESSION_SECRET;
}

function sign(value) {
  return crypto.createHmac("sha256", secret()).update(value).digest("hex");
}

function makeSession() {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 12;
  const payload = `admin.${exp}`;
  return `${payload}.${sign(payload)}`;
}

function validSession(req) {
  const cookie = req.headers.cookie || "";
  const match = cookie.match(/(?:^|;\s*)frutza_admin=([^;]+)/);
  if (!match) return false;
  const token = decodeURIComponent(match[1]);
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [role, exp, sig] = parts;
  if (role !== "admin" || Number(exp) < Math.floor(Date.now()/1000)) return false;
  const expected = sign(`${role}.${exp}`);
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch (_) {
    return false;
  }
}

module.exports = { makeSession, validSession };
