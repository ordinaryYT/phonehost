import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/*
  This endpoint supplies the H5 SDK
  with VSPhone connection data.
*/
app.post("/api/connect", async (req, res) => {
  // REQUIRED ENV VARIABLES
  const appId = process.env.VSPHONE_APP_ID;
  const roomCode = process.env.VSPHONE_ROOM_CODE;
  const token = process.env.VSPHONE_STS_TOKEN;

  if (!appId || !roomCode || !token) {
    return res.status(500).json({
      error: "Missing VSPhone ENV variables"
    });
  }

  res.json({
    appId,
    roomCode,
    token,
    deviceInfo: {
      platform: "android"
    }
  });
});

app.listen(PORT, () => {
  console.log(`VSPhone server running on ${PORT}`);
});
