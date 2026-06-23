import React, { useState, useEffect } from 'react';
import { Sparkles, Key, Settings as SettingsIcon, Send, Globe, BookOpen } from 'lucide-react';
import { DreamInput } from './components/DreamInput';
import { DreamAnalyzer } from './components/DreamAnalyzer';
import { DreamReport } from './components/DreamReport';
import { AdminDashboard } from './components/AdminDashboard';
import { SettingsModal } from './components/SettingsModal';
import { GuideModal } from './components/GuideModal';
import { DreamBlog } from './components/DreamBlog';
import { InfoModal } from './components/InfoModal';
import { aiService } from './services/aiService';
import { storageService } from './services/storageService';
import type { AppSettings, ChatSession, ChatMessage } from './services/storageService';
import { chromeAIService } from './services/chromeAIService';
import { qwenAIService } from './services/qwenAIService';
import { useTranslation } from 'react-i18next';

export default function App() {
  const { t, i18n: i18nInstance } = useTranslation();
  // Navigation & Modals
  const [currentView, setCurrentView] = useState<'main' | 'admin' | 'blog'>('main');
  const [selectedBlogPostId, setSelectedBlogPostId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [infoType, setInfoType] = useState<'privacy' | 'about-contact'>('privacy');
  const [chromeSubMode, setChromeSubMode] = useState<'setup' | 'download'>('setup');
  
  // Interpretation States
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);

  // Chat Session State (Single-session in-memory)
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [followUpText, setFollowUpText] = useState('');
  const [isChatProcessing, setIsChatProcessing] = useState(false);
  const [chatProgressText, setChatProgressText] = useState('');
  const [chatProgressPercent, setChatProgressPercent] = useState(0);

  // App Settings State
  const [settings, setSettings] = useState<AppSettings>({
    preferredEngine: 'chrome-nano',
    theme: 'mystic',
    language: 'ko'
  });

  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

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
    i18nInstance.changeLanguage(stored.language);

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

    // 4. URL 쿼리 스트링 파싱하여 블로그 딥링크 연동 (?post=xxx)
    const params = new URLSearchParams(window.location.search);
    const postParam = params.get('post');
    if (postParam) {
      setSelectedBlogPostId(postParam);
      setCurrentView('blog');
    }

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Click-outside listener for language dropdown
  useEffect(() => {
    if (!isLangDropdownOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.lang-toggle-btn') && !target.closest('.lang-dropdown-menu')) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isLangDropdownOpen]);

  // 설정 저장 완료 후 동기화
  const handleSettingsChange = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  const handleSelectEngine = (engine: 'chrome-nano' | 'qwen-local' | 'mock-demo') => {
    const updated = { ...settings, preferredEngine: engine };
    setSettings(updated);
    storageService.saveSettings(updated);
  };

  const handleSelectLanguage = (lang: 'ko' | 'en' | 'ja' | 'zh-TW') => {
    const updated = { ...settings, language: lang };
    setSettings(updated);
    storageService.saveSettings(updated);
    i18nInstance.changeLanguage(lang);
    setIsLangDropdownOpen(false);
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
    setDownloadText(settings.language === 'en' ? 'Starting Chrome AI model download activation...' : '크롬 AI 모델 다운로드 활성화 시작 중...');

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
      alert(settings.language === 'en' ? "Chrome built-in AI model has been downloaded successfully!" : "크롬 내장 AI 모델이 다운로드 완료되었습니다!");
      
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
    }
  };

  // Qwen AI 모델 다운로드 수행 로직
  const handleStartQwenDownload = async (pendingContent?: string, pendingMode?: 'traditional' | 'psychological' | 'hybrid') => {
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadText(settings.language === 'en' ? 'Preparing AI library and model download...' : 'AI 라이브러리 및 모델 다운로드 준비 중...');

    try {
      await qwenAIService.initEngine((progress, text) => {
        setDownloadProgress(progress);
        setDownloadText(text);
      });

      setIsDownloading(false);
      setIsGuideOpen(false); // 다운로드 가이드 창 닫기

      // 꿈 해석 대기 큐가 있었다면 즉시 구동
      if (pendingContent && pendingMode) {
        startInterpretation(pendingContent, pendingMode);
      }
    } catch (e: any) {
      console.error(e);
      alert(settings.language === 'en' ? `Error during local AI model download: ${e.message || e}` : `로컬 AI 모델 다운로드 중 오류 발생: ${e.message || e}`);
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
          currentSettings.language === 'en'
            ? "Would you like to download the local AI model (approx. 300MB)?\n\nThis is a one-time download, after which dreams will be interpreted directly inside your browser without any network connection."
            : "로컬 AI 모델(약 300MB)을 다운로드하시겠습니까?\n\n최초 1회만 다운로드하며 브라우저 내부에서 네트워크 연결 없이 직접 꿈을 해석하게 됩니다."
        );
        if (!confirmDownload) {
          return; // 다운로드 취소 시 중단
        }
        setIsGuideOpen(true);
        handleStartQwenDownload(content, mode);
        return;
      }
      
      // 이미 모델이 브라우저 캐시에 존재하면 가이드창 없이 즉시 해석 로딩 화면(DreamAnalyzer)으로 진입
      startInterpretation(content, mode);
      return;
    }

    // 2. 크롬 내장 AI가 선택되었는데 활성화되어 있지 않은 경우
    if (preferredEngine === 'chrome-nano' && !browserInfo.chromeAIAvailable) {
      setIsGuideOpen(true);
      return;
    }

    // 3. 정상 상태일 때 해석 실행
    startInterpretation(content, mode);
  };

  // 실제 해석 실행 메커니즘
  const startInterpretation = async (
    content: string,
    mode: 'traditional' | 'psychological' | 'hybrid'
  ) => {
    setIsProcessing(true);
    setProgressPercent(0);
    setProgressText(settings.language === 'en' ? 'Aligning the energies of your subconscious...' : '무의식의 에너지를 정렬하는 중...');

    const activeSettings = storageService.getSettings();

    // 해석 시작 감사 로그 남기기
    storageService.addAuditLog({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: 'interpretation_start',
      engineUsed: activeSettings.preferredEngine,
      details: `Dream length: ${content.length} chars, mode: ${mode}`
    });

    try {
      const interp = await aiService.interpret(
        content,
        mode,
        settings.language,
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
        details: `Interpretation success`
      });

      // 신규 채팅 세션 생성
      const newSession: ChatSession = {
        id: `session_${Date.now()}`,
        title: content.trim().length > 15 ? content.trim().substring(0, 15) + '...' : content.trim(),
        date: new Date().toLocaleDateString(settings.language === 'en' ? 'en-US' : 'ko-KR', { month: 'short', day: 'numeric' }),
        mode: mode,
        messages: [
          {
            id: `msg_user_${Date.now()}`,
            sender: 'user',
            timestamp: new Date().toISOString(),
            text: content
          },
          {
            id: `msg_ai_${Date.now()}`,
            sender: 'ai',
            timestamp: new Date().toISOString(),
            text: t('aiResponseSuccess'),
            interpretation: interp
          }
        ]
      };

      setActiveSession(newSession);
    } catch (e: any) {
      console.error('Interpretation failed', e);
      alert(settings.language === 'en' ? 'An error occurred during dream interpretation.' : '꿈 해석 도중 오류가 발생했습니다.');
      
      // 실패 감사 로그 남기기
      storageService.addAuditLog({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        eventType: 'interpretation_fail',
        engineUsed: activeSettings.preferredEngine,
        details: `Fail reason: ${e.message || e}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 새로운 꿈 쓰기로 초기화
  const handleReset = () => {
    setActiveSession(null);
    setCurrentView('main');
    setSelectedBlogPostId(null);
  };

  // 후속 꼬리 질문 전송
  const handleSendFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpText.trim() || !activeSession || isChatProcessing) return;

    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toISOString(),
      text: followUpText.trim()
    };

    // 로컬 세션 데이터 업데이트
    const updatedSession = {
      ...activeSession,
      messages: [...activeSession.messages, userMessage]
    };
    
    setActiveSession(updatedSession);
    setFollowUpText('');

    // AI 응답 처리 시작
    setIsChatProcessing(true);
    setChatProgressText(t('aiChatConnecting'));
    setChatProgressPercent(20);

    try {
      const initialDream = activeSession.messages[0].text;
      const initialResult = activeSession.messages[1].interpretation;
      
      if (!initialResult) throw new Error('최초 해몽 결과가 존재하지 않습니다.');

      const chatHistory = activeSession.messages.slice(2).map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const responseText = await aiService.chat(
        chatHistory,
        userMessage.text,
        initialDream,
        initialResult,
        settings.language,
        (progress, text) => {
          setChatProgressPercent(progress);
          setChatProgressText(text);
        }
      );

      const aiMessage: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        text: responseText
      };

      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, aiMessage]
      };

      setActiveSession(finalSession);
    } catch (err) {
      console.error('Follow-up chat failed:', err);
      
      const errorMessage: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        text: t('aiChatError')
      };

      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, errorMessage]
      };
      
      setActiveSession(finalSession);
    } finally {
      setIsChatProcessing(false);
      setChatProgressPercent(0);
      setChatProgressText('');
    }
  };


  return (
    <div className="app-container">

      <div className="main-wrapper">
        
        {/* 마우스 아우라 이펙트 */}
        <div 
          className="mouse-aura" 
          style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }} 
        />

        {/* 2. 상단 헤더 영역 */}
        <header style={styles.header} className="glass-panel">
          <div style={styles.logoGroup}>
            <div style={styles.logoClickable} onClick={handleReset}>
              <div style={styles.logoIconContainer} className="star-spin">
                <Sparkles size={18} color="var(--color-accent)" />
              </div>
              <span style={styles.logoText} className="font-display text-gradient-cyan">DreamTeller</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button 
              onClick={() => {
                setCurrentView(currentView === 'blog' ? 'main' : 'blog');
                setSelectedBlogPostId(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: currentView === 'blog' ? 'var(--color-secondary)' : 'var(--text-main)',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title={settings.language === 'en' ? "Dream Library (Blog)" : "기억의 서고 (블로그)"}
            >
              <BookOpen size={16} />
              <span>{settings.language === 'en' ? 'Library' : '기억의 서고'}</span>
            </button>
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)} 
                style={styles.langBtn} 
                title="Select Language / 언어 선택 / 言語選択 / 選擇語言"
                className="lang-toggle-btn"
              >
                <Globe size={16} color="var(--color-secondary)" style={{ marginRight: '6px' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', textTransform: 'uppercase' }}>
                  {settings.language === 'zh-TW' ? 'ZH' : settings.language.toUpperCase()}
                </span>
              </button>

              {isLangDropdownOpen && (
                <div style={styles.langDropdown} className="glass-panel lang-dropdown-menu fade-in">
                  <button 
                    onClick={() => handleSelectLanguage('ko')} 
                    style={{
                      ...styles.dropdownItem,
                      color: settings.language === 'ko' ? 'var(--color-secondary)' : 'var(--text-main)',
                      fontWeight: settings.language === 'ko' ? 600 : 400
                    }}
                  >
                    🇰🇷 한국어
                  </button>
                  <button 
                    onClick={() => handleSelectLanguage('en')} 
                    style={{
                      ...styles.dropdownItem,
                      color: settings.language === 'en' ? 'var(--color-secondary)' : 'var(--text-main)',
                      fontWeight: settings.language === 'en' ? 600 : 400
                    }}
                  >
                    🇺🇸 English
                  </button>
                  <button 
                    onClick={() => handleSelectLanguage('ja')} 
                    style={{
                      ...styles.dropdownItem,
                      color: settings.language === 'ja' ? 'var(--color-secondary)' : 'var(--text-main)',
                      fontWeight: settings.language === 'ja' ? 600 : 400
                    }}
                  >
                    🇯🇵 日本語
                  </button>
                  <button 
                    onClick={() => handleSelectLanguage('zh-TW')} 
                    style={{
                      ...styles.dropdownItem,
                      color: settings.language === 'zh-TW' ? 'var(--color-secondary)' : 'var(--text-main)',
                      fontWeight: settings.language === 'zh-TW' ? 600 : 400
                    }}
                  >
                    🇹🇼 繁體中文
                  </button>
                </div>
              )}
            </div>

            <button 
              onClick={() => setIsSettingsOpen(true)} 
              style={styles.settingsBtn} 
              title={settings.language === 'en' ? "AI control panel" : "AI 관리자 (설정)"}
            >
              <SettingsIcon size={20} color="var(--color-secondary)" />
            </button>
          </div>
        </header>

        {/* 3. 메인 콘텐츠 */}
        <main style={styles.mainContent}>
          {currentView === 'admin' ? (
            <AdminDashboard onBackToMain={() => setCurrentView('main')} language={settings.language} />
          ) : currentView === 'blog' ? (
            <DreamBlog 
              language={settings.language} 
              onBackToMain={() => {
                setCurrentView('main');
                setSelectedBlogPostId(null);
              }} 
              initialPostId={selectedBlogPostId}
            />
          ) : (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              {isProcessing ? (
                // 최초 해몽 진행중인 경우 로딩 화면 렌더링
                <DreamAnalyzer progressText={progressText} progressPercent={progressPercent} />
              ) : activeSession ? (
                // 활성화된 채팅 세션이 있는 경우
                <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, width: '100%' }}>
                  <div className="chat-messages-list">
                    {activeSession.messages.map((msg, index) => {
                      const isUser = msg.sender === 'user';
                      
                      // 두 번째 메시지(첫 AI 메시지)인 경우, 해석 리포트 카드 렌더링
                      if (!isUser && index === 1 && msg.interpretation) {
                        return (
                          <div key={msg.id} className="chat-bubble ai">
                            <DreamReport 
                              dreamText={activeSession.messages[0].text}
                              result={msg.interpretation}
                              selectedMode={activeSession.mode}
                              onReset={handleReset}
                              inlineMode={true}
                              language={settings.language}
                              onNavigateToBlogPost={(postId) => {
                                setSelectedBlogPostId(postId);
                                setCurrentView('blog');
                              }}
                            />
                          </div>
                        );
                      }

                      // 일반 대화 말풍선 렌더링
                      return (
                        <div 
                          key={msg.id} 
                          className={`chat-bubble ${isUser ? 'user' : 'ai chat-text-bubble'}`}
                        >
                          <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                          <div style={styles.bubbleDate}>
                            {new Date(msg.timestamp).toLocaleTimeString(settings.language === 'en' ? 'en-US' : 'ko-KR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      );
                    })}

                    {/* 후속 질문 대화 AI 타이핑 진행 상황 로딩 */}
                    {isChatProcessing && (
                      <div className="chat-bubble ai chat-text-bubble">
                        <div className="chat-typing-progress">
                          <span>{chatProgressText}</span>
                          <div style={{
                            width: '100%',
                            height: '4px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '2px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${chatProgressPercent}%`,
                              height: '100%',
                              backgroundColor: 'var(--color-secondary)',
                              borderRadius: '2px',
                              transition: 'width 0.3s'
                            }} />
                          </div>
                          <div className="chat-typing-indicator">
                            <div className="chat-typing-dot" />
                            <div className="chat-typing-dot" />
                            <div className="chat-typing-dot" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 하단 고정형 채팅 메시지 입력바 */}
                  <div className="chat-input-bar-container">
                    <form onSubmit={handleSendFollowUp} className="chat-input-bar">
                      <input 
                        type="text"
                        value={followUpText}
                        onChange={(e) => setFollowUpText(e.target.value)}
                        placeholder={t('chatInputPlaceholder')}
                        className="chat-input-field"
                        disabled={isChatProcessing}
                      />
                      <button 
                        type="submit" 
                        className="chat-send-btn"
                        disabled={isChatProcessing || !followUpText.trim()}
                      >
                        <Send size={14} />
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                // 새 채팅 상태 (활성화 대화 없음)
                <DreamInput 
                  onInterpret={handleInterpretSubmit} 
                  isProcessing={isProcessing} 
                  currentEngine={settings.preferredEngine}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                  language={settings.language}
                />
              )}
            </div>
          )}
        </main>

        {/* 4. 하단 푸터 영역 */}
        <footer style={styles.footer}>
          <p style={styles.footerText}>© 2026 DreamTeller. Client-Side On-Device AI Dream Interpretation. All Rights Reserved.</p>
          <div style={styles.footerLinks}>
            <button onClick={() => { setInfoType('privacy'); setIsInfoOpen(true); }} style={styles.footerLinkBtn}>
              {t('privacyPolicy')}
            </button>
            <span style={{ color: '#444', fontSize: '0.75rem' }}>|</span>
            <button onClick={() => { setInfoType('about-contact'); setIsInfoOpen(true); }} style={styles.footerLinkBtn}>
              {t('aboutAndContact')}
            </button>
            <span style={{ color: '#444', fontSize: '0.75rem' }}>|</span>
            {currentView === 'main' ? (
              <button onClick={() => setCurrentView('admin')} style={styles.footerLinkBtn}>
                <Key size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                {t('aetherGate')}
              </button>
            ) : (
              <button onClick={() => setCurrentView('main')} style={styles.footerLinkBtn}>
                {t('backToHome')}
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
          language={settings.language}
        />

        <InfoModal 
          isOpen={isInfoOpen}
          onClose={() => setIsInfoOpen(false)}
          type={infoType}
          language={settings.language}
        />

      </div>
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
  },
  menuBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '10px',
  },
  logoClickable: {
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
  langBtn: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-color)',
    borderRadius: '20px',
    padding: '0 12px',
    height: '38px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    outline: 'none',
  },
  langDropdown: {
    position: 'absolute',
    top: '44px',
    right: '0',
    backgroundColor: 'rgba(15, 10, 25, 0.92)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    zIndex: 1000,
    width: '120px',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
  },
  dropdownItem: {
    background: 'none',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '0.8rem',
    textAlign: 'left',
    cursor: 'pointer',
    width: '100%',
    transition: 'background-color 0.2s, color 0.2s',
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
  bubbleDate: {
    fontSize: '0.65rem',
    opacity: 0.4,
    marginTop: '6px',
    textAlign: 'right',
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
