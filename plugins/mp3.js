const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const fs = require("fs");
const path = require("path");
const matchCommand = require("../lib/matchCommand");

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

module.exports = async (sock, msg) => {
  const from = msg.key.remoteJid;
  const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

  if (!matchCommand(text, "mp3")) return;

  if (!quoted || (!quoted.videoMessage && !quoted.audioMessage)) {
    return sock.sendMessage(from, {
      text: "⚠️ *Reply to a video or voice note to convert it to mp3.*"
    }, { quoted: msg });
  }

  const type = quoted.videoMessage ? "video" : "audio";
  const media = quoted[`${type}Message`];

  try {
    const stream = await downloadContentFromMessage(media, type);

    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    const inputPath = path.join(__dirname, "../media/input." + (type === "video" ? "mp4" : "ogg"));
    const outputPath = path.join(__dirname, "../media/output.mp3");

    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

    fs.writeFileSync(inputPath, buffer);

    ffmpeg(inputPath)
      .audioCodec("libmp3lame")
      .format("mp3")
      .save(outputPath)
      .on("end", async () => {
        const audio = fs.readFileSync(outputPath);
        await sock.sendMessage(from, {
          document: audio,
          mimetype: "audio/mpeg",
          fileName: "converted.mp3"
        }, { quoted: msg });

        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      })
      .on("error", async (err) => {
        console.error("❌ FFmpeg Error:", err);
        await sock.sendMessage(from, {
          text: "❌ Conversion failed.",
        }, { quoted: msg });
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      });

  } catch (err) {
    console.error("❌ MP3 conversion error:", err);
    await sock.sendMessage(from, {
      text: "❌ Failed to convert to mp3.",
    }, { quoted: msg });
  }
};
