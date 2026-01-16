import express from "express";
import fetch from "node-fetch";
import CryptoJS from "crypto-js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

// --- VSPhone Helper ---
function signVSPhone(params, secret) {
  const keys = Object.keys(params).sort();
  const canonical = keys.map(k => `${k}=${params[k]}`).join("&");
  return CryptoJS.HmacSHA256(canonical, secret).toString(CryptoJS.enc.Base64);
}

// --- Get list of cloud phones ---
app.get("/api/devices", async (req, res) => {
  const accessKey = process.env.VSPHONE_ACCESS_KEY;
  const secretKey = process.env.VSPHONE_SECRET_KEY;

  if (!accessKey || !secretKey) return res.status(500).json({ error: "Missing credentials" });

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = Math.floor(Math.random() * 1000000);

    const params = {
      AccessKeyId: accessKey,
      Action: "ListDevices",
      Timestamp: timestamp,
      Nonce: nonce
    };
    const signature = signVSPhone(params, secretKey);

    const response = await fetch("https://cloud.vsphone.com/openapi/cloudphone/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...params, Signature: signature })
    });

    const data = await response.json();
    res.json(data.devices || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch devices" });
  }
});

// --- Connect to a specific device ---
app.post("/api/connect", async (req, res) => {
  const { deviceId } = req.body;
  const accessKey = process.env.VSPHONE_ACCESS_KEY;
  const secretKey = process.env.VSPHONE_SECRET_KEY;

  if (!accessKey || !secretKey) return res.status(500).json({ error: "Missing credentials" });

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = Math.floor(Math.random() * 1000000);

    const params = {
      AccessKeyId: accessKey,
      Action: "StartDevice",
      Timestamp: timestamp,
      Nonce: nonce,
      DeviceId: deviceId
    };
    const signature = signVSPhone(params, secretKey);

    const response = await fetch("https://cloud.vsphone.com/openapi/cloudphone/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...params, Signature: signature })
    });

    const data = await response.json();

    res.json({
      appId: 1000000,
      roomCode: data.roomCode,
      token: data.stsToken,
      deviceInfo: { platform: data.platform || "android" }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to start device" });
  }
});

app.listen(PORT, () => console.log(`VSPhone dashboard running on port ${PORT}`));
