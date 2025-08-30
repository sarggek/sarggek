const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const hindiChars = [
  "अ","आ","इ","ई","उ","ऊ","ऋ","ए","ऐ","ओ","औ",
  "क","ख","ग","घ","ङ","च","छ","ज","झ","ञ",
  "ट","ठ","ड","ढ","ण","त","थ","द","ध","न",
  "प","फ","ब","भ","म","य","र","ल","व","श","ष","स","ह","क्ष","त्र","ज्ञ","अद्वैत","अहिंसा","अमृत","आनंद","आस्था","आशा","इच्छा","इंद्रिय","इमारत","ईश्वर","ईमान","ईर्ष्या","उत्सव","उपवास","उपकार","ऊर्जा","ऊँचाई","ऊष्मा","ऋतु","ऋषि","ऋण","एकता","एश्वर्य","एकाग्रता","ऐश्वर्य","ऐक्य","ऐतिहासिक"
, "ओज","ओम","ओर"
, "औषधि","औद्योगिक","औचित्य"
, "कर्म","काव्य","कल्याण"
, "खुशबू","ख्याति","खजाना"
, "गौरव","गति","गगन"
, "घंटा","घोषणा","घनता"
, "ङम","ङार","ङल"
, "चेतना","चंद्र","चमत्कार"
, "छाया","छंद","छात्र"
, "ज्ञान","जगत","जल"
, "झरना","झंकार","झलक"
, "ञान","ञाति","ञेय"
, "टिका","टंकार","टंकी"
 , "ठहराव","ठंडी","ठिकाना"
,  "डगर","डंका","डाक"
, "ढलान","ढोल","ढांचा"
,  "णाद","णिमा","णीय"
, "तत्व","तप","ताकत"
 ,"थल","थाली","थिर"
, "धर्म","दया","दृष्टि"
, "ध्यान","ध्वनि","धन"
, "नाद","नम्रता","नवीन"
,"प्रेम","पवित्र","परंपरा"
, "फूल","फल","फलक"
 ,"बुद्धि","ब्रह्म","बचपन"
,"भक्ति","भविष्य","भान"
  ,"मोक्ष","मूल्य","मंगल"
 , "योग","यात्रा","युग"
, "रचना","राग","राष्ट्र"
, "लय","लक्ष्य","लाभ"
, "विश्व","वाणी","विचार"
,"शक्ति","शांति","शब्द"
, "षडंग","षष्ठी","षट्कोण"
,"संस्कृति","सत्य","संगीत"
,"हृदय","हवन","हर्ष"
,"क्षमा","क्षेत्र","क्षमता"
, "त्रिविध","त्रिकोण","त्रिपाठी"
 , "ज्ञान","ज्ञानी","ज्ञेय"
];

const words = ["संस्कृति","ज्ञान","शक्ति","प्रेम","सत्य","धर्म","मोक्ष","आनंद","विश्व","शांति"];

let particles = [];

class Particle {
  constructor(x, y, char) {
    this.x = x;
    this.y = y;
    this.char = char;
    this.size = Math.random() * 24 + 12; // 12px - 36px
    this.baseX = x;
    this.baseY = y;
    this.density = Math.random() * 40 + 5;

    // Floating motion velocity
    this.vx = Math.random() * 0.5 - 0.25;
    this.vy = Math.random() * 0.5 - 0.25;
  }

  draw() {
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.font = `${this.size}px Arial`;
    ctx.fillText(this.char, this.x, this.y);
  }

  update(mouse) {
    // Floating motion
    this.x += this.vx;
    this.y += this.vy;

    // Bounce from edges
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

    // Optional: mouse interaction (can be removed if not needed)
    let dx = mouse.x - this.x;
    let dy = mouse.y - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    let maxDistance = 100;
    let forceDirectionX = dx / distance;
    let forceDirectionY = dy / distance;
    let force = (maxDistance - distance) / maxDistance;
    let directionX = forceDirectionX * force * this.density;
    let directionY = forceDirectionY * force * this.density;

    if (distance < maxDistance) {
      this.x -= directionX;
      this.y -= directionY;
    }
  }
}

function init() {
  particles = [];
  for (let i = 0; i < 150; i++) {
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;
    let char = hindiChars[Math.floor(Math.random() * hindiChars.length)];
    particles.push(new Particle(x, y, char));
  }
}

const mouse = { x: null, y: null };

window.addEventListener("mousemove", (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});

canvas.addEventListener("click", () => {
  // Blast effect: replace nearby chars with a word
  const word = words[Math.floor(Math.random() * words.length)];
  particles.splice(0, word.length);
  let startX = canvas.width / 2 - (word.length * 20) / 2;
  let startY = canvas.height / 2;
  for (let i = 0; i < word.length; i++) {
    particles.push(new Particle(startX + i * 20, startY, word[i]));
  }
});

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p) => {
    p.draw();
    p.update(mouse);
  });
  requestAnimationFrame(animate);
}

init();
animate();

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  init();
});