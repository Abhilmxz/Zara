const { isAdmin } = require("../lib/permissions");
const matchCommand = require("../lib/matchCommand");

module.exports = async (sock, msg) => {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
  if (!matchCommand(text, "tagall")) return;

  if (!from.endsWith("@g.us")) {
    return sock.sendMessage(from, { text: "⚠️ *This command works in groups only.*" }, { quoted: msg });
  }

  const admin = await isAdmin(sock, from, sender);
  if (!admin) {
    return sock.sendMessage(from, { text: "❌ *Only group admins can use this command.*" }, { quoted: msg });
  }

  try {
    const metadata = await sock.groupMetadata(from);
    const members = metadata.participants.map(p => p.id);

    if (members.length > 256) {
      return sock.sendMessage(from, {
        text: "⚠️ Group too large to tag all members at once.",
      }, { quoted: msg });
    }

    const tagMessage = members.map(u => `@${u.split("@")[0]}`).join(" ");

    await sock.sendMessage(from, {
      text: `📢 *Attention Everyone!*\n\n${tagMessage}`,
      mentions: members,
    }, { quoted: msg });

  } catch (err) {
    console.error("❌ tagall error:", err);
    await sock.sendMessage(from, { text: "❌ Failed to tag members." }, { quoted: msg });
  }
};
