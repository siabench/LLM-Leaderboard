// src/components/MotionBackground.jsx
import { motion } from "framer-motion";
import React, { useRef } from "react";

export default function MotionBackground() {
  const ref = useRef(null);

  const blobs = [
    {
      className: "bg-blue-300/50",
      size: 300,
      x: -200,
      y: -200,
      animate: { x: [100, 200, 100], y: [100, 200, 100] },
      color: "rgba(186, 104, 200, 0.9)",
    },
    {
      className: "bg-indigo-300/40",
      size: 360,
      x: 400,
      y: 120,
      animate: { x: [400, 180, 350], y: [120, 350, 200] },
      color: "rgba(99, 102, 241, 0.6)",
    },
    {
      className: "bg-cyan-300/40",
      size: 260,
      x: -80,
      y: 300,
      animate: { x: [-80, -120, 80], y: [300, 320, 400] },
      color: "rgba(34, 211, 238, 0.8)",
    },
    {
      className: "bg-pink-200/40",
      size: 200,
      x: 300,
      y: -80,
      animate: { x: [300, 320, 250], y: [-80, -120, 40] },
      color: "rgba(244, 114, 182, 0.9)",
    },
  ];

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0"
      aria-hidden="true"
      ref={ref}
      style={{ willChange: "transform" }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/70 to-white/50" />
      {/* Radial light effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,179,237,0.09),transparent_70%)]" />
      {/* Animated blobs */}

      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl mix-blend-lighten"
          style={{
            width: blob.size,
            height: blob.size,
            left: blob.x,
            top: blob.y,
            background: blob.color,
            filter: "blur(64px)",
          }}
          animate={blob.animate}
          transition={{
            duration: 16 + i * 2,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
