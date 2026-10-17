import React, { useCallback, useRef } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion';
import type { TargetAndTransition } from 'framer-motion';

interface MitsLogoProps {
  /** Extra classes for spacing/positioning (size stays owned by the variant). */
  className?: string;
  /**
   * hero    — dark cinematic canvas: transparent crest, `screen` blend.
   * compact — light dashboard surface: transparent crest, `multiply` blend.
   */
  variant?: 'compact' | 'hero';
}

interface VariantConfig {
  size: string;
  /** mix-blend utility so the crest fuses with the surface beneath it. */
  blendClass: string;
  /** Idle + hover glow applied to the image itself (kept off ancestors so the
   *  blend keeps compositing against the true page backdrop). */
  hover: TargetAndTransition;
  glow: string;
  floatY: number[];
  floatDuration: number;
  scale: number;
  perspective: number;
  tilt: number;
}

/**
 * The crest PNG ships with a fully transparent background (RGBA), so no glass
 * plate is required — the image is blended straight onto the surface instead:
 *   `screen`   on the dark hero  → the crest emits light into the scene.
 *   `multiply` on light surfaces → the white body drops out, leaving the
 *                crimson / cyan / gold insignia as native line-art.
 * Blend mode + glow live on the <img> (not a wrapper) so no ancestor becomes a
 * backdrop root that would defeat the blend.
 */
const VARIANT: Record<'compact' | 'hero', VariantConfig> = {
  compact: {
    size: 'w-10 h-10 lg:w-12 lg:h-12',
    blendClass: 'mix-blend-multiply',
    hover: { scale: 1.1 },
    glow: 'drop-shadow(0 6px 16px rgba(79, 70, 229, 0.4))',
    floatY: [0, -6, 0],
    floatDuration: 4,
    scale: 1.1,
    perspective: 800,
    tilt: 6,
  },
  hero: {
    // clamp(128px, 18vmin, 224px): mobile floor → desktop range, auto-shrinking
    // on short viewports so the sticky h-screen hero never overflows.
    size: 'w-[clamp(8rem,18vmin,14rem)] h-[clamp(8rem,18vmin,14rem)]',
    blendClass: 'mix-blend-screen',
    hover: { scale: 1.08 },
    glow: 'drop-shadow(0 0 30px rgba(79, 70, 229, 0.6)) drop-shadow(0 0 14px rgba(14, 165, 233, 0.4))',
    floatY: [0, -10, 0],
    floatDuration: 5,
    scale: 1.08,
    perspective: 900,
    tilt: 6,
  },
};

/**
 * MITS (Madhav Institute of Technology & Science, Gwalior) institutional crest.
 *
 * No opaque container: the transparent crest is blended into whatever surface
 * it sits on, so it reads as part of the UI rather than a pasted-on badge.
 *
 * Motion (unchanged physics, hardware accelerated):
 *  - Idle levitation loop translateY(0 -> -Npx -> 0), ease-in-out.
 *  - Hover spring scale + indigo/cyan drop-shadow glow.
 *  - Magnetic 3D parallax tilt (rotateX/rotateY) with explicit perspective.
 *  - `data-cursor="MITS GWALIOR"` drives the global CustomCursor ring.
 */
export const MitsLogo: React.FC<MitsLogoProps> = ({
  className,
  variant = 'compact',
}) => {
  const prefersReducedMotion = useReducedMotion();
  const tiltRef = useRef<HTMLDivElement>(null);
  const v = VARIANT[variant];
  const isHero = variant === 'hero';

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(
    mouseY,
    [-0.5, 0, 0.5],
    prefersReducedMotion ? [0, 0, 0] : [-v.tilt, 0, v.tilt]
  );
  const rotateY = useTransform(
    mouseX,
    [-0.5, 0, 0.5],
    prefersReducedMotion ? [0, 0, 0] : [v.tilt, 0, -v.tilt]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (prefersReducedMotion || !tiltRef.current) return;
      const rect = tiltRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    },
    [prefersReducedMotion, mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    if (prefersReducedMotion) return;
    mouseX.set(0);
    mouseY.set(0);
  }, [prefersReducedMotion, mouseX, mouseY]);

  return (
    <div className={`relative ${className ?? ''}`}>
      {/* Ambient halo — light bed so the screen-blended crest seats naturally */}
      {isHero && (
        <motion.div
          aria-hidden="true"
          animate={prefersReducedMotion ? {} : { opacity: [0.6, 1, 0.6] }}
          transition={
            prefersReducedMotion
              ? {}
              : {
                  duration: v.floatDuration,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
          }
          className="pointer-events-none absolute -inset-6 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.30),rgba(14,165,233,0.14)_45%,transparent_70%)] blur-2xl will-change-opacity"
        />
      )}

      <motion.div
        ref={tiltRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: v.scale }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className={`relative z-10 will-change-transform ${v.size} flex items-center justify-center`}
        data-cursor="MITS GWALIOR"
        role="img"
        aria-label="MITS Gwalior institutional crest"
      >
        {/* Layer 1 — idle floating levitation loop */}
        <motion.div
          animate={prefersReducedMotion ? {} : { y: v.floatY }}
          transition={
            prefersReducedMotion
              ? {}
              : {
                  duration: v.floatDuration,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
          }
          className="will-change-transform flex items-center justify-center w-full h-full"
        >
          {/* Layer 2 — magnetic 3D parallax tilt driven by cursor offset */}
          <motion.div
            style={{
              rotateX,
              rotateY,
              transformPerspective: v.perspective,
              willChange: 'transform',
            }}
            className="will-change-transform flex items-center justify-center w-full h-full"
          >
            {/* Blend + glow live on the image itself. `filter` on an ancestor
                would create a backdrop root and break the mix-blend. */}
            <motion.img
              src="/logos/mits-logo.png"
              alt="MITS Gwalior institutional crest"
              whileHover={{ filter: v.glow }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              className={`${v.blendClass} w-full h-full object-contain select-none will-change-transform`}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};
