const { validSession } = require("../_lib/auth");

function supabase(path, options = {}) {
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) throw new Error("Supabase environment variables are missing");

  return fetch(`${base}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
}

const PUBLIC_COLUMNS = "id,cat,name,price,offer,emoji,image,desc,stock";

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  try {
    if (req.method === "GET") {
      const r = await supabase(`products?select=${PUBLIC_COLUMNS}&order=cat.asc,name.asc`);
      const text = await r.text();
      if (!r.ok) return res.status(r.status).send(text);
      return res.status(200).json({products: JSON.parse(text)});
    }

    if (!validSession(req)) {
      return res.status(401).json({error:"Admin login required"});
    }

    if (req.method === "POST") {
      const b = req.body || {};
      if (!b.name || !b.cat || !Number.isFinite(Number(b.price))) {
        return res.status(400).json({error:"name, category and valid price are required"});
      }
      const product = {
        id: b.id || `p${Date.now()}`,
        cat: String(b.cat),
        name: String(b.name),
        price: Number(b.price),
        offer: String(b.offer || ""),
        emoji: String(b.emoji || "🍓"),
        image: String(b.image || ""),
        desc: String(b.desc || ""),
        stock: b.stock !== false
      };
      const r = await supabase("products", {
        method:"POST",
        headers:{Prefer:"return=representation"},
        body:JSON.stringify(product)
      });
      const text = await r.text();
      if (!r.ok) return res.status(r.status).send(text);
      return res.status(201).json({product:JSON.parse(text)[0]});
    }

    const id = String((req.query && req.query.id) || "");
    if (!id) return res.status(400).json({error:"Product id is required"});

    if (req.method === "PATCH") {
      const allowed = ["cat","name","price","offer","emoji","image","desc","stock"];
      const patch = {};
      for (const key of allowed) {
        if (req.body && Object.prototype.hasOwnProperty.call(req.body,key)) {
          patch[key] = key === "price" ? Number(req.body[key]) : req.body[key];
        }
      }
      if (!Object.keys(patch).length) return res.status(400).json({error:"No fields to update"});
      if ("price" in patch && !Number.isFinite(patch.price)) {
        return res.status(400).json({error:"Invalid price"});
      }

      const r = await supabase(`products?id=eq.${encodeURIComponent(id)}`, {
        method:"PATCH",
        headers:{Prefer:"return=representation"},
        body:JSON.stringify(patch)
      });
      const text = await r.text();
      if (!r.ok) return res.status(r.status).send(text);
      const rows = JSON.parse(text);
      if (!rows.length) return res.status(404).json({error:"Product not found"});
      return res.status(200).json({product:rows[0]});
    }

    if (req.method === "DELETE") {
      const r = await supabase(`products?id=eq.${encodeURIComponent(id)}`, {
        method:"DELETE",
        headers:{Prefer:"return=minimal"}
      });
      const text = await r.text();
      if (!r.ok) return res.status(r.status).send(text);
      return res.status(200).json({ok:true});
    }

    return res.status(405).json({error:"Method not allowed"});
  } catch (err) {
    console.error(err);
    return res.status(500).json({error:err.message || "Server error"});
  }
};
