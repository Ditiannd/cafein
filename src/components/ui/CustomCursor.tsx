'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

export function CustomCursor() {
  const [isTouchDevice, setIsTouchDevice] = useState(true); // default to true to avoid hydration mismatch, update in useEffect

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const hoverState = useMotionValue(0); // 0 = normal, 1 = hovering

  // Transform hoverState into visual properties
  const innerScale = useTransform(hoverState, [0, 1], [1, 0]);
  const innerOpacity = useTransform(hoverState, [0, 1], [1, 0]);

  const outerScale = useTransform(hoverState, [0, 1], [1, 1.5]);
  const outerBg = useTransform(hoverState, [0, 1], ['transparent', 'rgba(229, 169, 60, 0.1)']);
  const outerBorder = useTransform(hoverState, [0, 1], ['rgba(229, 169, 60, 0.5)', 'rgba(229, 169, 60, 0.8)']);

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    setIsTouchDevice(isTouch);

    if (isTouch) return;

    const updateMousePosition = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Removed expensive getComputedStyle check. Relies on tag and role instead.
      const isInteractive = 
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('textarea');

      hoverState.set(isInteractive ? 1 : 0);
    };

    window.addEventListener('mousemove', updateMousePosition, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [mouseX, mouseY, hoverState]);

  if (isTouchDevice) {
    return null;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media (hover: hover) and (pointer: fine) {
          body, a, button, [role="button"], input, select, textarea {
            cursor: none !important;
          }
        }
      `}} />
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 bg-[#E5A93C] rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:block"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
          scale: innerScale,
          opacity: innerOpacity,
        }}
      />
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 border rounded-full pointer-events-none z-[9998] flex items-center justify-center backdrop-blur-[1px] hidden md:block"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
          scale: outerScale,
          backgroundColor: outerBg,
          borderColor: outerBorder,
        }}
      />
    </>
  );
}
