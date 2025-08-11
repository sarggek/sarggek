document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  const app = document.getElementById('app');
  const audioEl = document.getElementById('audio-src');
  const playBtn = document.getElementById('play-btn');
  const seek = document.getElementById('seek');
  const timeEl = document.getElementById('time');
  const speakerL = document.getElementById('speaker-left');
  const speakerR = document.getElementById('speaker-right');
  const waveCanvas = document.getElementById('wave');
  const waveCtx = waveCanvas.getContext('2d');

  // Hide loader after window load and show app
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.style.opacity = 0;
      loader.style.pointerEvents = 'none';
      loader.style.transition = 'opacity 300ms';
      app.classList.remove('hidden');
      setTimeout(() => {
        loader.style.display = 'none';
      }, 350);
    }, 600);
  });

  // Play / Pause toggle
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

  // Update time display and seek slider on audio metadata load
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

  // Waveform visualization using Web Audio API
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

      waveCtx.fillStyle = 'rgba(0,0,0,0)';
      waveCtx.fillRect(0, 0, width, height);

      waveCtx.lineWidth = 2;
      waveCtx.strokeStyle = 'rgba(255,190,130,0.95)';
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

      waveCtx.fillStyle = 'rgba(242,176,125,0.06)';
      waveCtx.fillRect(0, height / 2 + 12, width, 12);
    }
    draw();
  } catch (err) {
    console.warn('WebAudio initialization failed:', err);
  }

  // Change cursor when user selects text (best effort)
  document.addEventListener('selectionchange', () => {
    const sel = document.getSelection();
    if (sel && sel.toString().length > 0) {
      document.body.style.cursor = "url('Cursorstext.png'), text";
    } else {
      document.body.style.cursor = "url('Cursors.png'), auto";
    }
  });

  // Resume AudioContext on play (some browsers block until user interaction)
  audioEl.addEventListener('play', async () => {
    try {
      if (typeof AudioContext !== 'undefined') {
        const ctx = (window.AudioContext || window.webkitAudioContext);
        if (ctx && ctx.state === 'suspended' && ctx.resume) await ctx.resume();
      }
    } catch {}
  });

  // Spacebar toggles play/pause, ignoring inputs/textareas
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      playBtn.click();
    }
  });

});
