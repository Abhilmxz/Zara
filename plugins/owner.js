const { OWNER_NUMBER } = require("../lib/permissions");
const fs = require("fs");
const path = require("path");
const matchCommand = require("../lib/matchCommand");

module.exports = async (sock, msg) => {
  const from = msg.key.remoteJid;
  const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
  if (!matchCommand(text, "owner")) return;

  const mentionJid = OWNER_NUMBER + "@s.whatsapp.net";
  const imagePath = path.join(__dirname, "../media/owner.jpg");

  let image;
  try {
    image = fs.existsSync(imagePath)
      ? fs.readFileSync(imagePath)
      : { url: "https://telegra.ph/file/5e6e547a38fd5dc5d1664.jpg" }; // fallback image
  } catch {
    image = { url: "https://telegra.ph/file/5e6e547a38fd5dc5d1664.jpg" };
  }

  const caption = `╭───────────────◆
│      👑 *Bot Owner Info* 👑
├───────────────◆
│ 🧑‍💻 *Name*   : Abhilmxz
│ 📞 *Number* : wa.me/${OWNER_NUMBER}
│ 🌐 *GitHub* : github.com/abhilmxz
│ 💌 *Support*: Coming soon...
╰───────────────◆

*Thanks for using Zara Bot! 🦋*`;

  await sock.sendMessage(from, {
    image,
    caption,
    mentions: [mentionJid],
  }, { quoted: msg });
};
