const axios = require("axios");
const matchCommand = require("../lib/matchCommand");

module.exports = async (sock, msg) => {
  const from = msg.key.remoteJid;
  const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
  if (!matchCommand(text, "wiki")) return;

  const query = text.slice(text.indexOf("wiki") + 4).trim();
  if (!query) return sock.sendMessage(from, { text: "📚 *Usage:* .wiki <term>" }, { quoted: msg });

  try {
    const res = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
    if (res.data.extract) {
      await sock.sendMessage(from, {
        text: `📖 *${res.data.title}*\n\n${res.data.extract}`,
      }, { quoted: msg });
    } else throw new Error();
  } catch {
    await sock.sendMessage(from, { text: "❌ No wiki page found." }, { quoted: msg });
  }
};