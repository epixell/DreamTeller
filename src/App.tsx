import React, { useState, useEffect } from 'react';
import { Sparkles, Key } from 'lucide-react';
import { DreamInput } from './components/DreamInput';
import { DreamAnalyzer } from './components/DreamAnalyzer';
import { DreamReport } from './components/DreamReport';
import { AdminDashboard } from './components/AdminDashboard';
import { aiService } from './services/aiService';
import type { InterpretationResult } from './services/aiService';
import { storageService } from './services/storageService';

export default function App() {
  // Navigation
  const [currentView, setCurrentView] = useState<'main' | 'admin'>('main');
  
  // Interpretation States
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [dreamText, setDreamText] = useState('');
  const [selectedMode, setSelectedMode] = useState<'traditional' | 'psychological' | 'hybrid'>('hybrid');
  const [result, setResult] = useState<InterpretationResult | null>(null);

  // Mouse Aura Position
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // 마우스 움직임에 오라(Aura) 포인터 꼬리 달기
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 꿈 해몽하기 제출
  const handleInterpretSubmit = async (content: string, mode: 'traditional' | 'psychological' | 'hybrid') => {
    setDreamText(content);
    setSelectedMode(mode);
    startInterpretation(content, mode);
  };

  // 실제 해석 엔진 가동 로직
  const startInterpretation = async (
    content: string,
    mode: 'traditional' | 'psychological' | 'hybrid'
  ) => {
    setIsProcessing(true);
    setProgressPercent(0);
    setProgressText('무의식의 에너지를 정렬하는 중...');
    setResult(null);

    // 해석 시작 기록 감사 로그
    storageService.addAuditLog({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: 'interpretation_start',
      engineUsed: 'local-dictionary',
      details: `해몽 요청 접수. 글자수: ${content.length}자`
    });

    try {
      const interp = await aiService.interpret(
        content,
        mode,
        (progress, text) => {
          setProgressPercent(progress);
          setProgressText(text);
        }
      );
      
      // 성공 기록 감사 로그
      storageService.addAuditLog({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        eventType: 'interpretation_success',
        engineUsed: 'local-dictionary',
        details: `꿈 길이: ${content.length}글자, 해석 모드: ${mode}`
      });

      setResult(interp);
    } catch (e: any) {
      console.error('Interpretation failed', e);
      alert('꿈 해석 도중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 새로운 꿈 쓰기로 복귀
  const handleReset = () => {
    setResult(null);
    setDreamText('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. 마우스 아우라 이펙트 트래커 */}
      <div 
        className="mouse-aura" 
        style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }} 
      />

      {/* 2. 상단 헤더 영역 */}
      <header style={styles.header} className="glass-panel">
        <div style={styles.logoGroup} onClick={handleReset}>
          <div style={styles.logoIconContainer} className="star-spin">
            <Sparkles size={18} color="var(--color-accent)" />
          </div>
          <span style={styles.logoText} className="font-display text-gradient-cyan">DreamTeller</span>
        </div>
      </header>

      {/* 3. 메인 콘텐츠 분기 영역 */}
      <main style={styles.mainContent}>
        {currentView === 'admin' ? (
          /* 관리자 뷰 */
          <AdminDashboard onBackToMain={() => setCurrentView('main')} />
        ) : (
          /* 사용자 메인 뷰 */
          <div style={{ width: '100%' }}>
            {isProcessing ? (
              /* 로딩 애니메이션 */
              <DreamAnalyzer progressText={progressText} progressPercent={progressPercent} />
            ) : result ? (
              /* 해몽 리포트 */
              <DreamReport 
                dreamText={dreamText}
                result={result}
                selectedMode={selectedMode}
                onReset={handleReset}
              />
            ) : (
              /* 꿈 작성기 */
              <DreamInput onInterpret={handleInterpretSubmit} isProcessing={isProcessing} />
            )}
          </div>
        )}
      </main>

      {/* 4. 하단 푸터 영역 */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>© 2026 DreamTeller. 100% Client-Side Free Interpretation. All Rights Reserved.</p>
        <div style={styles.footerLinks}>
          {currentView === 'main' ? (
            <button onClick={() => setCurrentView('admin')} style={styles.footerLinkBtn}>
              <Key size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              Aether Gate (관리자)
            </button>
          ) : (
            <button onClick={() => setCurrentView('main')} style={styles.footerLinkBtn}>
              메인 홈으로
            </button>
          )}
        </div>
      </footer>

    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 32px',
    margin: '20px 20px 0 20px',
    borderRadius: '16px',
    height: '64px',
    boxSizing: 'border-box',
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
  },
  logoIconContainer: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    letterSpacing: '0.05em',
  },
  mainContent: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingBottom: '60px',
    width: '100%',
    boxSizing: 'border-box',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 40px',
    backgroundColor: 'rgba(5, 3, 10, 0.8)',
    borderTop: '1px solid rgba(255, 255, 255, 0.03)',
    margin: '40px 0 0 0',
    flexWrap: 'wrap',
    gap: '16px',
  },
  footerText: {
    fontSize: '0.75rem',
    color: '#666',
  },
  footerLinks: {
    display: 'flex',
    gap: '16px',
  },
  footerLinkBtn: {
    background: 'none',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    fontSize: '0.75rem',
    textDecoration: 'underline',
    transition: 'color var(--transition-fast)',
  }
};
