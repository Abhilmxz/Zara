const fs = require("fs");
const path = require("path");
const matchCommand = require("../lib/matchCommand");

const quotes = [
  "The greatest glory in living lies not in never falling, but in rising every time we fall. — Nelson Mandela",
  "The way to get started is to quit talking and begin doing. — Walt Disney",
  "Your time is limited, so don't waste it living someone else's life. — Steve Jobs",
  "Life is either a daring adventure or nothing at all. — Helen Keller",
  "Spread love everywhere you go. — Mother Teresa",
  "Success is not final; failure is not fatal: It is the courage to continue that counts. — Winston Churchill",
  "Motivate cheyaan aarkum kayyum ath cheyth kaanikkaaana paad. — Zara 🧜‍♀️",
  "The future belongs to those who believe in the beauty of their dreams. — Eleanor Roosevelt",
  "Keep smiling, because life is a beautiful thing. — Marilyn Monroe",
  "You only pass through this life once, you don't come back for an encore. — Elvis Presley"
];

function formatUptime(ms) {
  const h = Math.floor(ms / (1000 * 60 * 60));
  const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((ms % (1000 * 60)) / 1000);
  return `${h}h ${m}m ${s}s`;
}

let startTime = Date.now();

module.exports = async (sock, msg) => {
  const from = msg.key.remoteJid;
  const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
  if (!matchCommand(text, "alive")) return;

  try {
    const imagePath = path.join(__dirname, "../media/alive.jpg");
    const image = fs.existsSync(imagePath)
      ? fs.readFileSync(imagePath)
      : "https://telegra.ph/file/265c672094dfa87caea19.jpg";

    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    const uptime = formatUptime(Date.now() - startTime);

    const caption = `╭── *🤖 ZARA BOT IS ONLINE* ──╮

🧠 *Status:* 𝙊𝙉𝙇𝙄𝙉𝙀 ✅
⏱️ *Uptime:* ${uptime}
🧑‍💻 *Owner:* Abhilmxz
⚙️ *Mode:* Public
📌 *Prefix:* . / ! / ; / #
📎 *Version:* 2.1

🗨️ *Quote:*
_${quote}_

╰────────────────────────╯`;

    await sock.sendMessage(from, {
      image: typeof image === "string" ? { url: image } : image,
      caption,
    }, { quoted: msg });

  } catch (err) {
    console.error("❌ Alive plugin error:", err);
    await sock.sendMessage(from, { text: "❌ Bot alive check failed." }, { quoted: msg });
  }
};
