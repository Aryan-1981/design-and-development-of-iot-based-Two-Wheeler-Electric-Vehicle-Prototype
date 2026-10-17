import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  useScroll,
  useSpring,
  useTransform,
  motion,
} from 'framer-motion';
import { ChevronDown, ArrowDown, Cpu, Gauge, Zap, AlertTriangle } from 'lucide-react';
import { MitsLogo } from './MitsLogo';

interface ScrollAnimationProps {
  onEnterDashboard?: () => void;
}

const TOTAL_FRAMES_FALLBACK = 300;

/**
 * Scroll-controlled motorcycle frame sequence.
 * PROTECTED BEHAVIOUR: 300 extracted video frames are preloaded and rendered
 * to a fullscreen canvas driven by scroll progress (down = forward,
 * up = reverse). Only presentation may change — mapping, preloading, canvas
 * rendering, sticky layout, and frame sequencing stay intact.
 */
export const ScrollAnimation: React.FC<ScrollAnimationProps> = ({ onEnterDashboard: _onEnterDashboard }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [frames, setFrames] = useState<string[]>([]);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loadedCount, setLoadedCount] = useState<number>(0);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Smooth scroll progress hook
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 30,
    restDelta: 0.001,
  });

  // HUD opacity: full while the hero is the focus, fades as the dashboard arrives
  const hudOpacity = useTransform(smoothProgress, [0.86, 0.99], [1, 0]);
  const contentOpacity = useTransform(smoothProgress, [0.78, 0.97], [1, 0]);

  // 2. Progressive preloading
  const preloadFrames = useCallback((frameList: string[]) => {
    setIsLoading(true);
    let count = 0;
    const loadedImgs: HTMLImageElement[] = new Array(frameList.length);
    const total = frameList.length;

    frameList.forEach((src, idx) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        count++;
        loadedImgs[idx] = img;
        setLoadedCount(count);
        if (count >= Math.min(20, total)) {
          setIsLoading(false);
        }
      };
      img.onerror = () => {
        count++;
        setLoadedCount(count);
        if (count === total && loadedImgs.filter(Boolean).length === 0) {
          setErrorMsg('Failed to load video frames. Please ensure frames exist in public/frames/');
          setIsLoading(false);
        }
      };
    });
    setImages(loadedImgs);
  }, []);

  // 1. Fetch frames manifest
  useEffect(() => {
    let isCancelled = false;

    async function loadManifest() {
      try {
        const res = await fetch('/frames-manifest.json');
        if (!res.ok) throw new Error('Manifest not found');
        const data = await res.json();
        if (data.frames && data.frames.length > 0 && !isCancelled) {
          setFrames(data.frames);
          preloadFrames(data.frames);
        } else {
          throw new Error('Manifest is empty');
        }
      } catch (err: any) {
        console.warn('Falling back to direct 300-frame sequence:', err);
        const fallback = Array.from({ length: TOTAL_FRAMES_FALLBACK }, (_, i) => {
          const num = String(i + 1).padStart(3, '0');
          return `/frames/ezgif-frame-${num}.jpg`;
        });
        if (!isCancelled) {
          setFrames(fallback);
          preloadFrames(fallback);
        }
      }
    }

    loadManifest();
    return () => {
      isCancelled = true;
    };
  }, [preloadFrames]);

  // 3. Render Canvas frame on scroll progress change
  const renderFrame = useCallback(
    (frameIndex: number) => {
      const canvas = canvasRef.current;
      if (!canvas || !images.length) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = images[frameIndex] || images.find((im) => im && im.complete);
      if (img && img.complete && img.naturalWidth > 0) {
        const cw = canvas.width;
        const ch = canvas.height;
        ctx.clearRect(0, 0, cw, ch);

        const hRatio = cw / img.naturalWidth;
        const vRatio = ch / img.naturalHeight;
        const ratio = Math.max(hRatio, vRatio);

        const centerShiftX = (cw - img.naturalWidth * ratio) / 2;
        const centerShiftY = (ch - img.naturalHeight * ratio) / 2;

        ctx.drawImage(
          img,
          0,
          0,
          img.naturalWidth,
          img.naturalHeight,
          centerShiftX,
          centerShiftY,
          img.naturalWidth * ratio,
          img.naturalHeight * ratio
        );
      }
    },
    [images]
  );

  // Subscribe to smooth scroll progression
  useEffect(() => {
    const unsubscribe = smoothProgress.on('change', (latest) => {
      if (frames.length > 0) {
        // Map 0.0 - 1.0 scroll progress to frame index 0 - (totalFrames - 1)
        const targetIndex = Math.min(
          frames.length - 1,
          Math.max(0, Math.floor(latest * (frames.length - 1)))
        );
        setCurrentFrameIndex(targetIndex);
        renderFrame(targetIndex);
      }
    });

    return () => unsubscribe();
  }, [smoothProgress, frames.length, renderFrame]);

  // Adjust canvas resolution dynamically on window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        renderFrame(currentFrameIndex);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentFrameIndex, renderFrame]);

  const scrollToDashboard = () => {
    if (containerRef.current) {
      const targetTop = containerRef.current.offsetTop + containerRef.current.offsetHeight;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    }
  };

  const progressPercent =
    frames.length > 0 ? Math.round((loadedCount / frames.length) * 100) : 0;
  const frameProgress =
    frames.length > 1 ? currentFrameIndex / (frames.length - 1) : 0;

  return (
    <div ref={containerRef} className="relative w-full h-[450vh] bg-[#080d1a]">
      {/* Sticky Fullscreen Viewport Window */}
      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center select-none font-sans">
        {/* Canvas displaying scroll-controlled frame */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover filter contrast-[1.08] brightness-[0.88]"
        />

        {/* Cinematic overlays: top/bottom scrims + vignette for text legibility */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(8,13,26,0.92) 0%, rgba(8,13,26,0.45) 22%, rgba(8,13,26,0.30) 55%, rgba(8,13,26,0.94) 100%)',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#080d1a]/35 to-[#080d1a]/90 pointer-events-none" />

        {/* Restrained ambient grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(6, 182, 212, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 1) 1px, transparent 1px)`,
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          }}
        />

        {/* Error notification if frames fail */}
        {errorMsg && (
          <div
            role="alert"
            className="absolute top-6 left-6 right-6 max-w-xl mx-auto z-50 bg-rose-950/80 border border-rose-500/60 p-4 rounded-xl backdrop-blur-md flex items-start space-x-3 text-rose-200 text-sm shadow-2xl"
          >
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <div className="font-semibold text-rose-100">Animation Warning</div>
              <p className="mt-1 text-xs opacity-90">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Foreground hero content */}
        <motion.div
          style={{ opacity: contentOpacity }}
          className="relative z-30 max-w-4xl mx-auto px-6 text-center flex flex-col items-center"
        >
          {/* Project badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/25 text-cyan-300 text-[11px] font-mono uppercase tracking-[0.18em] backdrop-blur-md mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" aria-hidden="true" />
            <span>EV Telemetry Prototype</span>
            <span className="text-cyan-700" aria-hidden="true">|</span>
            <span className="text-slate-400">ESP32 · Wi-Fi · RTOS</span>
          </div>

          {/* MITS institutional crest */}
          <MitsLogo variant="hero" className="mb-5 lg:mb-7" />

          {/* Mandatory project title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold text-white tracking-tight leading-[1.08] drop-shadow-lg">
            IoT-Based Performance Monitoring
            <span className="block text-cyan-200/95">of Two-Wheeler Electric Vehicles</span>
          </h1>

          {/* Engineering description — matches verified capabilities */}
          <p className="mt-4 text-sm sm:text-base md:text-lg text-slate-300/90 font-light tracking-wide max-w-2xl leading-relaxed">
            Real-time motor RPM, chassis vibration profiles, motor and ambient temperature,
            and servo actuator positioning — streamed live from the ESP32 prototype.
          </p>

          {/* Verified hardware badges */}
          <ul className="mt-6 flex flex-wrap justify-center items-center gap-2 text-[11px] text-slate-300 font-mono">
            {[
              { icon: Cpu, label: 'ESP32 MCU', dot: false, iconClass: 'text-cyan-400' },
              { icon: Gauge, label: 'NPN RPM · GPIO 5', dot: false, iconClass: 'text-cyan-300' },
              { icon: Zap, label: 'Servo · GPIO 18', dot: false, iconClass: 'text-amber-400' },
            ].map((badge) => (
              <li
                key={badge.label}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/55 border border-slate-700/50 rounded-md backdrop-blur-sm"
              >
                <badge.icon className={`w-3.5 h-3.5 ${badge.iconClass}`} aria-hidden="true" />
                <span>{badge.label}</span>
              </li>
            ))}
            <li className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/55 border border-slate-700/50 rounded-md backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" aria-hidden="true" />
              <span>MPU6050 (I²C) · DHT11</span>
            </li>
          </ul>

          {/* CTA + scroll guidance */}
          <div className="mt-9 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={scrollToDashboard}
              data-cursor="EXPLORE"
              className="group inline-flex items-center gap-3 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm sm:text-base shadow-glow-cyan hover:shadow-cyan-400/50 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Explore Telemetry Dashboard</span>
              <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" aria-hidden="true" />
            </button>

            <p className="flex items-center gap-2 text-[11px] font-mono text-cyan-300/80 tracking-[0.18em] uppercase mt-1">
              <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
              Scroll to advance frames
            </p>

            {isLoading && (
              <p className="text-[11px] text-cyan-300/90 font-mono flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" aria-hidden="true" />
                <span>
                  Preloading frames: {progressPercent}% ({loadedCount}/{frames.length || TOTAL_FRAMES_FALLBACK})
                </span>
              </p>
            )}
          </div>
        </motion.div>

        {/* Bottom HUD: frame counter + scroll direction + progress */}
        <motion.div
          style={{ opacity: hudOpacity }}
          className="absolute bottom-5 left-5 right-5 z-40 flex items-end justify-between gap-4 text-[11px] text-slate-400 font-mono"
        >
          <div className="bg-slate-900/80 border border-slate-700/60 px-4 py-2.5 rounded-lg backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="tracking-[0.14em] uppercase text-slate-500">Frame</span>
              <span className="text-cyan-300 font-bold tabular-nums">
                {String(currentFrameIndex + 1).padStart(3, '0')}
              </span>
              <span className="text-slate-600">/</span>
              <span className="tabular-nums">{frames.length || TOTAL_FRAMES_FALLBACK}</span>
            </div>
            {/* Frame progress rail */}
            <div className="mt-2 w-40 sm:w-56 h-1 rounded-full bg-slate-700/70 overflow-hidden" aria-hidden="true">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-[width] duration-100 ease-out"
                style={{ width: `${Math.max(2, frameProgress * 100)}%` }}
              />
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 border border-slate-700/60 px-4 py-2.5 rounded-lg backdrop-blur-md">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" aria-hidden="true" />
            <span className="tracking-[0.1em] uppercase text-slate-400">
              Scroll down to advance · up to reverse
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
