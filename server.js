require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve index.html directly from the root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// VSPhone API credentials
const API_URL = 'https://cloud.vsphone.com/vsphone/api/padApi/userPadList';
const API_KEY = process.env.VSPHONE_API_KEY;
const API_SECRET = process.env.VSPHONE_API_SECRET;

// Call VSPhone API
async function callVsphoneApi() {
    try {
        const payload = {}; // Add payload according to VSPhone API docs
        const response = await axios.post(API_URL, payload, {
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': API_KEY,
                'X-API-SECRET': API_SECRET
            }
        });
        return response.data;
    } catch (err) {
        console.error(err.response?.data || err.message);
        return { error: 'Failed to fetch cloud phones' };
    }
}

// API endpoint for frontend
app.get('/api/phones', async (req, res) => {
    const data = await callVsphoneApi();
    res.json(data);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
