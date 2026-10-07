const fs = require('fs');
const path = require('path');

// SVG Icon definition: Sleek mobile grocery cart with shield/safety budget checkmark
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#022c22"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#ef4444"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#10b981" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Background rounded squircle -->
  <rect width="512" height="512" rx="128" fill="url(#bgGrad)"/>
  <rect x="12" y="12" width="488" height="488" rx="116" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="4"/>

  <!-- Shopping Trolley -->
  <g filter="url(#glow)">
    <!-- Cart handle & chassis -->
    <path d="M110 140 L160 140 L210 320 L380 320 L420 180 L195 180" 
          fill="none" stroke="url(#accentGrad)" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
    
    <!-- Cart Basket Grid Lines -->
    <path d="M245 220 L395 220 M275 270 L370 270" 
          stroke="rgba(255,255,255,0.25)" stroke-width="12" stroke-linecap="round"/>
    <path d="M270 180 L290 320 M330 180 L345 320 M380 180 L385 270" 
          stroke="rgba(255,255,255,0.25)" stroke-width="10" stroke-linecap="round"/>

    <!-- Wheels -->
    <circle cx="230" cy="380" r="28" fill="#10b981"/>
    <circle cx="230" cy="380" r="12" fill="#0f172a"/>
    <circle cx="360" cy="380" r="28" fill="#10b981"/>
    <circle cx="360" cy="380" r="12" fill="#0f172a"/>
  </g>

  <!-- Safety Budget Shield Badge at top right -->
  <g transform="translate(300, 70)">
    <path d="M70 10 L130 35 C130 95 80 140 70 150 C60 140 10 95 10 35 Z" 
          fill="url(#shieldGrad)" stroke="#ffffff" stroke-width="8"/>
    <!-- Rupiah / Check Symbol inside shield -->
    <path d="M45 80 L62 98 L98 56" fill="none" stroke="#ffffff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;

const iconsDir = path.join(__dirname, 'icons');
fs.writeFileSync(path.join(iconsDir, 'app-icon.svg'), svgIcon, 'utf8');
console.log('Saved app-icon.svg successfully');
