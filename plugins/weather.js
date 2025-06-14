const axios = require("axios");
const matchCommand = require("../lib/matchCommand");

module.exports = async (sock, msg) => {
  const from = msg.key.remoteJid;
  const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
  if (!matchCommand(text, "weather")) return;

  const city = text.slice(text.indexOf("weather") + 7).trim();
  if (!city) return sock.sendMessage(from, { text: "🌦️ *Usage:* .weather <city>" }, { quoted: msg });

  try {
    const res = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=3`);
    await sock.sendMessage(from, { text: `🌤️ ${res.data}` }, { quoted: msg });
  } catch {
    await sock.sendMessage(from, { text: "❌ Couldn't fetch weather." }, { quoted: msg });
  }
};
