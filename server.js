require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// VSPhone API credentials
const API_KEY = process.env.VSPHONE_API_KEY;
const API_SECRET = process.env.VSPHONE_API_SECRET;

// Helper to call VSPhone API
async function callVsphoneApi(endpoint, payload = {}) {
    const API_BASE = 'https://cloud.vsphone.com/vsphone/api/padApi/';
    try {
        const response = await axios.post(API_BASE + endpoint, payload, {
            headers: {
                'X-API-KEY': API_KEY,
                'X-API-SECRET': API_SECRET,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (err) {
        console.error(err.response?.data || err.message);
        return { error: 'VSPhone API call failed' };
    }
}

// Get list of phones
app.get('/api/phones', async (req, res) => {
    const data = await callVsphoneApi('userPadList');
    // VSPhone may return list under data.list or data.data.list
    const list = data.list || (data.data && data.data.list) || [];
    res.json(list);
});

// Start interactive session
app.post('/api/start-session', async (req, res) => {
    const { phoneId } = req.body;
    if (!phoneId) return res.status(400).json({ error: 'phoneId required' });
    const payload = { padId: phoneId };
    const data = await callVsphoneApi('startSession', payload);
    res.json(data);
});

// Send input to phone
app.post('/api/send-input', async (req, res) => {
    const { phoneId, type, x, y, x2, y2, text } = req.body;
    if (!phoneId || !type) return res.status(400).json({ error: 'phoneId and type required' });
    const payload = { padId: phoneId, type, x, y, x2, y2, text };
    const data = await callVsphoneApi('sendInput', payload);
    res.json(data);
});

app.listen(port, () => console.log(`Server running on port ${port}`));
