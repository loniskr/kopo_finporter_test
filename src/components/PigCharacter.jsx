import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

export function PigCharacter({ isWatching }) {
  const eyeX = useMotionValue(0);
  const eyeY = useMotionValue(0);
  const springEyeX = useSpring(eyeX, { stiffness: 150, damping: 15 });
  const springEyeY = useSpring(eyeY, { stiffness: 150, damping: 15 });
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isWatching) {
      eyeX.set(0);
      eyeY.set(0);
      return;
    }

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2) / 100, 1);

      eyeX.set(Math.cos(angle) * distance * 2);
      eyeY.set(Math.sin(angle) * distance * 2);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isWatching, eyeX, eyeY]);

  return (
    <svg
      ref={containerRef}
      width="200"
      height="118"
      viewBox="0 0 200 118"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Head */}
      <ellipse cx="100" cy="66" rx="62" ry="52" fill="#FFAEC9" />

      {/* Ears */}
      <ellipse cx="50" cy="32" rx="15" ry="22" fill="#FFAEC9" transform="rotate(-20 50 32)" />
      <ellipse cx="150" cy="32" rx="15" ry="22" fill="#FFAEC9" transform="rotate(20 150 32)" />

      {/* Eyes */}
      {isWatching ? (
        <>
          <ellipse cx="72" cy="60" rx="7" ry="9" fill="#000000" />
          <motion.ellipse
            cx="72"
            cy="60"
            rx="2.5"
            ry="2.5"
            fill="#FFFFFF"
            style={{ x: springEyeX, y: springEyeY }}
          />
          <ellipse cx="128" cy="60" rx="7" ry="9" fill="#000000" />
          <motion.ellipse
            cx="128"
            cy="60"
            rx="2.5"
            ry="2.5"
            fill="#FFFFFF"
            style={{ x: springEyeX, y: springEyeY }}
          />
        </>
      ) : (
        <>
          <motion.path
            d="M 65 62 Q 72 67 79 62"
            stroke="#000000"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3 }}
          />
          <motion.path
            d="M 121 62 Q 128 67 135 62"
            stroke="#000000"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3 }}
          />

          {/* Drool */}
          <motion.ellipse
            cx="108"
            cy="92"
            rx="7"
            ry="9"
            fill="#87CEEB"
            opacity="0.85"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          />

          {/* ZZZ */}
          <motion.g
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <text x="140" y="32" fill="#aaaaaa" fontSize="13" fontWeight="bold">z</text>
            <text x="150" y="21" fill="#aaaaaa" fontSize="15" fontWeight="bold">z</text>
            <text x="162" y="10" fill="#aaaaaa" fontSize="17" fontWeight="bold">z</text>
          </motion.g>
        </>
      )}

      {/* Nose */}
      <ellipse cx="100" cy="80" rx="17" ry="13" fill="#E6739F" />
      <ellipse cx="93" cy="80" rx="4" ry="5" fill="#000000" />
      <ellipse cx="107" cy="80" rx="4" ry="5" fill="#000000" />

      {/* Hands - 아래 평평한 반달, 평평면이 y=118 (카드 border에 맞닿음) */}
      <path d="M 21,118 A 20,20 0 0,1 61,118 Z" fill="#FFAEC9" />
      <path d="M 139,118 A 20,20 0 0,1 179,118 Z" fill="#FFAEC9" />
    </svg>
  );
}
