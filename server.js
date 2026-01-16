import express from "express";
import fetch from "node-fetch";
import CryptoJS from "crypto-js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

// Serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Sign VSPhone requests per docs
function signVSPhone(method, pathUrl, body, accessKey, secretKey) {
  const host = "api.vsphone.com";
  const xDate = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const bodyStr = body ? JSON.stringify(body) : "";
  const hashedBody = CryptoJS.SHA256(bodyStr).toString(CryptoJS.enc.Hex);

  // Canonical request
  const canonicalHeaders = 
    `content-type:application/json\nhost:${host}\nx-date:${xDate}\nx-content-sha256:${hashedBody}\n`;
  const signedHeaders = "content-type;host;x-content-sha256;x-date";
  
  const canonicalRequest = [
    method.toUpperCase(),
    pathUrl,
    "",  // no query
    canonicalHeaders,
    signedHeaders,
    hashedBody
  ].join("\n");

  const stringToSign = [
    "HMAC-SHA256",
    xDate,
    CryptoJS.SHA256(canonicalRequest).toString(CryptoJS.enc.Hex)
  ].join("\n");

  const signature = CryptoJS.HmacSHA256(stringToSign, secretKey).toString(CryptoJS.enc.Hex);
  return {
    "Content-Type": "application/json",
    "x-date": xDate,
    "x-host": host,
    "authorization": `HMAC-SHA256 Credential=${accessKey}, SignedHeaders=${signedHeaders}, Signature=${signature}`
  };
}

// LIST CLOUD PHONES
app.post("/api/devices", async (req, res) => {
  const accessKey = process.env.VSPHONE_ACCESS_KEY;
  const secretKey = process.env.VSPHONE_SECRET_KEY;
  if (!accessKey || !secretKey) return res.status(500).json({ error: "Missing credentials" });

  const pathUrl = "/vsphone/api/padApi/userPadList";
  const body = { padCode: null, equipmentIds: [] };

  const headers = signVSPhone("POST", pathUrl, body, accessKey, secretKey);

  try {
    const response = await fetch(`https://api.vsphone.com${pathUrl}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });
    const json = await response.json();
    res.json(json.data || []);
  } catch (err) {
    console.error("LIST DEVICES ERROR:", err);
    res.status(500).json({ error: "Failed to list devices" });
  }
});

// GET STS TOKEN FOR PAD
app.post("/api/sts", async (req, res) => {
  const { padCode } = req.body;
  const accessKey = process.env.VSPHONE_ACCESS_KEY;
  const secretKey = process.env.VSPHONE_SECRET_KEY;
  if (!padCode) return res.status(400).json({ error: "padCode required" });

  const pathUrl = "/vsphone/api/padApi/stsTokenByPadCode";
  const body = { padCode };

  const headers = signVSPhone("POST", pathUrl, body, accessKey, secretKey);

  try {
    const response = await fetch(`https://api.vsphone.com${pathUrl}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });
    const json = await response.json();
    res.json(json.data || {});
  } catch (err) {
    console.error("STS ERROR:", err);
    res.status(500).json({ error: "Failed to get STS token" });
  }
});

app.listen(PORT, () => console.log(`VSPhone API proxy running on ${PORT}`));
