import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const CustomCursor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [cursorText, setCursorText] = useState('');

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth spring physics for Apple/NVIDIA grade fluid movement
  const springConfig = { damping: 28, stiffness: 350, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Only activate custom cursor on desktop/fine-pointer devices
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest(
        'button, a, input, select, [data-cursor], [role="button"], .interactive-hover'
      ) as HTMLElement | null;

      if (interactive) {
        setIsHovered(true);
        const customLabel = interactive.getAttribute('data-cursor');
        if (customLabel) {
          setCursorText(customLabel);
        } else if (interactive.tagName === 'BUTTON') {
          setCursorText('SELECT');
        } else if (interactive.tagName === 'A') {
          setCursorText('VISIT');
        } else if (interactive.tagName === 'INPUT') {
          setCursorText('INPUT');
        } else {
          setCursorText('VIEW');
        }
      } else {
        const panel = target.closest('.glass-panel, .recharts-wrapper') as HTMLElement | null;
        if (panel) {
          setIsHovered(true);
          const panelLabel = panel.getAttribute('data-cursor') || 'TELEMETRY';
          setCursorText(panelLabel);
        } else {
          setIsHovered(false);
          setCursorText('');
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleElementHover, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleElementHover);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible, mouseX, mouseY]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden select-none">
      {/* Outer Spring Glassmorphism Ring / Bubble */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          willChange: 'transform',
        }}
        animate={{
          width: isHovered ? 78 : 34,
          height: isHovered ? 78 : 34,
          backgroundColor: isHovered
            ? 'rgba(255, 255, 255, 0.72)'
            : 'rgba(14, 165, 233, 0.06)',
          borderColor: isHovered
            ? 'rgba(2, 132, 199, 0.45)'
            : 'rgba(2, 132, 199, 0.3)',
          boxShadow: isHovered
            ? '0 16px 36px -6px rgba(2, 132, 199, 0.22), 0 0 0 1px rgba(255, 255, 255, 0.8) inset'
            : '0 4px 14px -2px rgba(2, 132, 199, 0.12)',
        }}
        transition={{
          type: 'spring',
          stiffness: 380,
          damping: 24,
        }}
        className="rounded-full border backdrop-blur-md flex items-center justify-center text-center shadow-lg transition-colors duration-200"
      >
        {isHovered && cursorText ? (
          <motion.span
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="text-[9px] font-mono font-bold tracking-widest uppercase text-sky-800 select-none px-1"
          >
            {cursorText}
          </motion.span>
        ) : (
          <div className="w-1.5 h-1.5 rounded-full bg-sky-600/80" />
        )}
      </motion.div>
    </div>
  );
};
