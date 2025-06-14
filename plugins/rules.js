const matchCommand = require("../lib/matchCommand");

module.exports = async (sock, msg) => {
  const from = msg.key.remoteJid;
  const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
  if (!matchCommand(text, "rules")) return;

  const caption = `📜 *Zara Bot Usage Rules*

1️⃣ Be respectful to everyone.
2️⃣ Avoid spamming commands repeatedly.
3️⃣ Group moderation commands are for admins only.
4️⃣ Misuse of the bot may result in a ban.
5️⃣ Use commands with love 💖

_Thanks for using Zara!_`;

  await sock.sendMessage(from, { text: caption }, { quoted: msg });
};
