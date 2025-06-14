const { isOwner } = require("../lib/permissions");
const matchCommand = require("../lib/matchCommand");

module.exports = async (sock, msg) => {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;

  if (!matchCommand(text, "ban")) return;

  const owner = await isOwner(sender);
  if (!owner) {
    return sock.sendMessage(from, {
      text: "❌ *Only the bot owner can use this command.*"
    }, { quoted: msg });
  }

  await sock.sendMessage(from, {
    text: "🚫 *Ban executed successfully (demo)*"
  }, { quoted: msg });
};
