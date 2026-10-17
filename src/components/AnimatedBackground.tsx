import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * AnimatedBackground
 *
 * Premium, low-impact animated background for the IoT EV dashboard.
 * Four composited layers sit behind all UI content (pointer-events: none,
 * -z-10 stacking) so telemetry cards, charts, and navigation remain crisp
 * and fully interactive.
 *
 * Layer A — Ambient gradient atmosphere (drifting radial light blooms)
 * Layer B — Animated circuit-board network (sparse traces + signal pulses)
 * Layer C — Electric energy waves (slow curved trails at page edges)
 * Layer D — Floating telemetry particles (tiny drifting glow motes)
 *
 * All motion honours prefers-reduced-motion: animations are disabled and
 * the background falls back to a static soft gradient.
 */
export const AnimatedBackground: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const motionDisabled = prefersReducedMotion || !mounted;

  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
      data-animated-bg
    >
      {/* =====================================================================
          Layer A — Ambient gradient atmosphere
          Cool-white / icy-blue / pale lavender drifting radial blooms.
          ===================================================================== */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(at 15% 20%, rgba(14, 165, 233, 0.06) 0px, transparent 45%),
            radial-gradient(at 80% 85%, rgba(79, 70, 229, 0.05) 0px, transparent 45%),
            radial-gradient(at 40% 40%, rgba(234, 179, 8, 0.03) 0px, transparent 45%),
            radial-gradient(at 90% 10%, rgba(168, 85, 247, 0.04) 0px, transparent 40%)
          `,
          backgroundColor: '#F8FAFC',
          ...(motionDisabled
            ? {}
            : {
                animation: 'ambient-drift 16s ease-in-out infinite alternate',
                willChange: 'transform, background-position',
              }),
        }}
      />

      {/* =====================================================================
          Layer B — Animated circuit-board network
          Sparse traces + nodes; tiny light pulses travel along traces.
          ===================================================================== */}
      <svg
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
        style={{
          opacity: motionDisabled ? 0.35 : 0.5,
          ...(motionDisabled ? {} : { animation: 'circuit-breathe 10s ease-in-out infinite' }),
        }}
      >
        <defs>
          <circle id="node" cx="0" cy="0" r="1.5" fill="#0ea5e9" />
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Vertical traces */}
        <line x1="120" y1="0" x2="120" y2="100%" stroke="#0ea5e9" strokeOpacity="0.15" strokeWidth="0.6" />
        <line x1="320" y1="0" x2="320" y2="100%" stroke="#8b5cf6" strokeOpacity="0.12" strokeWidth="0.6" />
        <line x1="520" y1="0" x2="520" y2="100%" stroke="#0ea5e9" strokeOpacity="0.15" strokeWidth="0.6" />
        <line x1="720" y1="0" x2="720" y2="100%" stroke="#8b5cf6" strokeOpacity="0.12" strokeWidth="0.6" />

        {/* Horizontal traces */}
        <line x1="0" y1="140" x2="100%" y2="140" stroke="#0ea5e9" strokeOpacity="0.15" strokeWidth="0.6" />
        <line x1="0" y1="300" x2="100%" y2="300" stroke="#8b5cf6" strokeOpacity="0.12" strokeWidth="0.6" />
        <line x1="0" y1="460" x2="100%" y2="460" stroke="#0ea5e9" strokeOpacity="0.15" strokeWidth="0.6" />

        {/* Intersection nodes */}
        <use href="#node" x="120" y="140" />
        <use href="#node" x="320" y="140" />
        <use href="#node" x="520" y="140" />
        <use href="#node" x="720" y="140" />
        <use href="#node" x="120" y="300" />
        <use href="#node" x="520" y="300" />
        <use href="#node" x="120" y="460" />
        <use href="#node" x="720" y="460" />
        <use href="#node" x="320" y="460" />

        {/* Signal pulses travelling along traces */}
        <motion.circle
          cx={0}
          cy={140}
          r={2.5}
          fill="#38bdf8"
          filter="url(#glow)"
          animate={{
            cx: [120, 520, 120],
            cy: 140,
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
            delay: 0,
          }}
          style={{ opacity: motionDisabled ? 0 : 0.9 }}
        />
        <motion.circle
          cx={320}
          cy={300}
          r={2}
          fill="#a78bfa"
          filter="url(#glow)"
          animate={{
            cx: [320, 720, 320],
            cy: 300,
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'linear',
            delay: 1.5,
          }}
          style={{ opacity: motionDisabled ? 0 : 0.8 }}
        />
        <motion.circle
          cx={520}
          cy={460}
          r={2.5}
          fill="#22d3ee"
          filter="url(#glow)"
          animate={{
            cx: [520, 120, 520],
            cy: 460,
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'linear',
            delay: 0.8,
          }}
          style={{ opacity: motionDisabled ? 0 : 0.85 }}
        />
      </svg>

      {/* =====================================================================
          Layer C — Electric energy waves
          Slow curved energy trails along outer edges.
          ===================================================================== */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ ...(motionDisabled ? {} : { animation: 'edge-breathe 14s ease-in-out infinite alternate' }) }}
      >
        <div
          className="absolute -top-8 -left-8 w-[600px] h-[120px] rounded-full"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.08), transparent)`,
            ...(motionDisabled
              ? {}
              : {
                  animation: 'wave-drift 10s linear infinite',
                  willChange: 'transform',
                }),
          }}
        />
        <div
          className="absolute -bottom-8 -right-8 w-[700px] h-[100px] rounded-full"
          style={{
            background: `linear-gradient(270deg, transparent, rgba(79, 70, 229, 0.07), transparent)`,
            ...(motionDisabled
              ? {}
              : {
                  animation: 'wave-drift 12s linear infinite',
                  animationDelay: '3s',
                  willChange: 'transform',
                }),
          }}
        />
        <div
          className="absolute top-[35%] left-[-10%] w-[500px] h-[90px] rounded-full"
          style={{
            background: `linear-gradient(0deg, transparent, rgba(168, 85, 247, 0.06), transparent)`,
            ...(motionDisabled
              ? {}
              : {
                  animation: 'wave-drift 14s linear infinite',
                  animationDelay: '6s',
                  willChange: 'transform',
                }),
          }}
        />
      </div>

      {/* =====================================================================
          Layer D — Floating telemetry particles
          Tiny drifting glow motes, low density, restrained opacity.
          ===================================================================== */}
      <div className="absolute inset-0">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
          const x = 10 + (i * 83) % 90;
          const y = 15 + (i * 57) % 85;
          const duration = 14 + (i * 3.3);
          const delay = i * 1.2;
          const size = 2 + (i % 3);
          const opacity = 0.25 + (i % 4) * 0.08;
          const color = i % 3 === 0 ? '#0ea5e9' : i % 3 === 1 ? '#8b5cf6' : '#22d3ee';

          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: color,
                boxShadow: `0 0 ${size * 4}px ${color}`,
                opacity: motionDisabled ? opacity * 0.4 : opacity,
                filter: 'blur(0.5px)',
                ...(motionDisabled
                  ? {}
                  : {
                      animation: `particle-float ${duration}s ease-in-out infinite`,
                      animationDelay: `${delay}s`,
                      willChange: 'transform, opacity',
                    }),
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
