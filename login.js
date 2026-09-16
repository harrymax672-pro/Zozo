const { makeSession } = require("../_lib/auth");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({error:"Method not allowed"});

  const { password } = req.body || {};
  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({error:"ADMIN_PASSWORD is not configured"});
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({error:"Incorrect password."});
  }

  const token = makeSession();
  res.setHeader(
    "Set-Cookie",
    `frutza_admin=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=43200`
  );
  return res.status(200).json({ok:true});
};
