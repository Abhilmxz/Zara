const matchCommand = require("../lib/matchCommand");

module.exports = async (sock, msg) => {
  const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
  const from = msg.key.remoteJid;

  if (!matchCommand(text, "ping")) return;

  const start = Date.now();

  // Optional delay to simulate "thinking"
  await new Promise(resolve => setTimeout(resolve, 100));

  const end = Date.now();
  const latency = end - start;

  await sock.sendMessage(from, {
    text: `🧸 *Ping!* \n\n📶 *Response Time:* *${latency}ms*`,
  }, { quoted: msg });
};
