
// =====================
// Sarggek — Shared JS
// One JS to control all pages
// =====================

/* Page loader hide after ready */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => loader && loader.classList.add('hide'), 300);
});

/* Active nav link by pathname */
(function setActiveNav(){
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(a => {
    const href = a.getAttribute('href');
    if ((path === 'index.html' && href === 'index.html') || (href && href.endsWith(path))) {
      a.classList.add('active');
    }
  });
})();

/* Simple toast (for demo CTA clicks) */
function toast(msg='Coming soon…'){
  const t = document.createElement('div');
  t.textContent = msg;
  Object.assign(t.style, {
    position:'fixed', left:'50%', top:'16px', transform:'translateX(-50%)',
    background:'rgba(34,211,238,.15)', color:'#e5e7eb', padding:'10px 14px',
    border:'1px solid rgba(34,211,238,.35)', borderRadius:'12px', zIndex:9999,
    backdropFilter:'blur(6px)'
  });
  document.body.appendChild(t);
  setTimeout(()=> t.remove(), 1600);
}
window.toast = toast;







document.addEventListener('DOMContentLoaded', function () {
  const initialViews = 103235; // Update this to your latest views count
  const increment = 50;
  const hourMs = 60 * 60 * 1000;
  const viewsKey = 'ekantViewsTimestamp';
  const viewsContainer = document.getElementById('viewsCount');

  let storedTimestamp = localStorage.getItem(viewsKey);
  let startTimestamp = storedTimestamp ? parseInt(storedTimestamp, 10) : Date.now();

  // Save the initial timestamp if first visit
  if (!storedTimestamp) {
    localStorage.setItem(viewsKey, startTimestamp);
  }

  // Calculate how many hours have passed
  let hoursPassed = Math.floor((Date.now() - startTimestamp) / hourMs);

  // Update the views
  let totalViews = initialViews + (hoursPassed * increment);

  viewsContainer.textContent = totalViews;
  
  // Optionally, refresh the views every hour while on page
  setInterval(function () {
    let now = Date.now();
    let newHoursPassed = Math.floor((now - startTimestamp) / hourMs);
    let updatedViews = initialViews + (newHoursPassed * increment);
    viewsContainer.textContent = updatedViews;
  }, hourMs);

});







