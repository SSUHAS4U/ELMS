/**
 * Lightweight animated background replacing heavy Three.js canvas.
 * Pure CSS + minimal JS for a subtle gradient mesh effect.
 */
const Background3D = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated gradient orbs */}
      <div 
        className="absolute rounded-full blur-3xl opacity-20 animate-pulse"
        style={{
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)',
          top: '-10%', left: '-10%',
          animation: 'float1 8s ease-in-out infinite'
        }}
      />
      <div 
        className="absolute rounded-full blur-3xl opacity-15 animate-pulse"
        style={{
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)',
          bottom: '-5%', right: '-5%',
          animation: 'float2 10s ease-in-out infinite',
          animationDelay: '2s'
        }}
      />
      <div 
        className="absolute rounded-full blur-3xl opacity-10"
        style={{
          width: '300px', height: '300px',
          background: 'radial-gradient(circle, var(--info) 0%, transparent 70%)',
          top: '40%', right: '20%',
          animation: 'float1 12s ease-in-out infinite',
          animationDelay: '4s'
        }}
      />

      {/* Subtle grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--text-secondary) 1px, transparent 1px), linear-gradient(90deg, var(--text-secondary) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-40px, -20px) scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default Background3D;
