const sharp = require("sharp");
const path = require("path");

const assetsDir = path.join(__dirname, "../assets");

// App icon SVG — 1024x1024, green gradient background, white leaf + wordmark
const iconSVG = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1DB954"/>
      <stop offset="100%" style="stop-color:#27AE60"/>
    </linearGradient>
    <linearGradient id="leaf" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#d4f5e2;stop-opacity:1"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1024" height="1024" rx="230" fill="url(#bg)"/>

  <!-- Leaf shape -->
  <g transform="translate(512, 430)">
    <!-- Stem -->
    <path d="M0,180 Q0,80 0,-20" stroke="url(#leaf)" stroke-width="28" stroke-linecap="round" fill="none"/>
    <!-- Main leaf -->
    <path d="M0,-20 Q120,-120 80,-260 Q-40,-180 -80,-80 Q-100,20 0,-20 Z"
      fill="url(#leaf)" opacity="0.95"/>
    <!-- Second leaf -->
    <path d="M0,-20 Q-100,-110 -60,-240 Q60,-180 80,-80 Q100,10 0,-20 Z"
      fill="url(#leaf)" opacity="0.75"/>
    <!-- Sprout left -->
    <path d="M-10,60 Q-80,20 -100,-40" stroke="url(#leaf)" stroke-width="22" stroke-linecap="round" fill="none" opacity="0.8"/>
    <!-- Sprout right -->
    <path d="M10,100 Q80,60 100,0" stroke="url(#leaf)" stroke-width="22" stroke-linecap="round" fill="none" opacity="0.8"/>
  </g>

  <!-- Wordmark: "act" dark, "app" lighter -->
  <text x="512" y="740"
    font-family="Arial Black, Arial, sans-serif"
    font-weight="900"
    font-size="148"
    text-anchor="middle"
    fill="white"
    opacity="0.97"
    letter-spacing="-4">actapp</text>
</svg>
`;

// Splash screen SVG — 1284x2778 (iPhone 14 Pro Max), centered logo on light background
const splashSVG = `
<svg width="1284" height="2778" viewBox="0 0 1284 2778" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#E8F8EE"/>
      <stop offset="100%" style="stop-color:#F7FBF8"/>
    </linearGradient>
    <linearGradient id="icon-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1DB954"/>
      <stop offset="100%" style="stop-color:#27AE60"/>
    </linearGradient>
    <linearGradient id="leaf" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff"/>
      <stop offset="100%" style="stop-color:#d4f5e2"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1284" height="2778" fill="url(#bg)"/>

  <!-- Icon card -->
  <rect x="492" y="1089" width="300" height="300" rx="68" fill="url(#icon-bg)"
    filter="drop-shadow(0 12px 28px rgba(39,174,96,0.35))"/>

  <!-- Mini leaf in icon -->
  <g transform="translate(642, 1215)">
    <path d="M0,50 Q0,20 0,-5" stroke="white" stroke-width="9" stroke-linecap="round" fill="none"/>
    <path d="M0,-5 Q40,-40 25,-85 Q-15,-60 -25,-25 Q-32,7 0,-5 Z" fill="white" opacity="0.95"/>
    <path d="M0,-5 Q-32,-36 -20,-77 Q18,-58 25,-24 Q32,3 0,-5 Z" fill="white" opacity="0.75"/>
    <path d="M-3,18 Q-25,6 -32,-12" stroke="white" stroke-width="7" stroke-linecap="round" fill="none" opacity="0.8"/>
    <path d="M3,30 Q26,18 32,0" stroke="white" stroke-width="7" stroke-linecap="round" fill="none" opacity="0.8"/>
  </g>

  <!-- App name -->
  <text x="642" y="1470"
    font-family="Arial Black, Arial, sans-serif"
    font-weight="900"
    font-size="96"
    text-anchor="middle"
    letter-spacing="-3">
    <tspan fill="#1A2E22">act</tspan><tspan fill="#27AE60">app</tspan>
  </text>

  <!-- Tagline -->
  <text x="642" y="1548"
    font-family="Arial, sans-serif"
    font-weight="500"
    font-size="40"
    text-anchor="middle"
    fill="#5A7A66"
    opacity="0.8">Small actions. Massive impact.</text>
</svg>
`;

async function generate() {
	console.log("Generating app icon (1024x1024)...");
	await sharp(Buffer.from(iconSVG))
		.resize(1024, 1024)
		.png()
		.toFile(path.join(assetsDir, "icon.png"));
	console.log("✅ assets/icon.png");

	console.log("Generating splash screen...");
	await sharp(Buffer.from(splashSVG))
		.resize(1284, 2778)
		.png()
		.toFile(path.join(assetsDir, "splash-icon.png"));
	console.log("✅ assets/splash-icon.png");

	console.log(
		"\n🌱 Icons generated! Restart the simulator to see the new app icon.",
	);
}

generate().catch(console.error);
