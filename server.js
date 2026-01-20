import express from "express";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const BASE_URL =
  process.env.ARM_BASE_URL || "https://openapi-hk.armcloud.net";

// ✅ Serve ArmCloud SDK from node_modules FIRST
app.use(
  "/armcloud",
  express.static(path.join(__dirname, "node_modules/armcloud-rtc/dist"))
);

// ✅ Serve frontend files
app.use(express.static(__dirname));

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
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Token error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch token" });
  }
});

// ✅ Catch-all for frontend routing
app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`vsPhone web running on port ${PORT}`);
});
