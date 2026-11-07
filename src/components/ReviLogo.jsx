import React from 'react';

/**
 * Revi Signature Brand Logo
 * 
 * Värvid ja stiil vastavalt Revi disainijuhisele:
 * - Ikooni taust: roheline värviüleminek #087F6D → #15AA82
 * - Kuldne kuma ikooni nurgas: #F2C879
 * - Ikooni sümbol: valge #FFFFFF (unikaalne Revi 'R' teadmiste ja kordamise silmus)
 * - Tulemus on iseseisva ja originaalse identiteediga, mida ei leidu ühelgi teisel õpiplatvormil.
 */
export default function ReviLogo({ size = 36, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`revi-logo-mark ${className}`}
      role="img"
      aria-label="Revi logo"
    >
      <defs>
        {/* Põhiline smaragdroheline värviüleminek #087F6D → #15AA82 */}
        <linearGradient id="revi-emerald-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#087F6D" />
          <stop offset="100%" stopColor="#15AA82" />
        </linearGradient>

        {/* Soe kuldne kuma nurgas #F2C879 */}
        <radialGradient id="revi-golden-glow" cx="82%" cy="16%" r="62%">
          <stop offset="0%" stopColor="#F2C879" stopOpacity="0.85" />
          <stop offset="42%" stopColor="#F2C879" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#F2C879" stopOpacity="0" />
        </radialGradient>

        {/* Peen särakuma sümbolil */}
        <linearGradient id="revi-spark-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF4D0" />
          <stop offset="100%" stopColor="#F2C879" />
        </linearGradient>
      </defs>

      {/* 1. Ümardatud alus smaragdrohelise üleminekuga */}
      <rect width="64" height="64" rx="18" fill="url(#revi-emerald-grad)" />

      {/* 2. Kuldne kuma ikooni paremas ülanurgas #F2C879 */}
      <rect width="64" height="64" rx="18" fill="url(#revi-golden-glow)" />

      {/* 3. Peen klaasjas siseäärise helk */}
      <rect
        x="1"
        y="1"
        width="62"
        height="62"
        rx="17"
        fill="none"
        stroke="rgba(255, 255, 255, 0.32)"
        strokeWidth="1.5"
      />

      {/* 4. Valge (#FFFFFF) unikaalne Revi 'R' sümbol:
             vertikaalne selgroog, sujuv kordamisaas (loop) ja dünaamiline edasiliikuv jalg */}
      <g
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Vertikaalne tugi */}
        <path d="M20 16v32" />
        {/* Sujuv kordamise ja teadmiste silmus (loop) */}
        <path d="M20 18.5h14c5.8 0 10 3.8 10 9s-4.2 9-10 9H20" />
        {/* Aktiivse õppimise edasiviiv tõuge */}
        <path d="M30.5 36.5L44 50" />
      </g>

      {/* 5. Väike kuldne taipamise ja meeldetuletuse säde (#F2C879) silmuse südames */}
      <path
        d="M33.5 22.5c0 2.8 2.2 5 5 5c-2.8 0-5 2.2-5 5c0-2.8-2.2-5-5-5c2.8 0 5-2.2 5-5z"
        fill="url(#revi-spark-gold)"
      />
    </svg>
  );
}
