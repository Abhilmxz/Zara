const { Sticker } = require("wa-sticker-formatter");
const nodeHtmlToImage = require("node-html-to-image");
const matchCommand = require("../lib/matchCommand");

module.exports = async (sock, msg) => {
  const from = msg.key.remoteJid;
  const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
  if (!matchCommand(text, "attp")) return;

  const input = text.slice(text.indexOf("attp") + 4).trim();
  if (!input) {
    return sock.sendMessage(from, { text: "✏️ *Usage:* `.attp your text here`" }, { quoted: msg });
  }

  try {
    const imageBuffer = await nodeHtmlToImage({
      html: `
        <html>
          <body style="width: 512px; height: 512px; display: flex; align-items: center; justify-content: center; background: #202124;">
            <span style="font-size: 40px; color: white; font-family: Arial; text-align: center;">${input}</span>
          </body>
        </html>
      `,
      type: "png",
      quality: 100,
      encoding: "buffer",
    });

    const sticker = new Sticker(imageBuffer, {
      pack: "Zara",
      author: "Abhilmxz",
      type: "full",
    });

    const stickerBuffer = await sticker.toBuffer();
    await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });

  } catch (e) {
    console.error("❌ ATTP Error:", e);
    await sock.sendMessage(from, { text: "❌ Couldn't generate sticker." }, { quoted: msg });
  }
};
