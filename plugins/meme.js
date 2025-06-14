const axios = require("axios");
const matchCommand = require("../lib/matchCommand");

module.exports = async (sock, msg) => {
  const from = msg.key.remoteJid;
  const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
  if (!matchCommand(text, "meme")) return;

  try {
    const res = await axios.get("https://meme-api.com/gimme");
    await sock.sendMessage(from, {
      image: { url: res.data.url },
      caption: `🤣 ${res.data.title}\n🌐 r/${res.data.subreddit}`,
    }, { quoted: msg });
  } catch {
    await sock.sendMessage(from, { text: "❌ Failed to fetch meme." }, { quoted: msg });
  }
};