export function AuthWavesPanel() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#050a14]">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 720 1200"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="ribbon-deep"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#021a4a" />
            <stop offset="45%" stopColor="#0554F2" />
            <stop offset="100%" stopColor="#033078" />
          </linearGradient>

          <linearGradient
            id="ribbon-bright"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#0554F2" stopOpacity="0.2" />
            <stop offset="35%" stopColor="#3d8bff" />
            <stop offset="65%" stopColor="#7eb8ff" />
            <stop offset="100%" stopColor="#d4e8ff" />
          </linearGradient>

          <linearGradient
            id="ribbon-glow"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#0554F2" />
            <stop offset="50%" stopColor="#5ca0ff" />
            <stop offset="100%" stopColor="#e8f4ff" />
          </linearGradient>

          <linearGradient
            id="ribbon-accent"
            x1="0%"
            y1="100%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#0554F2" stopOpacity="0.6" />
            <stop offset="40%" stopColor="#0BD904" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#F2B705" stopOpacity="0.2" />
          </linearGradient>

          <filter id="ribbon-blur-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
          </filter>

          <filter id="ribbon-blur-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="18" />
          </filter>

          <filter id="grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.04" />
            </feComponentTransfer>
          </filter>

          <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#050a14" stopOpacity="0" />
            <stop offset="100%" stopColor="#050a14" stopOpacity="0.85" />
          </radialGradient>
        </defs>

        <rect width="720" height="1200" fill="#050a14" />

        {/* Ribbonas fluidas — fluxo vertical tipo seda/líquido */}
        <path
          className="auth-ribbon auth-ribbon-1"
          fill="url(#ribbon-deep)"
          opacity="0.9"
          d="M-40,0 C80,180 20,380 120,560 C220,740 100,940 60,1200 L-60,1200 L-60,0 Z"
        />
        <path
          className="auth-ribbon auth-ribbon-2"
          fill="url(#ribbon-deep)"
          opacity="0.75"
          d="M120,0 C220,220 160,420 260,600 C360,780 280,980 240,1200 L80,1200 L80,0 Z"
        />

        <path
          className="auth-ribbon auth-ribbon-3"
          fill="url(#ribbon-bright)"
          filter="url(#ribbon-blur-soft)"
          d="M280,0 C180,200 340,400 240,580 C140,760 320,960 280,1200 L420,1200 C460,960 300,760 400,580 C500,400 340,200 440,0 Z"
        />

        <path
          className="auth-ribbon auth-ribbon-4"
          fill="url(#ribbon-glow)"
          filter="url(#ribbon-blur-glow)"
          opacity="0.85"
          d="M480,0 C380,240 520,440 420,620 C320,800 500,1000 460,1200 L620,1200 C660,1000 480,800 580,620 C680,440 540,240 640,0 Z"
        />

        <path
          className="auth-ribbon auth-ribbon-5"
          fill="url(#ribbon-bright)"
          opacity="0.7"
          d="M620,0 C720,180 660,400 760,580 C860,760 700,960 680,1200 L820,1200 L820,0 Z"
        />

        <path
          className="auth-ribbon auth-ribbon-6"
          fill="url(#ribbon-accent)"
          opacity="0.35"
          d="M360,200 C460,350 300,500 400,680 C500,860 380,1020 360,1200 L520,1200 C540,1020 420,860 520,680 C620,500 460,350 560,200 Z"
        />

        {/* Faixas de brilho (highlights) */}
        <path
          className="auth-ribbon auth-ribbon-7"
          fill="#e8f4ff"
          fillOpacity="0.35"
          filter="url(#ribbon-blur-glow)"
          d="M300,120 C340,280 310,440 350,600 C390,760 330,920 310,1080 C295,980 325,720 305,520 C285,320 320,220 300,120 Z"
        />
        <path
          className="auth-ribbon auth-ribbon-8"
          fill="#ffffff"
          fillOpacity="0.2"
          filter="url(#ribbon-blur-soft)"
          d="M500,80 C530,260 510,420 540,580 C570,740 520,900 500,1060 C485,900 515,680 495,480 C475,280 520,180 500,80 Z"
        />

        <rect width="720" height="1200" fill="url(#vignette)" />
        <rect width="720" height="1200" filter="url(#grain)" opacity="0.6" />
      </svg>

      <div className="auth-panel-grain pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
            Recomposição de aprendizagem
          </p>
          <div className="h-px w-12 bg-white/20" />
        </div>

        <div className="max-w-md space-y-4">
          <h2 className="text-3xl font-bold leading-tight text-white xl:text-4xl">
            Aprenda no seu ritmo, com apoio inteligente
          </h2>
          <p className="text-base leading-relaxed text-white/65">
            Personalização para o aluno. Praticidade para o professor!
          </p>
        </div>

        <div className="auth-glass-pill flex justify-center">
          <span className="font-semibold text-white text-center">VisionEdu</span>
        </div>
      </div>
    </div>
  );
}
