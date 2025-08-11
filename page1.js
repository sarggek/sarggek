// Future customization ke liye JS
// Example: Rap click karne par details update karna

document.querySelectorAll('.rap-item').forEach(item => {
    item.addEventListener('click', () => {
        alert("Rap clicked: " + item.querySelector('h2').textContent);
    });
});
const audio = document.getElementById('player');
const playPauseBtn = document.getElementById('playPause');
const seekBar = document.getElementById('seekBar');

playPauseBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        playPauseBtn.textContent = '⏸';
    } else {
        audio.pause();
        playPauseBtn.textContent = '▶';
    }
});

audio.addEventListener('timeupdate', () => {
    seekBar.value = (audio.currentTime / audio.duration) * 100;
});

seekBar.addEventListener('input', () => {
    audio.currentTime = (seekBar.value / 100) * audio.duration;
});
