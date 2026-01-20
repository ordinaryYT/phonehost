import express from "express";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.static(__dirname));

// ✅ vsPhone API HOST
const BASE_URL = "https://api.vsphone.com";

// ==============================
// Token API (vsPhone)
// ==============================
app.get("/api/token", async (req, res) => {
  try {
    const { padCode, userId } = req.query;

    if (!padCode || !userId) {
      return res.status(400).json({
        error: "padCode and userId are required"
      });
    }

    const response = await axios.post(
      `${BASE_URL}/vcpcloud/api/padApi/stsToken`,
      {
        padCode,
        userId
      },
      {
        headers: {
          "Access-Key": process.env.VSPHONE_ACCESS_KEY,
          "Secret-Key": process.env.VSPHONE_SECRET_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("vsPhone TOKEN ERROR:", err.response?.data || err.message);
    res.status(500).json(err.response?.data || { error: "Token request failed" });
  }
});

// Fallback
app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`vsPhone web running on port ${PORT}`);
});
