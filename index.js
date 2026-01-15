const Discord = require('discord.js');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// ----- Discord Bot Setup -----
const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent
    ]
});

const YOUR_BOT_TOKEN = process.env.BOT_TOKEN; // You'll set this secret on Render

client.once('ready', () => {
    console.log(`✅ Bot logged in as ${client.user.tag}`);
});

client.on('messageCreate', async message => {
    // Ignore messages from other bots
    if (message.author.bot) return;

    // Example command: !scroll
    if (message.content === '!scroll') {
        await message.reply('Sending scroll command to phone...');
        // The bot logic here simply responds. The actual command will be sent
        // when your app calls the POST endpoint below.
        // You can add logic to log who triggered the command, etc.
    }
});

client.login(YOUR_BOT_TOKEN);

// ----- Express Web Server -----
// This allows your Android app to trigger actions via a POST request
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Phone Control Bot is running.');
});

// Your Android app will send a POST request to this URL
app.post('/trigger-action', (req, res) => {
    const action = req.body.action; // e.g., { "action": "scroll" }
    console.log(`Action received from app: ${action}`);
    // Here you would add logic to forward this to Discord, if needed.
    res.json({ status: 'success', action: action });
});

app.listen(port, () => {
    console.log(`Web server listening on port ${port}`);
});
