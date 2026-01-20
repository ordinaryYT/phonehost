import express from "express";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// ✅ Serve everything in root (index.html + index.es.js)
app.use(express.static(__dirname));

const BASE_URL =
  process.env.ARM_BASE_URL || "https://openapi-hk.armcloud.net";

// 🔐 Token API
app.get("/api/token", async (req, res) => {
  try {
    const { padCode, userId } = req.query;

    if (!padCode || !userId) {
      return res.status(400).json({ error: "Missing padCode or userId" });
    }

    const response = await axios.post(
      `${BASE_URL}/vcpcloud/api/padApi/stsToken`,
      { padCode, userId },
      {
        headers: {
          accessKey: process.env.ARM_ACCESS_KEY,
          secretKey: process.env.ARM_SECRET_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    res.json(response.data);
  } catch (e) {
    console.error(e.response?.data || e.message);
    res.status(500).json({ error: "Token error" });
  }
});

// Catch-all
app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(process.env.PORT || 3000, () => {
  console.log("vsPhone web running");
});
