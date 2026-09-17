export default function ZenBanner() {
  return (
    <svg viewBox="0 0 400 140" className="w-full h-28 rounded-xl2" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="zenSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#152B4E" />
          <stop offset="100%" stopColor="#E3A857" />
        </linearGradient>
      </defs>
      <rect width="400" height="140" fill="url(#zenSky)" rx="20" />
      <circle cx="200" cy="70" r="38" fill="#FCE3B0" opacity="0.85" />
      {/* silhouette méditation */}
      <path
        d="M170 118 C170 100, 182 92, 200 92 C218 92, 230 100, 230 118 Z"
        fill="#0D1D38"
        opacity="0.85"
      />
      <circle cx="200" cy="82" r="10" fill="#0D1D38" opacity="0.85" />
      {/* ondulations de calme */}
      <path d="M40 118 C90 108, 130 108, 180 118" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="2" fill="none" />
      <path d="M220 118 C270 108, 310 108, 360 118" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="2" fill="none" />
      {[...Array(6)].map((_, i) => (
        <circle key={i} cx={30 + i * 65} cy={20 + (i % 2) * 12} r="1.6" fill="#FFFFFF" opacity="0.6" />
      ))}
    </svg>
  );
}
