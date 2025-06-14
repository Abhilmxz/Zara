const axios = require("axios");
const matchCommand = require("../lib/matchCommand");

module.exports = async (sock, msg) => {
  const from = msg.key.remoteJid;
  const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
  if (!matchCommand(text, "joke")) return;

  try {
    const { data } = await axios.get("https://v2.jokeapi.dev/joke/Any?type=single&blacklistFlags=nsfw,racist,sexist");
    
    const joke = data.joke || "🤔 No joke found, try again!";
    await sock.sendMessage(from, {
      text: `😂 *Joke of the moment:*\n\n${joke}`
    }, { quoted: msg });

  } catch (err) {
    console.error("❌ Joke API error:", err);
    await sock.sendMessage(from, { text: "❌ Couldn't fetch a joke." }, { quoted: msg });
  }
};
