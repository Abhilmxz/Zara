const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const matchCommand = require("../lib/matchCommand");

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

module.exports = async (sock, msg) => {
  const from = msg.key.remoteJid;
  const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

  if (!matchCommand(text, "photo") || !quoted?.stickerMessage) return;

  try {
    const inputPath = path.join(__dirname, "../media/sticker.webp");
    const outputPath = path.join(__dirname, "../media/photo.jpg");

    const stream = await downloadContentFromMessage(quoted.stickerMessage, "sticker");
    let buffer = Buffer.from([]);

    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    fs.writeFileSync(inputPath, buffer);

    ffmpeg(inputPath)
      .toFormat("jpg")
      .save(outputPath)
      .on("end", async () => {
        const image = fs.readFileSync(outputPath);
        await sock.sendMessage(from, {
          image,
          caption: "✅ Sticker converted to image."
        }, { quoted: msg });

        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      })
      .on("error", async (err) => {
        console.error("❌ FFmpeg error in photo.js:", err);
        await sock.sendMessage(from, { text: "❌ Conversion failed." }, { quoted: msg });
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      });

  } catch (err) {
    console.error("❌ Error in photo.js:", err);
    await sock.sendMessage(from, { text: "❌ Failed to convert sticker." }, { quoted: msg });
  }
};
