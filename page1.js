/* =========================
   page1.js
   - Handles loader hide
   - Audio play/pause, seek, time display
   - Waveform drawing using WebAudio API (analyser node)
   - Cursor change during text selection (best-effort)
   ========================= */

/* =========== ASSETS NOTE ===========
Replace the following files in same folder or change paths in HTML:
- favicon.png         (browser tab icon)
- loader.png          (preloader image shown while page loads)
- cursor.png          (default cursor image)
- cursor-hover.png    (cursor used for hover on clickable elements)
- cursor-text.png     (cursor used when user selects text)
- speaker-left.png    (left speaker graphic)
- speaker-right.png   (right speaker graphic)
- album-cover.png     (banner album art)
- spotify.png         (stream icon)
- apple-music.png     (stream icon)
- song.mp3            (audio file to play)
====================================== */

// wait until DOM
document.addEventListener('DOMContentLoaded', () => {
  const preloader = document.getElementById('preloader');
  const app = document.getElementById('app');
  const audioEl = document.getElementById('audio-src');
  const playBtn = document.getElementById('play-btn');
  const seek = document.getElementById('seek');
  const timeEl = document.getElementById('time');
  const speakerL = document.getElementById('speaker-left');
  const speakerR = document.getElementById('speaker-right');
  const waveCanvas = document.getElementById('wave');
  const waveCtx = waveCanvas.getContext('2d');

  // hide preloader after small delay (gives time to init audio/visual)
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.style.opacity = 0;
      preloader.style.pointerEvents = 'none';
      preloader.style.transition = 'opacity 300ms';
      app.classList.remove('hidden');
      // fully remove from flow after fade
      setTimeout(()=> preloader.style.display = 'none', 350);
    }, 600);
  });

  // Play / Pause
  playBtn.addEventListener('click', () => {
    if (audioEl.paused) {
      audioEl.play();
      playBtn.textContent = '❚❚'; // pause symbol
      speakerL.classList.add('playing');
      speakerR.classList.add('playing');
    } else {
      audioEl.pause();
      playBtn.textContent = '▶';
      speakerL.classList.remove('playing');
      speakerR.classList.remove('playing');
    }
  });

  // Time update & seek
  audioEl.addEventListener('loadedmetadata', () => {
    timeEl.textContent = formatTime(0) + ' / ' + formatTime(audioEl.duration || 0);
  });

  audioEl.addEventListener('timeupdate', () => {
    const pct = (audioEl.currentTime / (audioEl.duration || 1)) * 100;
    seek.value = isFinite(pct) ? pct : 0;
    timeEl.textContent = formatTime(audioEl.currentTime) + ' / ' + formatTime(audioEl.duration || 0);
  });

  seek.addEventListener('input', () => {
    const t = (seek.value / 100) * audioEl.duration;
    audioEl.currentTime = t;
  });

  function formatTime(s) {
    if (!isFinite(s) || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  }

  /* ===== Waveform visual using WebAudio API =====
     - creates AnalyserNode, reads frequency/time domain data
     - draws smooth waveform to canvas
  */
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const src = ctx.createMediaElementSource(audioEl);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    src.connect(analyser);
    analyser.connect(ctx.destination);

    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
      requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      const width = waveCanvas.width = waveCanvas.clientWidth;
      const height = waveCanvas.height = waveCanvas.clientHeight;
      waveCtx.clearRect(0, 0, width, height);

      // background subtle
      waveCtx.fillStyle = 'rgba(0,0,0,0)';
      waveCtx.fillRect(0,0,width,height);

      // waveform line
      waveCtx.lineWidth = 2;
      waveCtx.strokeStyle = 'rgba(255,190,130,0.95)'; // warm orange line
      waveCtx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;
        if (i === 0) waveCtx.moveTo(x, y);
        else waveCtx.lineTo(x, y);
        x += sliceWidth;
      }
      waveCtx.lineTo(width, height / 2);
      waveCtx.stroke();

      // small glow under waveform
      waveCtx.fillStyle = 'rgba(242,176,125,0.06)';
      waveCtx.fillRect(0, height/2 + 12, width, 12);
    }
    draw();
  } catch (err) {
    // WebAudio not supported or blocked until user interaction
    console.warn('WebAudio initialization failed:', err);
  }

  /* ===== Cursor change on text selection (best-effort) =====
     CSS ::selection can't change cursor; use JS to set body cursor during selection
  */
  document.addEventListener('selectionchange', () => {
    const sel = document.getSelection();
    if (sel && sel.toString().length > 0) {
      // when user selects text, change cursor to text-cursor PNG
      document.body.style.cursor = "url('cursor-text.png'), text";
    } else {
      document.body.style.cursor = "url('cursor.png'), auto";
    }
  });

  /* ===== Accessibility: resume AudioContext on user gesture =====
     Some browsers block audio context until a user gesture — resume on play
  */
  audioEl.addEventListener('play', async () => {
    try {
      if (typeof AudioContext !== 'undefined') {
        // resume context if suspended
        const ctx = (window.AudioContext || window.webkitAudioContext);
        if (ctx && ctx.state === 'suspended' && ctx.resume) await ctx.resume();
      }
    } catch (e) { /* ignore */ }
  });

  /* ===== Keyboard space toggles play/pause ===== */
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      playBtn.click();
    }
  });

}); // DOMContentLoaded end
// Loader hide after page load
window.addEventListener("load", function () {
  const loader = document.getElementById("loader");
  const content = document.getElementById("main-content");

  // 500ms delay before hiding loader
  setTimeout(() => {
    loader.style.display = "none";
    content.style.display = "block";
  }, 500);
});

