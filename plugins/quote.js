const axios = require("axios");
const matchCommand = require("../lib/matchCommand");

module.exports = async (sock, msg) => {
  const from = msg.key.remoteJid;
  const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
  if (!matchCommand(text, "quote")) return;

  try {
    const { data } = await axios.get("https://zenquotes.io/api/random");
    const quote = data[0];
    await sock.sendMessage(from, {
      text: `🧠 _${quote.q}_\n— *${quote.a}*`,
    }, { quoted: msg });
  } catch {
    await sock.sendMessage(from, { text: "❌ Couldn't fetch quote." }, { quoted: msg });
  }
};