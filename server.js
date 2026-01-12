require('dotenv').config();
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// REQUIRED ENV VARS
const ACCESS_KEY = process.env.VSPHONE_ACCESS_KEY;
const SECRET_KEY = process.env.VSPHONE_SECRET_KEY;
const FREE_PAD_CODE = process.env.FREE_PAD_CODE;
const FREE_PASSWORD = process.env.FREE_PASSWORD;

const API_HOST = 'https://api.vsphone.com';

// SIGN FUNCTION (VSPhone compliant)
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

    const signValue = sign(params);

    const form = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => form.append(k, v));
    form.append('sign', signValue);

    const response = await axios.post(
      `${API_HOST}/vsphone/api/padApi/stsTokenByPadCode`,
      form.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    res.json(response.data.data);
  } catch (err) {
    console.error('VSPhone Error:', err.response?.data || err.message);
    res.status(500).json({ error: 'VSPhone API error' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
