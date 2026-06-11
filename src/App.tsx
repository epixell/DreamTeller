import React, { useState, useEffect } from 'react';
import { Sparkles, Key, Settings as SettingsIcon } from 'lucide-react';
import { DreamInput } from './components/DreamInput';
import { DreamAnalyzer } from './components/DreamAnalyzer';
import { DreamReport } from './components/DreamReport';
import { AdminDashboard } from './components/AdminDashboard';
import { SettingsModal } from './components/SettingsModal';
import { GuideModal } from './components/GuideModal';
import { aiService } from './services/aiService';
import type { InterpretationResult } from './services/aiService';
import { storageService } from './services/storageService';
import type { AppSettings } from './services/storageService';
import { chromeAIService } from './services/chromeAIService';
import { qwenAIService } from './services/qwenAIService';

export default function App() {
  // Navigation & Modals
  const [currentView, setCurrentView] = useState<'main' | 'admin'>('main');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [chromeSubMode, setChromeSubMode] = useState<'setup' | 'download'>('setup');
  
  // Interpretation States
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [dreamText, setDreamText] = useState('');
  const [selectedMode, setSelectedMode] = useState<'traditional' | 'psychological' | 'hybrid'>('hybrid');
  const [result, setResult] = useState<InterpretationResult | null>(null);

  // App Settings State
  const [settings, setSettings] = useState<AppSettings>({
    preferredEngine: 'chrome-nano',
    theme: 'mystic'
  });

  // Browser Diagnostics Info
  const [browserInfo, setBrowserInfo] = useState<{
    isChrome: boolean;
    chromeAIAvailable: boolean;
    reason?: 'no' | 'after-download' | 'not-chrome';
  }>({ isChrome: false, chromeAIAvailable: false });

  // WebLLM Qwen Download States
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadText, setDownloadText] = useState('');

  // Mouse Aura Position
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // 1. 설정 정보 불러오기
    const stored = storageService.getSettings();
    setSettings(stored);

    // 2. 브라우저 크롬 AI 상태 확인
    const checkBrowser = async () => {
      const isChrome = /Chrome|Chromium|Edg/.test(navigator.userAgent);
      const aiStatus = await chromeAIService.isAvailable();
      setBrowserInfo({
        isChrome,
        chromeAIAvailable: aiStatus.available,
        reason: aiStatus.reason
      });
    };
    checkBrowser();

    // 3. 마우스 움직임에 아우라(Aura) 포인터 효과 설정
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 설정 저장 완료 후 동기화
  const handleSettingsChange = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  const handleSelectEngine = (engine: 'chrome-nano' | 'qwen-local' | 'mock-demo') => {
    const updated = { ...settings, preferredEngine: engine };
    setSettings(updated);
    storageService.saveSettings(updated);
  };

  const handleTriggerQwenDownload = () => {
    // 로컬 AI 설정 활성화
    const updated = { ...settings, preferredEngine: 'qwen-local' as const };
    setSettings(updated);
    storageService.saveSettings(updated);
    
    setIsSettingsOpen(false); // Settings 창 닫기
    setIsGuideOpen(true);     // 가이드 창 열기
    handleStartQwenDownload(); // 다운로드 개시
  };

  const handleTriggerChromeGuide = () => {
    // 크롬 AI 설정 활성화
    const updated = { ...settings, preferredEngine: 'chrome-nano' as const };
    setSettings(updated);
    storageService.saveSettings(updated);

    setChromeSubMode('setup');
    setIsSettingsOpen(false); // Settings 창 닫기
    setIsGuideOpen(true);     // 가이드 창 열기
  };

  const handleTriggerChromeDownload = () => {
    // 크롬 AI 설정 활성화
    const updated = { ...settings, preferredEngine: 'chrome-nano' as const };
    setSettings(updated);
    storageService.saveSettings(updated);

    setChromeSubMode('download');
    setIsSettingsOpen(false); // Settings 창 닫기
    setIsGuideOpen(true);     // 가이드 창 열기
  };

  const handleStartChromeDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadText('크롬 AI 모델 다운로드 활성화 시작 중...');

    try {
      // 크롬 AI 세션 생성을 강제 호출하여 다운로드 개시 및 모니터링
      await chromeAIService.prompt(
        "You are a helpful assistant.",
        "Warm greetings.", 
        (progress, text) => {
          setDownloadProgress(progress);
          setDownloadText(text);
        }
      );
      
      setIsDownloading(false);
      setIsGuideOpen(false);
      alert("크롬 내장 AI 모델이 다운로드 완료되었습니다!");
      
      // 브라우저 정보 리프레시
      const aiStatus = await chromeAIService.isAvailable();
      setBrowserInfo(prev => ({
        ...prev,
        chromeAIAvailable: aiStatus.available,
        reason: aiStatus.reason
      }));
    } catch (e: any) {
      console.warn("Chrome AI Download session trigger end:", e);
      setIsDownloading(false);
      // 경고창 대신 가이드 모달에서 자연스럽게 다운로드 방법을 확인하도록 유도 (alert 제거)
    }
  };

  // Qwen AI 모델 다운로드 수행 로직
  const handleStartQwenDownload = async (pendingContent?: string, pendingMode?: 'traditional' | 'psychological' | 'hybrid') => {
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadText('AI 라이브러리 및 모델 다운로드 준비 중...');

    try {
      await qwenAIService.initEngine((progress, text) => {
        setDownloadProgress(progress);
        setDownloadText(text);
      });

      setIsDownloading(false);
      setIsGuideOpen(false); // 다운로드 가이드 창 닫기

      // 꿈 해석 대기 큐가 있었다면 즉시 구동
      if (pendingContent && pendingMode) {
        setDreamText(pendingContent);
        setSelectedMode(pendingMode);
        startInterpretation(pendingContent, pendingMode);
      }
    } catch (e: any) {
      console.error(e);
      alert(`로컬 AI 모델 다운로드 중 오류 발생: ${e.message || e}`);
      setIsDownloading(false);
    }
  };

  // 꿈 해석하기 제출
  const handleInterpretSubmit = async (content: string, mode: 'traditional' | 'psychological' | 'hybrid') => {
    const currentSettings = storageService.getSettings();
    const preferredEngine = currentSettings.preferredEngine;

    // 1. 로컬 AI 모델(Qwen)이 선택되었고 아직 구동 엔진이 로딩되지 않은 경우
    if (preferredEngine === 'qwen-local' && !qwenAIService.isLoaded()) {
      const isCached = await qwenAIService.checkModelCached();
      if (!isCached) {
        const confirmDownload = window.confirm(
          "로컬 AI 모델(약 300MB)을 다운로드하시겠습니까?\n\n최초 1회만 다운로드하며 브라우저 내부에서 네트워크 연결 없이 직접 꿈을 해석하게 됩니다."
        );
        if (!confirmDownload) {
          return; // 다운로드 취소 시 중단
        }
        setIsGuideOpen(true);
        handleStartQwenDownload(content, mode);
        return;
      }
      
      // 이미 모델이 브라우저 캐시에 존재하면 가이드창 없이 즉시 해석 로딩 화면(DreamAnalyzer)으로 진입
      setDreamText(content);
      setSelectedMode(mode);
      startInterpretation(content, mode);
      return;
    }

    // 2. 크롬 내장 AI가 선택되었는데 활성화되어 있지 않은 경우
    if (preferredEngine === 'chrome-nano' && !browserInfo.chromeAIAvailable) {
      setIsGuideOpen(true);
      return;
    }

    // 3. 정상 상태일 때 해석 실행
    setDreamText(content);
    setSelectedMode(mode);
    startInterpretation(content, mode);
  };

  // 실제 해석 실행 메커니즘
  const startInterpretation = async (
    content: string,
    mode: 'traditional' | 'psychological' | 'hybrid'
  ) => {
    setIsProcessing(true);
    setProgressPercent(0);
    setProgressText('무의식의 에너지를 정렬하는 중...');
    setResult(null);

    const activeSettings = storageService.getSettings();

    // 해석 시작 감사 로그 남기기
    storageService.addAuditLog({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: 'interpretation_start',
      engineUsed: activeSettings.preferredEngine,
      details: `꿈 길이: ${content.length}자, 해석 모드: ${mode}`
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
      
      // 해석 성공 감사 로그 남기기
      storageService.addAuditLog({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        eventType: 'interpretation_success',
        engineUsed: activeSettings.preferredEngine,
        details: `해석 성공`
      });

      setResult(interp);
    } catch (e: any) {
      console.error('Interpretation failed', e);
      alert('꿈 해석 도중 오류가 발생했습니다.');
      
      // 실패 감사 로그 남기기
      storageService.addAuditLog({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        eventType: 'interpretation_fail',
        engineUsed: activeSettings.preferredEngine,
        details: `실패 원인: ${e.message || e}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 새로운 꿈 쓰기로 초기화
  const handleReset = () => {
    setResult(null);
    setDreamText('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. 마우스 아우라 이펙트 */}
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
        
        {currentView === 'main' && (
          <button 
            onClick={() => setIsSettingsOpen(true)} 
            style={styles.settingsBtn} 
            title="AI 관리자 (설정)"
          >
            <SettingsIcon size={20} color="var(--color-secondary)" />
          </button>
        )}
      </header>

      {/* 3. 메인 콘텐츠 */}
      <main style={styles.mainContent}>
        {currentView === 'admin' ? (
          <AdminDashboard onBackToMain={() => setCurrentView('main')} />
        ) : (
          <div style={{ width: '100%' }}>
            {isProcessing ? (
              <DreamAnalyzer progressText={progressText} progressPercent={progressPercent} />
            ) : result ? (
              <DreamReport 
                dreamText={dreamText}
                result={result}
                selectedMode={selectedMode}
                onReset={handleReset}
              />
            ) : (
              <DreamInput 
                onInterpret={handleInterpretSubmit} 
                isProcessing={isProcessing} 
                currentEngine={settings.preferredEngine}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            )}
          </div>
        )}
      </main>

      {/* 4. 하단 푸터 영역 */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>© 2026 DreamTeller. Client-Side On-Device AI Dream Interpretation. All Rights Reserved.</p>
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

      {/* 5. 모달 오버레이 관리 */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onSettingsChange={handleSettingsChange}
        browserInfo={browserInfo}
        onTriggerQwenDownload={handleTriggerQwenDownload}
        onTriggerChromeGuide={handleTriggerChromeGuide}
        onTriggerChromeDownload={handleTriggerChromeDownload}
      />

      <GuideModal 
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        engineMode={settings.preferredEngine}
        browserInfo={browserInfo}
        downloadProgress={downloadProgress}
        downloadText={downloadText}
        isDownloading={isDownloading}
        onStartQwenDownload={() => handleStartQwenDownload()}
        onSelectEngine={handleSelectEngine}
        chromeSubMode={chromeSubMode}
        onStartChromeDownload={handleStartChromeDownload}
      />

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
  settingsBtn: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-color)',
    borderRadius: '50%',
    width: '38px',
    height: '38px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    outline: 'none',
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
