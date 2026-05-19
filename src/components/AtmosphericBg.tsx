import React from 'react';
import { motion } from 'motion/react';
import { usePlayer } from '../context/PlayerContext';

export const AtmosphericBg: React.FC = () => {
  const { isPlaying } = usePlayer();

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{
          scale: isPlaying ? [1, 1.2, 1] : 1,
          rotate: isPlaying ? [0, 90, 180, 270, 360] : 0,
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-40 blur-[120px]"
        style={{
          background: `
            radial-gradient(circle at 30% 30%, #ff4e00 0%, transparent 50%),
            radial-gradient(circle at 70% 70%, #3a1510 0%, transparent 50%),
            radial-gradient(circle at 10% 80%, #1e1b4b 0%, transparent 50%),
            radial-gradient(circle at 90% 20%, #4c1d95 0%, transparent 50%)
          `
        }}
      />
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[20px]" />
    </div>
  );
};
