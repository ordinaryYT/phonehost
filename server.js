require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// VSPhone credentials
const API_KEY = process.env.VSPHONE_API_KEY;
const API_SECRET = process.env.VSPHONE_API_SECRET;

// Helper to call VSPhone API
async function callVsphoneApi(endpoint, payload = {}) {
    const API_BASE = "https://api.vsphone.com/vsphone/api/padApi/"; // Correct base
    try {
        const response = await axios.post(API_BASE + endpoint, payload, {
            headers: {
                "X-API-KEY": API_KEY,
                "X-API-SECRET": API_SECRET,
                "Content-Type": "application/json"
            }
        });
        return response.data;
    } catch (err) {
        console.error("VSPhone API Error:", err.response?.data || err.message);
        return null;
    }
}

// Endpoint to get SDK token for a phone
app.post("/api/getToken", async (req, res) => {
    const { phoneId } = req.body;
    if (!phoneId) return res.status(400).json({ error: "phoneId required" });

    const data = await callVsphoneApi("stsTokenByPadCode", { padCode: phoneId });
    if (!data || !data.data || !data.data.token) {
        return res.status(500).json({ error: "Failed to get SDK token", raw: data });
    }

    res.json({ token: data.data.token });
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server running on port 3000");
});
