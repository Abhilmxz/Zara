
require("dotenv").config();
const { Boom } = require("@hapi/boom");
const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const pino = require("pino");
const qrcode = require("qrcode-terminal"); // ✅ Add this line
const loadPlugins = require("./pluginHandler");

const startBot = async () => {
  const { state, saveCreds } = await useMultiFileAuthState(process.env.SESSION_FILE);

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    browser: ["Zara", "Chrome", "1.0"],
  });

  // Save session
  sock.ev.on("creds.update", saveCreds);

  // Handle QR & connection updates
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("📱 Scan the QR code below to login:");
      qrcode.generate(qr, { small: true }); // ✅ Proper QR display in terminal
    }

    if (connection === "close") {
      const shouldReconnect = !(
        lastDisconnect?.error instanceof Boom &&
        lastDisconnect.error?.output?.statusCode === 401
      );
      console.log("❌ Connection closed. Reconnecting:", shouldReconnect);
      if (shouldReconnect) startBot();
    }

    if (connection === "open") {
      console.log("✅ Bot is connected to WhatsApp!");
    }
  });

  // Load plugins
  loadPlugins(sock);

  // Handle messages
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg?.message) return;

    global.plugins.forEach((plugin) => {
      try {
        plugin(sock, msg);
      } catch (err) {
        console.error("Plugin error:", err);
      }
    });
  });
};

startBot();
