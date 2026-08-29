(() => {
  "use strict";

  const config = window.MELATO_RADIO_CONFIG || {};
  const $ = (id) => document.getElementById(id);
  const ui = {
    audio: $("radioAudio"),
    playButton: $("playButton"),
    muteButton: $("muteButton"),
    volume: $("volume"),
    liveBadge: $("liveBadge"),
    liveLabel: $("liveLabel"),
    artwork: $("artwork"),
    artworkFallback: $("artworkFallback"),
    programName: $("programName"),
    trackTitle: $("trackTitle"),
    artistName: $("artistName"),
    elapsed: $("elapsed"),
    duration: $("duration"),
    progressFill: $("progressFill"),
    statusText: $("statusText"),
    listenerCount: $("listenerCount"),
    currentBlock: $("currentBlock"),
    currentBlockDescription: $("currentBlockDescription"),
    historyList: $("historyList"),
    year: $("year")
  };

  const state = {
    apiUrl: buildNowPlayingUrl(),
    streamUrl: config.fallbackStreamUrl || "",
    startedAt: 0,
    duration: 0,
    refreshTimer: null,
    progressTimer: null
  };

  function buildNowPlayingUrl() {
    const base = String(config.azuraCastBaseUrl || "").replace(/\/$/, "");
    const station = encodeURIComponent(config.stationShortcode || "");
    return base && station ? `${base}/api/nowplaying/${station}` : "";
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainder = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainder}`;
  }

  function setArtwork(url) {
    if (!url) {
      ui.artwork.hidden = true;
      ui.artwork.removeAttribute("src");
      ui.artworkFallback.hidden = false;
      return;
    }
    ui.artwork.src = url;
    ui.artwork.hidden = false;
    ui.artworkFallback.hidden = true;
  }

  function setReady(ready) {
    ui.playButton.disabled = !ready;
    ui.muteButton.disabled = !ready;
    ui.volume.disabled = !ready;
    ui.liveBadge.classList.toggle("is-live", ready);
    ui.liveLabel.textContent = ready ? "LIVE" : "PREVIEW";
  }

  function setPlaying(playing) {
    document.body.classList.toggle("is-playing", playing);
    ui.playButton.setAttribute("aria-label", playing ? "Pause Melato Sound Radio" : "Play Melato Sound Radio");
    ui.statusText.textContent = playing ? "Broadcast playing" : (state.streamUrl ? "Ready to listen" : "Awaiting station endpoint");
  }

  function applyNowPlaying(data) {
    const station = data.station || {};
    const now = data.now_playing || {};
    const song = now.song || {};
    const live = data.live || {};

    state.streamUrl = station.listen_url || config.fallbackStreamUrl || state.streamUrl;
    state.startedAt = Number(now.played_at || 0);
    state.duration = Number(now.duration || 0);

    ui.programName.textContent = live.is_live && live.streamer_name ? `LIVE: ${live.streamer_name}` : (config.stationName || station.name || "Melato Sound Radio");
    ui.trackTitle.textContent = song.title || song.text || "Melato Sound Radio";
    ui.artistName.textContent = song.artist || "Melato";
    setArtwork(song.art || station.art || "");

    const listeners = Number(data.listeners?.unique ?? data.listeners?.current ?? 0);
    ui.listenerCount.textContent = listeners > 0 ? `${listeners} LISTENING` : "LIVE BROADCAST";

    const program = config.defaultProgram || {};
    ui.currentBlock.textContent = live.is_live && live.streamer_name ? live.streamer_name : (program.name || "The Melato Frequency");
    ui.currentBlockDescription.textContent = program.description || "Music, fashion, football and culture in rotation.";

    renderHistory(data.song_history || []);
    setReady(Boolean(state.streamUrl));
    updateProgress();
    updateMediaSession(song);
  }

  function renderHistory(history) {
    if (!Array.isArray(history) || history.length === 0) return;
    ui.historyList.replaceChildren(...history.slice(0, 5).map((item, index) => {
      const li = document.createElement("li");
      const number = document.createElement("span");
      const text = document.createElement("div");
      const title = document.createElement("strong");
      const artist = document.createElement("small");
      number.textContent = String(index + 1).padStart(2, "0");
      title.textContent = item.song?.title || item.song?.text || "Transmission";
      artist.textContent = item.song?.artist || "Melato Sound Radio";
      text.append(title, artist);
      li.append(number, text);
      return li;
    }));
  }

  function updateProgress() {
    if (!state.startedAt || !state.duration) {
      ui.elapsed.textContent = "0:00";
      ui.duration.textContent = "LIVE";
      ui.progressFill.style.width = "0%";
      return;
    }
    const now = Math.floor(Date.now() / 1000);
    const elapsed = Math.max(0, Math.min(state.duration, now - state.startedAt));
    ui.elapsed.textContent = formatTime(elapsed);
    ui.duration.textContent = formatTime(state.duration);
    ui.progressFill.style.width = `${Math.min(100, (elapsed / state.duration) * 100)}%`;
  }

  async function refreshNowPlaying() {
    if (!state.apiUrl) {
      setReady(Boolean(state.streamUrl));
      ui.statusText.textContent = state.streamUrl ? "Ready to listen" : "Awaiting station endpoint";
      return;
    }
    try {
      const response = await fetch(state.apiUrl, { cache: "no-store" });
      if (!response.ok) throw new Error(`Now playing request failed: ${response.status}`);
      applyNowPlaying(await response.json());
      if (!ui.audio.paused) ui.statusText.textContent = "Broadcast playing";
    } catch (error) {
      console.error(error);
      setReady(Boolean(state.streamUrl));
      ui.statusText.textContent = state.streamUrl ? "Metadata temporarily unavailable" : "Station offline";
    }
  }

  async function togglePlayback() {
    if (!state.streamUrl) return;
    if (ui.audio.paused) {
      if (ui.audio.src !== state.streamUrl) ui.audio.src = state.streamUrl;
      try {
        await ui.audio.play();
      } catch (error) {
        console.error(error);
        ui.statusText.textContent = "Playback blocked. Tap play again.";
      }
    } else {
      ui.audio.pause();
    }
  }

  function updateMediaSession(song = {}) {
    if (!("mediaSession" in navigator) || !("MediaMetadata" in window)) return;
    const artwork = song.art ? [{ src: song.art }] : [];
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title || "Melato Sound Radio",
      artist: song.artist || "Melato",
      album: config.stationName || "Melato Sound Radio",
      artwork
    });
  }

  ui.playButton.addEventListener("click", togglePlayback);
  ui.audio.addEventListener("play", () => setPlaying(true));
  ui.audio.addEventListener("pause", () => setPlaying(false));
  ui.audio.addEventListener("waiting", () => { ui.statusText.textContent = "Connecting to broadcast"; });
  ui.audio.addEventListener("playing", () => { ui.statusText.textContent = "Broadcast playing"; });
  ui.audio.addEventListener("error", () => { ui.statusText.textContent = "Stream unavailable"; setPlaying(false); });

  ui.volume.addEventListener("input", () => {
    ui.audio.volume = Number(ui.volume.value);
    ui.audio.muted = false;
    ui.muteButton.textContent = "VOL";
  });
  ui.muteButton.addEventListener("click", () => {
    ui.audio.muted = !ui.audio.muted;
    ui.muteButton.textContent = ui.audio.muted ? "MUTE" : "VOL";
  });

  if ("mediaSession" in navigator) {
    navigator.mediaSession.setActionHandler("play", () => ui.audio.play());
    navigator.mediaSession.setActionHandler("pause", () => ui.audio.pause());
  }

  ui.audio.volume = Number(ui.volume.value);
  ui.currentBlock.textContent = config.defaultProgram?.name || ui.currentBlock.textContent;
  ui.currentBlockDescription.textContent = config.defaultProgram?.description || ui.currentBlockDescription.textContent;
  ui.year.textContent = new Date().getFullYear();

  refreshNowPlaying();
  state.refreshTimer = window.setInterval(refreshNowPlaying, Math.max(5000, Number(config.refreshIntervalMs) || 15000));
  state.progressTimer = window.setInterval(updateProgress, 1000);
})();
