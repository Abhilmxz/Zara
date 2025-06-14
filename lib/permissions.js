const { jidNormalizedUser } = require("@whiskeysockets/baileys");

// 👑 Replace with your actual number (no +)
const OWNER_NUMBER = "919061207461";

async function isOwner(userJid) {
  return jidNormalizedUser(userJid).includes(OWNER_NUMBER);
}

async function isAdmin(sock, jid, userJid) {
  try {
    const groupMetadata = await sock.groupMetadata(jid);
    const adminList = groupMetadata.participants
      .filter((p) => p.admin)
      .map((p) => p.id);
    return adminList.includes(jidNormalizedUser(userJid));
  } catch {
    return false;
  }
}

module.exports = {
  isOwner,
  isAdmin,
  OWNER_NUMBER,
};
