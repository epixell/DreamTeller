import React, { useState, useRef } from 'react';
import { Compass, Sparkles, Moon, Brain } from 'lucide-react';

interface DreamInputProps {
  onInterpret: (content: string, mode: 'traditional' | 'psychological' | 'hybrid') => void;
  isProcessing: boolean;
  currentEngine: 'chrome-nano' | 'qwen-local' | 'gemini-api' | 'mock-demo';
  onOpenSettings: () => void;
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
  onOpenSettings
}) => {
  const [content, setContent] = useState('');
  const [mode, setMode] = useState<'traditional' | 'psychological' | 'hybrid'>('hybrid');
  const [particles, setParticles] = useState<StarParticle[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getEngineLabel = (engine: string) => {
    switch (engine) {
      case 'chrome-nano': return 'Chrome 내장 AI';
      case 'qwen-local': return '로컬 AI (Qwen)';
      case 'gemini-api': return 'Gemini Cloud API';
      case 'mock-demo': return '성좌 사전 해몽';
      default: return 'AI 엔진 선택';
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
      alert('꿈의 기억을 조금만 더 자세히(최소 5자 이상) 적어주세요.');
      return;
    }
    onInterpret(content, mode);
  };

  return (
    <div style={styles.container} className="glass-panel fade-in">
      <div style={styles.header}>
        <Sparkles size={20} color="var(--color-secondary)" style={{ animation: 'float 3s ease-in-out infinite' }} />
        <h2 style={styles.title} className="font-display text-gradient-cyan">기억의 포털</h2>
      </div>

      <p style={styles.subtitle}>오늘 밤, 당신의 의식 뒤편에 남은 잔상은 무엇인가요?</p>

      {/* Dream Writing Textarea Container */}
      <div style={styles.inputHeader}>
        <span style={styles.inputLabel}>꿈의 조각들</span>
        <button onClick={onOpenSettings} style={styles.engineBadge} title="AI 엔진 변경 (AI 관리자)">
          ⚙️ AI 모델: <span style={{ textDecoration: 'underline', fontWeight: '600' }}>{getEngineLabel(currentEngine)}</span>
        </button>
      </div>

      <div style={styles.inputWrapper}>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="하늘을 날아다녔던 기억, 어두운 방에서 헤매던 기억 등 생각나는 꿈의 조각들을 자유롭게 적어보세요..."
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
          {content.length} 자
        </div>
      </div>

      {/* Mode Selector */}
      <div style={styles.selectorContainer}>
        <span style={styles.selectorLabel}>해석 필터 (해석 렌즈) 선택</span>
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
            종합 융합 분석
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
            동양 전통 해몽
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
            서양 심리학 해석
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
        무의식 해석하기
      </button>

      {/* Key tip */}
      <span style={styles.shortcutTip}>Ctrl + Enter 키로 즉시 실행 가능</span>
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
