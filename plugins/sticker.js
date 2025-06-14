const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const matchCommand = require("../lib/matchCommand");

module.exports = async (sock, msg) => {
  const from = msg.key.remoteJid;
  const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

  if (!matchCommand(text, "sticker")) return;

  if (!quoted) {
    return sock.sendMessage(from, {
      text: "⚠️ *Reply to an image or short video (≤10s) to create a sticker.*",
    }, { quoted: msg });
  }

  const type = Object.keys(quoted)[0];
  if (!["imageMessage", "videoMessage"].includes(type)) {
    return sock.sendMessage(from, {
      text: "❌ *Only image or short video messages are supported.*",
    }, { quoted: msg });
  }

  try {
    const media = quoted[type];
    const stream = await downloadContentFromMessage(media, type === "imageMessage" ? "image" : "video");

    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    const sticker = new Sticker(buffer, {
      pack: "Zara Bot",
      author: "Abhilmxz",
      type: StickerTypes.FULL,
    });

    const stickerBuffer = await sticker.toBuffer();

    await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });

  } catch (err) {
    console.error("❌ Sticker error:", err);
    await sock.sendMessage(from, {
      text: "❌ Failed to create sticker.",
    }, { quoted: msg });
  }
};
