import React from 'react';
import { Sparkles } from 'lucide-react';

interface DreamAnalyzerProps {
  progressText: string;
  progressPercent?: number;
}

export const DreamAnalyzer: React.FC<DreamAnalyzerProps> = ({ progressText, progressPercent = 0 }) => {
  return (
    <div style={styles.container} className="glass-panel fade-in">
      {/* Mystical Orbit & Constellation Animation Container */}
      <div style={styles.orbitWrapper}>
        <div style={styles.pulsingCenter} />
        <div style={styles.orbitRing1} />
        <div style={styles.orbitRing2} />
        <div style={styles.orbitRing3} />
        
        {/* Constellation Star dots */}
        <div style={{ ...styles.starNode, top: '20%', left: '35%' }} className="star-pulse" />
        <div style={{ ...styles.starNode, top: '15%', left: '60%' }} className="star-pulse" />
        <div style={{ ...styles.starNode, top: '45%', left: '80%' }} className="star-pulse" />
        <div style={{ ...styles.starNode, top: '75%', left: '65%' }} className="star-pulse" />
        <div style={{ ...styles.starNode, top: '80%', left: '30%' }} className="star-pulse" />
        <div style={{ ...styles.starNode, top: '50%', left: '15%' }} className="star-pulse" />
        
        {/* SVG Drawing Constellation Lines */}
        <svg style={styles.constellationLines}>
          <line x1="35%" y1="20%" x2="60%" y2="15%" style={styles.lineStyle} />
          <line x1="60%" y1="15%" x2="80%" y2="45%" style={styles.lineStyle} />
          <line x1="80%" y1="45%" x2="65%" y2="75%" style={styles.lineStyle} />
          <line x1="65%" y1="75%" x2="30%" y2="80%" style={styles.lineStyle} />
          <line x1="30%" y1="80%" x2="15%" y2="50%" style={styles.lineStyle} />
          <line x1="15%" y1="50%" x2="35%" y2="20%" style={styles.lineStyle} />
          <line x1="35%" y1="20%" x2="50%" y2="50%" style={styles.lineStyle} />
          <line x1="65%" y1="75%" x2="50%" y2="50%" style={styles.lineStyle} />
        </svg>
      </div>

      <div style={styles.textContainer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '12px' }}>
          <Sparkles size={16} className="star-spin" color="var(--color-accent)" />
          <span style={styles.headline} className="font-display text-gradient-cyan">정렬되는 기억의 타래</span>
        </div>
        
        <p style={styles.statusText}>{progressText}</p>
        
        {progressPercent > 0 && progressPercent < 100 && (
          <div style={styles.progressContainer}>
            <div style={styles.progressBarBg}>
              <div style={{ ...styles.progressBarFill, width: `${progressPercent}%` }} />
            </div>
            <span style={styles.progressVal}>{progressPercent}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '90%',
    maxWidth: '520px',
    margin: '40px auto',
    padding: '40px',
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitWrapper: {
    position: 'relative',
    width: '200px',
    height: '200px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '32px',
  },
  pulsingCenter: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    boxShadow: '0 0 25px 8px var(--color-secondary), 0 0 50px 15px var(--color-primary)',
    zIndex: 5,
    animation: 'centerPulse 2s infinite ease-in-out alternate',
  },
  orbitRing1: {
    position: 'absolute',
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    border: '1px dashed hsla(180, 80%, 65%, 0.15)',
    animation: 'spinClockwise 12s infinite linear',
  },
  orbitRing2: {
    position: 'absolute',
    width: '130px',
    height: '130px',
    borderRadius: '50%',
    border: '1px solid hsla(265, 75%, 65%, 0.12)',
    animation: 'spinCounterClockwise 18s infinite linear',
  },
  orbitRing3: {
    position: 'absolute',
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    border: '1px dashed hsla(45, 90%, 60%, 0.1)',
    animation: 'spinClockwise 25s infinite linear',
  },
  starNode: {
    position: 'absolute',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    boxShadow: '0 0 10px 2px var(--color-secondary), 0 0 20px #fff',
    zIndex: 10,
  },
  constellationLines: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    zIndex: 2,
    pointerEvents: 'none',
  },
  lineStyle: {
    stroke: 'hsla(180, 80%, 65%, 0.2)',
    strokeWidth: 1,
    strokeDasharray: '4,4',
    animation: 'dashAnimation 30s infinite linear',
  },
  textContainer: {
    textAlign: 'center',
    width: '100%',
  },
  headline: {
    fontSize: '1.1rem',
    fontWeight: '600',
    letterSpacing: '0.1em',
  },
  statusText: {
    fontSize: '0.9rem',
    color: '#dfdfdf',
    fontWeight: '400',
    minHeight: '24px',
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    maxWidth: '240px',
    margin: '16px auto 0 auto',
  },
  progressBarBg: {
    flexGrow: 1,
    height: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '3px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
    transition: 'width 0.3s ease',
  },
  progressVal: {
    fontSize: '0.75rem',
    color: 'var(--color-secondary)',
    fontWeight: '600',
    minWidth: '28px',
  }
};

// Inject constellation keyframe animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes centerPulse {
      0% {
        transform: scale(0.9);
        box-shadow: 0 0 20px 4px var(--color-secondary), 0 0 40px 10px var(--color-primary);
      }
      100% {
        transform: scale(1.15);
        box-shadow: 0 0 30px 12px var(--color-secondary), 0 0 60px 20px var(--color-primary);
      }
    }
    @keyframes spinClockwise {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes spinCounterClockwise {
      0% { transform: rotate(360deg); }
      100% { transform: rotate(0deg); }
    }
    @keyframes dashAnimation {
      0% { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: 500; }
    }
    .star-pulse {
      animation: centerPulse 1.5s infinite alternate ease-in-out;
    }
    .star-spin {
      animation: spinClockwise 4s infinite linear;
    }
  `;
  document.head.appendChild(style);
}
