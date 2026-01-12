require('dotenv').config();
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ENV VARS REQUIRED ON RENDER
const ACCESS_KEY = process.env.VSPHONE_ACCESS_KEY;
const SECRET_KEY = process.env.VSPHONE_SECRET_KEY;
const FREE_PAD_CODE = process.env.FREE_PAD_CODE;
const FREE_PASSWORD = process.env.FREE_PASSWORD;

const API_HOST = 'https://api.vsphone.com';

// SIGN FUNCTION
function sign(params) {
  const sortedKeys = Object.keys(params).sort();
  const query = sortedKeys.map(k => `${k}=${params[k]}`).join('&');

  return crypto
    .createHmac('sha256', SECRET_KEY)
    .update(query)
    .digest('hex');
}

// GET PHONE SESSION
app.post('/get-phone', async (req, res) => {
  const { password } = req.body;

  if (password !== FREE_PASSWORD) {
    return res.status(401).json({ error: 'Wrong password' });
  }

  try {
    const params = {
      accessKeyId: ACCESS_KEY,
      padCode: FREE_PAD_CODE,
      timestamp: Date.now()
    };

    const signature = sign(params);

    const response = await axios.post(
      `${API_HOST}/vsphone/api/padApi/stsTokenByPadCode`,
      { ...params, sign: signature },
      { headers: { 'Content-Type': 'application/json' } }
    );

    res.json(response.data.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'VSPhone API error' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
