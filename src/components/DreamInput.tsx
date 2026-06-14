import React, { useState, useRef } from 'react';
import { Compass, Sparkles, Moon, Brain } from 'lucide-react';
import { i18n } from '../services/i18nService';

interface DreamInputProps {
  onInterpret: (content: string, mode: 'traditional' | 'psychological' | 'hybrid') => void;
  isProcessing: boolean;
  currentEngine: 'chrome-nano' | 'qwen-local' | 'mock-demo';
  onOpenSettings: () => void;
  language: 'ko' | 'en';
}

interface StarParticle {
  id: number;
  x: number;
  y: number;
  size: number;
}

export const DreamInput: React.FC<DreamInputProps> = ({ 
  onInterpret, 
  isProcessing,
  currentEngine,
  onOpenSettings,
  language
}) => {
  const [content, setContent] = useState('');
  const [mode, setMode] = useState<'traditional' | 'psychological' | 'hybrid'>('hybrid');
  const [particles, setParticles] = useState<StarParticle[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getEngineLabel = (engine: string) => {
    switch (engine) {
      case 'chrome-nano': return language === 'en' ? 'Chrome Built-in AI' : 'Chrome 내장 AI';
      case 'qwen-local': return language === 'en' ? 'Local AI (Qwen)' : '로컬 AI (Qwen)';
      case 'mock-demo': return language === 'en' ? 'Star Dictionary' : '성좌 사전 해몽';
      default: return language === 'en' ? 'Select AI Engine' : 'AI 엔진 선택';
    }
  };

  // 글씨를 타이핑할 때 별가루 입자(Particle) 생성 효과
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
      return;
    }

    if (textareaRef.current) {
      const { selectionStart } = textareaRef.current;
      // 대략적인 커서 위치 계산
      const charWidth = 8;
      const lineHeight = 20;
      const lines = content.substring(0, selectionStart).split('\n');
      const curLine = lines.length - 1;
      const curCol = lines[curLine].length;
      
      const x = Math.min(curCol * charWidth + 24, textareaRef.current.clientWidth - 20);
      const y = curLine * lineHeight + 24;

      const newParticle: StarParticle = {
        id: Date.now() + Math.random(),
        x,
        y,
        size: Math.random() * 4 + 2
      };

      setParticles(prev => [...prev.slice(-15), newParticle]); // 최대 15개 유지
      
      // 애니메이션 끝나면 삭제
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== newParticle.id));
      }, 800);
    }
  };

  const handleSubmit = () => {
    if (content.trim().length < 5) {
      alert(i18n[language].minCharAlert);
      return;
    }
    onInterpret(content, mode);
  };

  const t = i18n[language];

  return (
    <div style={styles.container} className="glass-panel fade-in">
      <div style={styles.header}>
        <Sparkles size={20} color="var(--color-secondary)" style={{ animation: 'float 3s ease-in-out infinite' }} />
        <h2 style={styles.title} className="font-display text-gradient-cyan">{t.portalTitle}</h2>
      </div>

      <p style={styles.subtitle}>{t.portalSubtitle}</p>

      {/* Dream Writing Textarea Container */}
      <div style={styles.inputHeader}>
        <span style={styles.inputLabel}>{t.inputLabel}</span>
        <button onClick={onOpenSettings} style={styles.engineBadge} title={language === 'en' ? 'Change AI engine' : 'AI 엔진 변경 (AI 관리자)'}>
          ⚙️ {t.engineBadge}: <span style={{ textDecoration: 'underline', fontWeight: '600' }}>{getEngineLabel(currentEngine)}</span>
        </button>
      </div>

      <div style={styles.inputWrapper}>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.inputPlaceholder}
          style={styles.textarea}
          disabled={isProcessing}
        />
        
        {/* Star Particles Layer */}
        {particles.map(p => (
          <span 
            key={p.id}
            style={{
              ...styles.particle,
              left: `${p.x}px`,
              top: `${p.y}px`,
              width: `${p.size}px`,
              height: `${p.size}px`,
            }}
          />
        ))}

        <div style={styles.charCounter}>
          {content.length} {t.charCount}
        </div>
      </div>

      {/* Mode Selector */}
      <div style={styles.selectorContainer}>
        <span style={styles.selectorLabel}>{t.filterLabel}</span>
        <div style={styles.tabsGrid}>
          {/* Hybrid Mode */}
          <button 
            onClick={() => setMode('hybrid')}
            style={{
              ...styles.tabBtn,
              ...(mode === 'hybrid' ? styles.tabBtnActive : {})
            }}
            disabled={isProcessing}
          >
            <Compass size={16} style={{ marginRight: '6px' }} />
            {t.modeHybrid}
          </button>

          {/* Traditional Mode */}
          <button 
            onClick={() => setMode('traditional')}
            style={{
              ...styles.tabBtn,
              ...(mode === 'traditional' ? styles.tabBtnActive : {})
            }}
            disabled={isProcessing}
          >
            <Moon size={16} style={{ marginRight: '6px' }} />
            {t.modeTraditional}
          </button>

          {/* Psychological Mode */}
          <button 
            onClick={() => setMode('psychological')}
            style={{
              ...styles.tabBtn,
              ...(mode === 'psychological' ? styles.tabBtnActive : {})
            }}
            disabled={isProcessing}
          >
            <Brain size={16} style={{ marginRight: '6px' }} />
            {t.modePsychological}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button 
        onClick={handleSubmit} 
        className="glow-btn"
        style={styles.submitBtn}
        disabled={isProcessing}
      >
        <Sparkles size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
        {t.interpretBtn}
      </button>

      {/* Key tip */}
      <span style={styles.shortcutTip}>{t.shortcutTip}</span>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '90%',
    maxWidth: '720px',
    margin: '30px auto',
    padding: '32px',
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  title: {
    fontSize: '1.6rem',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    marginBottom: '24px',
    textAlign: 'center',
  },
  inputHeader: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    padding: '0 4px',
  },
  inputLabel: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  engineBadge: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '6px 14px',
    color: 'var(--color-secondary)',
    fontSize: '0.78rem',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'var(--font-primary)',
  },
  inputWrapper: {
    width: '100%',
    position: 'relative',
    marginBottom: '28px',
  },
  textarea: {
    width: '100%',
    minHeight: '180px',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '20px 20px 36px 20px',
    color: '#fff',
    fontSize: '1rem',
    fontFamily: 'var(--font-primary)',
    outline: 'none',
    resize: 'vertical',
    lineHeight: '1.6',
    transition: 'all var(--transition-normal)',
  },
  charCounter: {
    position: 'absolute',
    bottom: '12px',
    right: '16px',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
  },
  particle: {
    position: 'absolute',
    borderRadius: '50%',
    backgroundColor: 'var(--color-secondary)',
    boxShadow: '0 0 8px var(--color-secondary), 0 0 15px #fff',
    pointerEvents: 'none',
    opacity: 0,
    animation: 'particleFade 0.8s forwards ease-out',
  },
  selectorContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '28px',
  },
  selectorLabel: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
    textAlign: 'left',
    paddingLeft: '4px',
  },
  tabsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '10px',
    width: '100%',
  },
  tabBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '12px 8px',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--transition-fast)',
    outline: 'none',
  },
  tabBtnActive: {
    backgroundColor: 'hsla(180, 80%, 65%, 0.15)',
    borderColor: 'var(--color-secondary)',
    color: '#fff',
    boxShadow: '0 0 12px hsla(180, 80%, 65%, 0.2)',
  },
  submitBtn: {
    width: '100%',
    maxWidth: '280px',
    padding: '14px',
    fontSize: '1.05rem',
    fontWeight: '600',
    marginTop: '6px',
  },
  shortcutTip: {
    fontSize: '0.75rem',
    color: '#666',
    marginTop: '10px',
  }
};

// CSS particle animation injection
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes particleFade {
      0% {
        transform: translate(0, 0) scale(1);
        opacity: 1;
      }
      100% {
        transform: translate(calc(Math.random() * 20px - 10px), -40px) scale(0.2);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}
