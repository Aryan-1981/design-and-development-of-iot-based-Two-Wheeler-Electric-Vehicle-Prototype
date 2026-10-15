import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Play, Pause, RotateCcw, AlertTriangle, Cpu, Gauge, Zap } from 'lucide-react';

interface FrameManifest {
  totalFrames: number;
  prefix: string;
  frames: string[];
}

interface OpeningAnimationProps {
  onEnterDashboard: () => void;
}

export const OpeningAnimation: React.FC<OpeningAnimationProps> = ({ onEnterDashboard }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [frames, setFrames] = useState<string[]>([]);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loadedCount, setLoadedCount] = useState<number>(0);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [fps, setFps] = useState<number>(30);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // RequestAnimationFrame tracking
  const lastTimeRef = useRef<number>(0);
  const frameIndexRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(true);
  isPlayingRef.current = isPlaying;

  // 1. Fetch Manifest
  useEffect(() => {
    let isCancelled = false;

    async function loadManifest() {
      try {
        const response = await fetch('/frames-manifest.json');
        if (!response.ok) {
          throw new Error('Manifest not found');
        }
        const data: FrameManifest = await response.json();
        if (data.frames && data.frames.length > 0 && !isCancelled) {
          setFrames(data.frames);
          preloadFrames(data.frames);
        } else {
          throw new Error('Manifest contains 0 frames');
        }
      } catch (err: any) {
        console.warn('Failed to fetch manifest, attempting direct fallback sequence:', err);
        // Fallback: Generate array of 300 sequential frames
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

  // 2. Preload frames smoothly with progressive loading
  const preloadFrames = useCallback((frameList: string[]) => {
    setIsLoading(true);
    let count = 0;
    const loadedImages: HTMLImageElement[] = new Array(frameList.length);
    const totalToLoad = frameList.length;

    frameList.forEach((src, idx) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        count++;
        loadedImages[idx] = img;
        setLoadedCount(count);
        if (count >= Math.min(25, totalToLoad)) {
          // Allow playback as soon as the first buffer is ready
          setIsLoading(false);
        }
      };
      img.onerror = () => {
        count++;
        setLoadedCount(count);
        if (count === totalToLoad && loadedImages.filter(Boolean).length === 0) {
          setErrorMsg(
            'Cannot load video frames from public/frames/. Please ensure frames are placed in public/frames/ezgif-frame-*.jpg'
          );
          setIsLoading(false);
        }
      };
    });
    setImages(loadedImages);
  }, []);

  // 3. Render Canvas Loop
  useEffect(() => {
    let animId: number;

    const render = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const interval = 1000 / fps;
      const delta = time - lastTimeRef.current;

      if (delta >= interval) {
        lastTimeRef.current = time - (delta % interval);

        if (isPlayingRef.current && images.length > 0) {
          let nextIndex = frameIndexRef.current + 1;
          if (nextIndex >= images.length) {
            nextIndex = 0; // loop seamlessly
          }
          frameIndexRef.current = nextIndex;
          setCurrentFrameIndex(nextIndex);

          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            const img = images[nextIndex];
            if (ctx && img && img.complete && img.naturalWidth > 0) {
              // Maintain aspect ratio cover / letterbox
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
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [images, fps]);

  // Adjust canvas resolution dynamically on window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const progressPercent = frames.length > 0 ? Math.round((loadedCount / frames.length) * 100) : 0;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080d1a] flex items-center justify-center select-none font-sans">
      {/* Background HTML5 Canvas Rendering Preloaded Video Frames */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover filter contrast-[1.08] brightness-[0.88]"
      />

      {/* Cinematic Overlays: Vignette & Radial Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#080d1a] via-black/40 to-[#080d1a]/80 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#080d1a]/40 to-[#080d1a]/95 pointer-events-none" />

      {/* Grid Pattern Accent Overlay */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Missing Frames Warning if applicable */}
      {errorMsg && (
        <div className="absolute top-6 left-6 right-6 max-w-xl mx-auto z-50 bg-rose-950/80 border border-rose-500/60 p-4 rounded-xl backdrop-blur-md flex items-start space-x-3 text-rose-200 text-sm shadow-2xl">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-rose-100">Video Frames Warning</div>
            <p className="mt-1 text-xs opacity-90">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Foreground Hero Content Card */}
      <div className="relative z-30 max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
        {/* Top Badges */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase tracking-wider backdrop-blur-md mb-6 shadow-glow-cyan/20"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>EV Telemetry Laboratory Prototype</span>
          <span className="text-cyan-600">|</span>
          <span className="text-slate-400">ESP32 2.4GHz Wi-Fi / RTOS</span>
        </motion.div>

        {/* Main Project Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300 tracking-tight leading-tight drop-shadow-lg"
        >
          Design & Development of IoT-Based Two-Wheeler Electric Vehicle Prototype
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mt-4 text-base sm:text-lg md:text-xl text-cyan-100/80 font-light tracking-wide max-w-2xl"
        >
          Real-time performance monitoring, vibration analytics, motor telemetry, and environmental diagnostics.
        </motion.p>

        {/* Hardware Tech Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-6 flex flex-wrap justify-center items-center gap-3 text-xs text-slate-300 font-mono"
        >
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/60 border border-slate-700/60 rounded-md backdrop-blur">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>ESP32 MCU</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/60 border border-slate-700/60 rounded-md backdrop-blur">
            <Gauge className="w-3.5 h-3.5 text-emerald-400" />
            <span>NPN RPM Sensor</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/60 border border-slate-700/60 rounded-md backdrop-blur">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>40 kg-cm Actuator</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/60 border border-slate-700/60 rounded-md backdrop-blur">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span>MPU6050 & DHT11</span>
          </div>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="mt-10 flex flex-col items-center gap-4"
        >
          <button
            onClick={onEnterDashboard}
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-base md:text-lg shadow-glow-cyan hover:shadow-cyan-400/50 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Enter Dashboard</span>
            <ChevronRight className="w-5 h-5 text-slate-950 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </button>

          {/* Loading Indicator for Buffer */}
          {isLoading && (
            <div className="text-xs text-cyan-300 font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>Buffering high-res frames: {progressPercent}% ({loadedCount}/{frames.length || 300})</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Floating Bottom Bar: Frame Controls & Frame Counter */}
      <div className="absolute bottom-6 left-6 right-6 z-40 flex items-center justify-between text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800/80 px-4 py-2 rounded-lg backdrop-blur-md">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause animation' : 'Play animation'}
            className="text-cyan-400 hover:text-cyan-300 transition-colors p-1"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              frameIndexRef.current = 0;
              setCurrentFrameIndex(0);
            }}
            title="Restart animation"
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <span className="text-slate-600">|</span>
          <span>
            FRAME: <span className="text-cyan-400 font-bold">{String(currentFrameIndex + 1).padStart(3, '0')}</span> / {frames.length || 300}
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="hidden sm:inline text-slate-400">
            {fps} FPS CINEMATIC
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-3 bg-slate-900/80 border border-slate-800/80 px-4 py-2 rounded-lg backdrop-blur-md text-slate-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Phase 1 Frontend Prototype</span>
        </div>
      </div>
    </div>
  );
};
