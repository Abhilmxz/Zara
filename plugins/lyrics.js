const axios = require("axios");
const cheerio = require("cheerio");
const matchCommand = require("../lib/matchCommand");

async function getLyricsFromGenius(query) {
  try {
    const searchUrl = `https://genius.com/api/search/multi?per_page=3&q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(searchUrl);

    const hits = data.response.sections
      .flatMap(section => section.hits)
      .filter(hit => hit.result?.lyrics_path);

    if (!hits.length) return null;

    const song = hits[0].result;
    const lyricsUrl = `https://genius.com${song.lyrics_path}`;
    const lyricsPage = await axios.get(lyricsUrl);

    const $ = cheerio.load(lyricsPage.data);
    const lyrics = $('[data-lyrics-container]').text().trim() || $(".lyrics").text().trim();

    return {
      title: song.full_title,
      lyrics: lyrics || null,
    };
  } catch (err) {
    console.error("🔍 Genius fetch error:", err.message);
    return null;
  }
}

module.exports = async (sock, msg) => {
  const from = msg.key.remoteJid;
  const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
  if (!matchCommand(text, "lyrics")) return;

  const query = text.replace(/^(\/|!|#|;|\.)?lyrics/i, "").trim();
  if (!query) {
    return sock.sendMessage(from, {
      text: "🎶 *Usage:* `.lyrics <song name>`\nExample: `.lyrics see you again`",
    }, { quoted: msg });
  }

  const result = await getLyricsFromGenius(query);

  if (!result || !result.lyrics) {
    return sock.sendMessage(from, {
      text: "❌ *Lyrics not found. Try another song or make the name more specific.*",
    }, { quoted: msg });
  }

  const snippet = result.lyrics.length > 4000
    ? result.lyrics.slice(0, 4000) + "\n\n...(truncated)"
    : result.lyrics;

  await sock.sendMessage(from, {
    text: `🎵 *${result.title}*\n\n${snippet}`,
  }, { quoted: msg });
};
