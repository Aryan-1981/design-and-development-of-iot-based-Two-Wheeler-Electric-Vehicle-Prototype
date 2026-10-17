import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ChevronDown, ArrowDown, Cpu, Gauge, Zap, AlertTriangle, Layers } from 'lucide-react';

interface ScrollAnimationProps {
  onEnterDashboard?: () => void;
}

export const ScrollAnimation: React.FC<ScrollAnimationProps> = ({ onEnterDashboard }) => {
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
        const fallback = Array.from({ length: 300 }, (_, i) => {
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
  }, []);

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

  const progressPercent = frames.length > 0 ? Math.round((loadedCount / frames.length) * 100) : 0;

  return (
    <div ref={containerRef} className="relative w-full h-[450vh] bg-[#080d1a]">
      {/* Sticky Fullscreen Viewport Window */}
      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center select-none font-sans">
        {/* Canvas displaying scroll-controlled frame */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover filter contrast-[1.08] brightness-[0.88]"
        />

        {/* Cinematic Overlays: Vignette & Radial Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080d1a] via-black/40 to-[#080d1a]/80 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#080d1a]/40 to-[#080d1a]/95 pointer-events-none" />

        {/* Ambient Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Error notification if frames fail */}
        {errorMsg && (
          <div className="absolute top-6 left-6 right-6 max-w-xl mx-auto z-50 bg-rose-950/80 border border-rose-500/60 p-4 rounded-xl backdrop-blur-md flex items-start space-x-3 text-rose-200 text-sm shadow-2xl">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-rose-100">Animation Warning</div>
              <p className="mt-1 text-xs opacity-90">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Foreground Hero Content Card */}
        <div className="relative z-30 max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase tracking-wider backdrop-blur-md mb-6 shadow-glow-cyan/20">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>EV Telemetry Laboratory Prototype</span>
            <span className="text-cyan-600">|</span>
            <span className="text-slate-400">ESP32 2.4GHz Wi-Fi / RTOS</span>
          </div>

          {/* Full Mandatory Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300 tracking-tight leading-tight drop-shadow-lg">
            Design and Development of IoT-Based Two-Wheeler Electric Vehicle Prototype for
            Performance Monitoring
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-sm sm:text-base md:text-lg text-cyan-100/80 font-light tracking-wide max-w-2xl">
            Real-time tachometric velocity, chassis 6-DOF vibration profiles, motor thermal
            dispersion, and actuator positioning.
          </p>

          {/* Hardware Badges */}
          <div className="mt-6 flex flex-wrap justify-center items-center gap-2.5 text-xs text-slate-300 font-mono">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/60 border border-slate-700/60 rounded-md backdrop-blur">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>ESP32 MCU</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/60 border border-slate-700/60 rounded-md backdrop-blur">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              <span>NPN RPM (GPIO 5)</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/60 border border-slate-700/60 rounded-md backdrop-blur">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Servo (GPIO 18)</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/60 border border-slate-700/60 rounded-md backdrop-blur">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>MPU6050 (I2C) & DHT11</span>
            </div>
          </div>

          {/* Action Button & Scroll Prompt */}
          <div className="mt-10 flex flex-col items-center gap-3">
            <button
              onClick={scrollToDashboard}
              data-cursor="EXPLORE"
              className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm sm:text-base shadow-glow-cyan hover:shadow-cyan-400/50 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Explore Telemetry Dashboard</span>
              <ChevronDown className="w-4 h-4 text-slate-950 group-hover:translate-y-1 transition-transform" />
            </button>

            {/* Scroll Indicator */}
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400/90 animate-bounce mt-2">
              <ArrowDown className="w-3.5 h-3.5" />
              <span>SCROLL TO EXPLORE MOTORCYCLE FRAMES</span>
            </div>

            {isLoading && (
              <div className="text-[11px] text-cyan-300 font-mono flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                <span>Preloading 1440p frames: {progressPercent}% ({loadedCount}/{frames.length || 300})</span>
              </div>
            )}
          </div>
        </div>

        {/* Floating Bottom Bar: Frame Indicator & Scroll Status */}
        <div className="absolute bottom-6 left-6 right-6 z-40 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800/80 px-4 py-2 rounded-lg backdrop-blur-md">
            <span>
              FRAME: <span className="text-cyan-400 font-bold">{String(currentFrameIndex + 1).padStart(3, '0')}</span> / {frames.length || 300}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">SCROLL-CONTROLLED</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 border border-slate-800/80 px-4 py-2 rounded-lg backdrop-blur-md text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Scroll Down to Advance • Scroll Up to Reverse</span>
          </div>
        </div>
      </div>
    </div>
  );
};
