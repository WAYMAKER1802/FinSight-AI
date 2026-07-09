import React from 'react';
import { motion } from 'framer-motion';

const LineChart = ({ points, color, duration, delay, opacity, width }: any) => (
  <motion.svg
    className="absolute inset-0 w-full h-full pointer-events-none"
    preserveAspectRatio="none"
    viewBox="0 0 1000 500"
    initial={{ opacity: 0 }}
    animate={{ opacity }}
    transition={{ duration: 2, delay }}
  >
    <motion.path
      d={points}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'linear',
      }}
      style={{ filter: `drop-shadow(0 0 8px ${color})` }}
    />
  </motion.svg>
);

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-dark-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-900/10 via-dark-950 to-dark-950" />
      
      {/* Moving Stock Lines */}
      <LineChart 
        points="M 0,400 L 100,380 L 200,420 L 300,350 L 400,360 L 500,280 L 600,300 L 700,200 L 800,220 L 900,100 L 1000,120"
        color="#3b82f6" // brand-500
        duration={25}
        delay={0}
        opacity={0.15}
        width={2}
      />
      <LineChart 
        points="M 0,450 L 150,420 L 250,440 L 350,380 L 450,400 L 550,340 L 650,370 L 750,280 L 850,300 L 1000,180"
        color="#8b5cf6" // accent-violet
        duration={35}
        delay={1}
        opacity={0.1}
        width={1.5}
      />
      <LineChart 
        points="M 0,350 L 120,380 L 220,320 L 320,340 L 420,260 L 520,280 L 620,180 L 720,210 L 820,100 L 1000,50"
        color="#10b981" // emerald-500
        duration={30}
        delay={2}
        opacity={0.08}
        width={1}
      />

      {/* Floating Particles / Data points */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-brand-400"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: Math.random() * 0.5 + 0.1
          }}
          animate={{
            y: [null, Math.random() * window.innerHeight],
            opacity: [null, 0]
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      ))}
    </div>
  );
}
