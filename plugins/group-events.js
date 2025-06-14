const fs = require("fs");
const path = require("path");

// Prevent multiple listeners from being attached
let groupEventsRegistered = false;

module.exports = async (sock) => {
  if (groupEventsRegistered) return;
  groupEventsRegistered = true;

  sock.ev.on("group-participants.update", async (update) => {
    try {
      const metadata = await sock.groupMetadata(update.id);
      const participants = update.participants;

      for (const participant of participants) {
        const user = participant.split("@")[0];
        let ppImage;

        try {
          const url = await sock.profilePictureUrl(participant, "image");
          ppImage = { url };
        } catch {
          ppImage = fs.readFileSync("./media/default.jpg"); // fallback to local image
        }

        if (update.action === "add") {
          const welcomeCaption = `👋 Welcome @${user} to *${metadata.subject}*! 😄\n\nType *menu* to view commands.`;
          await sock.sendMessage(update.id, {
            image: ppImage,
            caption: welcomeCaption,
            mentions: [participant],
          });
        }

        if (update.action === "remove") {
          const byeCaption = `👋 @${user} has left *${metadata.subject}*.\nWe’ll miss you! 😢`;
          await sock.sendMessage(update.id, {
            image: ppImage,
            caption: byeCaption,
            mentions: [participant],
          });
        }
      }
    } catch (err) {
      console.error("❌ group-participants.update error:", err);
    }
  });
};
