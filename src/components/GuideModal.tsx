import React, { useState, useEffect } from 'react';
import { X, Copy, Globe, HelpCircle, Download, Check, RefreshCw } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  engineMode: 'chrome-nano' | 'qwen-local' | 'mock-demo';
  browserInfo: {
    isChrome: boolean;
    chromeAIAvailable: boolean;
    reason?: 'no' | 'after-download' | 'not-chrome';
  };
  downloadProgress: number; // 0 to 100
  downloadText: string;
  isDownloading: boolean;
  onStartQwenDownload: () => void;
  onSelectEngine: (engine: 'chrome-nano' | 'qwen-local' | 'mock-demo') => void;
  chromeSubMode?: 'setup' | 'download';
  onStartChromeDownload?: () => void;
  language: 'ko' | 'en';
}

export const GuideModal: React.FC<GuideModalProps> = ({
  isOpen,
  onClose,
  engineMode,
  browserInfo,
  downloadProgress,
  downloadText,
  isDownloading,
  onStartQwenDownload,
  onSelectEngine,
  chromeSubMode = 'setup',
  onStartChromeDownload,
  language
}) => {
  const [copiedFlag1, setCopiedFlag1] = useState(false);
  const [copiedFlag2, setCopiedFlag2] = useState(false);
  const [copiedComponents, setCopiedComponents] = useState(false);
  const [localSubMode, setLocalSubMode] = useState<'setup' | 'download'>('setup');

  useEffect(() => {
    if (isOpen && chromeSubMode) {
      setLocalSubMode(chromeSubMode);
    }
  }, [isOpen, chromeSubMode]);

  if (!isOpen) return null;

  const flag1 = 'chrome://flags/#optimization-guide-on-device-model';
  const flag2 = 'chrome://flags/#prompt-api-for-gemini-nano';
  const compUrl = 'chrome://components';

  const handleCopy = (text: string, flagNum: number) => {
    navigator.clipboard.writeText(text);
    if (flagNum === 1) {
      setCopiedFlag1(true);
      setTimeout(() => setCopiedFlag1(false), 2000);
    } else if (flagNum === 2) {
      setCopiedFlag2(true);
      setTimeout(() => setCopiedFlag2(false), 2000);
    } else {
      setCopiedComponents(true);
      setTimeout(() => setCopiedComponents(false), 2000);
    }
  };

  const isEn = language === 'en';

  return (
    <div style={styles.overlay} className="fade-in">
      <div style={styles.modal} className="glass-panel">
        <div style={styles.header}>
          <h2 style={styles.title} className="font-display text-gradient-cyan">
            <HelpCircle size={22} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            {engineMode === 'qwen-local' 
              ? (isEn ? 'Local AI Model Manager' : '로컬 AI 모델 관리자') 
              : (isEn ? 'AI Dream Gateway' : 'AI 해몽 게이트웨이')}
          </h2>
          <button onClick={onClose} style={styles.closeBtn} disabled={isDownloading}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.body}>
          {isDownloading ? (
            /* ================= 공통 다운로드 및 로딩 화면 ================= */
            <div style={styles.loadingContainer} className="fade-in">
              <Download size={40} className="float" color="var(--color-secondary)" style={{ marginBottom: '16px' }} />
              <h3 style={styles.loadingTitle} className="font-display text-gradient-cyan">
                {engineMode === 'chrome-nano' 
                  ? (isEn ? 'Activating & Diagnosing Chrome Built-in AI...' : '크롬 내장 AI 활성화 및 진단 중...') 
                  : (isEn ? 'Downloading Local AI Brain...' : '로컬 AI 두뇌를 다운로드하는 중...')}
              </h3>
              <p style={styles.loadingDesc}>
                {engineMode === 'chrome-nano' ? (
                  isEn 
                    ? 'Activating and downloading the Gemini Nano model (~1.5GB) inside Chrome. Since Chrome controls the download in the background on first run, it may take a few minutes for the status to update.'
                    : '크롬 브라우저 내부의 Gemini Nano 모델(약 1.5GB)을 다운로드 및 활성화하고 있습니다. 첫 구동 시 크롬 브라우저가 백그라운드에서 다운로드를 제어하므로 상태가 업데이트되는 데 시간이 다소 걸릴 수 있습니다.'
                ) : (
                  isEn
                    ? 'Downloading the Qwen2.5 AI model (~300MB) to interpret dreams directly on your device. This is a one-time download and will run fully locally once completed.'
                    : '기기 내에서 직접 해석할 Qwen2.5 AI 모델을 다운로드하고 있습니다. 최초 1회만 약 300MB를 다운로드하며, 완료 후 즉시 구동됩니다.'
                )}
              </p>
              
              <div style={styles.progressContainer}>
                <div style={styles.progressBarBg}>
                  <div style={{ ...styles.progressBarFill, width: `${downloadProgress}%` }} />
                </div>
                <div style={styles.progressLabels}>
                  <span>{downloadText}</span>
                  <span style={styles.percentText}>{downloadProgress}%</span>
                </div>
              </div>
              
              <p style={{ ...styles.hintText, marginTop: '20px' }}>
                {engineMode === 'chrome-nano' ? (
                  isEn
                    ? '* If unresponsive, go to chrome://components, find "Optimization Guide On Device Model", and click [Check for Update].'
                    : '* 무반응일 경우, chrome://components 로 접속하여 "Optimization Guide On Device Model"의 [업데이트 확인]을 누르시면 아주 빠르게 완료됩니다.'
                ) : (
                  isEn
                    ? '* Depending on your network speed, this may take 30 seconds to 2 minutes. Please do not close this window.'
                    : '* 네트워크 속도에 따라 30초~2분 정도 소요될 수 있습니다. 창을 닫지 마세요.'
                )}
              </p>
            </div>
          ) : engineMode === 'qwen-local' ? (
            /* ================= QWEN 로컬 AI 다운로드 동의 화면 ================= */
            <div style={styles.infoContainer} className="fade-in">
              <div style={styles.alertBox}>
                <Download size={20} color="var(--color-secondary)" style={{ marginRight: '8px', flexShrink: 0 }} />
                <div>
                  <span style={{ fontWeight: '600', color: '#fff' }}>
                    {isEn ? 'Consent to Download Local AI Model (300MB)' : '로컬 AI 모델(300MB) 다운로드 동의'}
                  </span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {isEn
                      ? 'We need to load the Qwen AI model (~300MB) into the browser to run completely independently on this device. Data charges may apply and it may take some time depending on system specifications.'
                      : '해당 기기에서 완전히 독립적으로 동작하는 Qwen AI 모델(약 300MB)을 브라우저에 적재해야 합니다. 인터넷 사용료가 발생할 수 있으며, 기기 사양에 따라 시간이 다소 걸릴 수 있습니다.'}
                  </p>
                </div>
              </div>

              <div style={styles.btnColumn}>
                <button 
                  onClick={onStartQwenDownload} 
                  className="glow-btn"
                  style={styles.actionBtn}
                >
                  {isEn ? '📦 Start Model Download (300MB)' : '📦 모델 다운로드 시작 (300MB)'}
                </button>
                <button 
                  onClick={() => onSelectEngine('mock-demo')} 
                  style={styles.secondaryBtn}
                >
                  {isEn ? '🔮 Skip download and use offline dictionary' : '🔮 다운로드 없이 로컬 사전 해몽으로 진행'}
                </button>
                <button 
                  onClick={onClose} 
                  style={styles.tertiaryBtn}
                >
                  {isEn ? 'Cancel' : '취소'}
                </button>
              </div>
            </div>
          ) : (
            /* ================= CHROME NANO 활성화 가이드 화면 ================= */
            <div style={styles.infoContainer} className="fade-in">
              {!browserInfo.isChrome ? (
                /* 크롬이 아니거나 모바일/사파리인 경우 */
                <div>
                  <div style={styles.alertBox}>
                    <Globe size={20} color="var(--color-accent)" style={{ marginRight: '8px', flexShrink: 0 }} />
                    <div>
                      <span style={{ fontWeight: '600', color: '#fff' }}>
                        {isEn ? 'Google Chrome Browser Recommended' : '구글 크롬 브라우저 사용 권장'}
                      </span>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {isEn
                          ? 'You are currently not on Google Chrome or your browser does not support built-in AI. We recommend using Google Chrome to enjoy on-device AI dream interpretation without extra setup.'
                          : '현재 크롬 브라우저가 아니거나 내장 AI를 지원하지 않는 환경입니다. 크롬 브라우저를 사용하시면 추가 설정 없이 온디바이스 AI 해몽을 즐기실 수 있습니다.'}
                      </p>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '16px 0 24px', textAlign: 'center' }}>
                    {isEn
                      ? 'In this environment, we will interpret your dream using the Star Dream Dictionary (local offline mode) which runs instantly without any download.'
                      : '현재 환경에서는 다운로드 없이 즉시 실행되는 성좌의 지혜 (로컬 사전 해몽)를 통해 꿈을 해석해 드립니다.'}
                  </p>

                  <div style={styles.btnColumn}>
                    <button 
                      onClick={() => onSelectEngine('mock-demo')} 
                      className="glow-btn"
                      style={styles.actionBtn}
                    >
                      {isEn ? '🔮 Start with Star Dream Dictionary' : '🔮 성좌의 지혜 (로컬 사전 해몽) 시작하기'}
                    </button>
                  </div>
                </div>
              ) : (
                /* 크롬 브라우저인 경우 */
                <div>
                  {browserInfo.chromeAIAvailable ? (
                    <div style={{ ...styles.alertBox, backgroundColor: 'rgba(46, 204, 113, 0.08)', borderColor: 'rgba(46, 204, 113, 0.25)' }}>
                      <Check size={20} color="#2ecc71" style={{ marginRight: '8px', flexShrink: 0 }} />
                      <div>
                        <span style={{ fontWeight: '600', color: '#fff' }}>
                          {isEn ? '✓ Chrome Gemini Nano Activated' : '✓ Chrome Gemini Nano 활성화 완료'}
                        </span>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {isEn
                            ? 'Configuration and model download are fully completed. The engine is ready to use.'
                            : '설정 및 모델 다운로드가 완전히 완료되어 사용 가능한 상태입니다.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div style={styles.alertBox}>
                      <Globe size={20} color="var(--color-secondary)" style={{ marginRight: '8px', flexShrink: 0 }} />
                      <div>
                        <span style={{ fontWeight: '600', color: '#fff' }}>
                          {isEn ? 'Steps to Activate Free Chrome Built-in AI (Gemini Nano)' : '무료 크롬 내장 AI (Gemini Nano) 활성화 단계'}
                        </span>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {isEn
                            ? 'You need to enable the free built-in AI settings in Google Chrome and download the model files to enjoy the fastest 100% on-device dream interpretation.'
                            : '구글 크롬 브라우저의 무료 내장 AI 설정을 활성화하고 모델 파일을 다운로드하셔야 가장 빠르고 쾌적하게 100% 온디바이스 해몽을 즐기실 수 있습니다.'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div style={styles.guideContainer} className="fade-in">
                    <h4 style={styles.guideHeader}>
                      {localSubMode === 'setup' 
                        ? (isEn ? 'Step 1: Chrome Flag Settings & Restart' : '1단계: 크롬 플래그 설정 및 재시작') 
                        : (isEn ? 'Step 2: Download Chrome AI Model Files' : '2단계: 크롬 AI 모델 파일 다운로드')}
                    </h4>
                    
                    {localSubMode === 'setup' ? (
                      /* ================= 1단계: 플래그 설정 가이드 ================= */
                      <div style={styles.step} className="fade-in">
                        <div style={styles.stepBadge}>1</div>
                        <div style={styles.stepContent}>
                          <span style={styles.stepLabel}>{isEn ? 'Enable Chrome Flags' : '크롬 플래그 활성화'}</span>
                          <p style={styles.stepDesc}>
                            {isEn
                              ? 'Copy each address below, paste it into your address bar, enable the settings, and restart Chrome.'
                              : '아래 각 주소를 복사해 주소창에 넣은 뒤, 각 항목을 활성화하고 크롬을 재시작합니다.'}
                          </p>
                          
                          {/* Flag 1 */}
                          <div style={{ ...styles.copyBox, marginBottom: '6px' }}>
                            <code style={styles.codeText}>{flag1}</code>
                            <button onClick={() => handleCopy(flag1, 1)} style={styles.copyBtn} title={isEn ? 'Copy link' : '주소 복사'}>
                              {copiedFlag1 ? <Check size={14} color="var(--color-secondary)" /> : <Copy size={14} />}
                            </button>
                          </div>
                          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '2px 0 16px 4px', lineHeight: '1.4' }}>
                            {isEn
                              ? '👉 After navigating, change Enables optimization guide on device value to Enabled BypassPerfRequirement.'
                              : '👉 이동 후 Enables optimization guide on device 항목의 값을 Enabled BypassPerfRequirement로 변경합니다.'}
                          </p>

                          {/* Flag 2 */}
                          <div style={{ ...styles.copyBox, marginBottom: '6px' }}>
                            <code style={styles.codeText}>{flag2}</code>
                            <button onClick={() => handleCopy(flag2, 2)} style={styles.copyBtn} title={isEn ? 'Copy link' : '주소 복사'}>
                              {copiedFlag2 ? <Check size={14} color="var(--color-secondary)" /> : <Copy size={14} />}
                            </button>
                          </div>
                          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '2px 0 16px 4px', lineHeight: '1.4' }}>
                            {isEn
                              ? '👉 After navigating, change Prompt API for Gemini Nano value to Enabled.'
                              : '👉 이동 후 Prompt API for Gemini Nano 항목의 값을 Enabled로 변경합니다.'}
                          </p>

                          <p style={{ ...styles.stepDesc, marginTop: '10px', color: 'var(--color-secondary)', fontWeight: '600' }}>
                            {isEn
                              ? '* After changing both settings, click the [Relaunch] button at the bottom right of Chrome to restart your browser.'
                              : '※ 두 설정을 변경한 뒤, 크롬 우측 하단의 [Relaunch](다시 시작) 버튼을 눌러 브라우저를 재시작해 주세요.'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* ================= 2단계: 모델 파일 다운로드 가이드 ================= */
                      <div style={styles.step} className="fade-in">
                        <div style={styles.stepBadge}>2</div>
                        <div style={styles.stepContent}>
                          <span style={styles.stepLabel}>{isEn ? 'Download Actual AI Model File' : '실제 AI 모델 파일 다운로드'}</span>
                          <p style={styles.stepDesc}>
                            {isEn
                              ? 'Copy the address below, navigate to it in your address bar, and download the actual model file.'
                              : '아래 주소를 주소창에 복사해 이동하여 실제 AI 모델 파일을 다운로드합니다.'}
                          </p>
                          
                          <div style={{ ...styles.copyBox, marginBottom: '6px' }}>
                            <code style={styles.codeText}>{compUrl}</code>
                            <button onClick={() => handleCopy(compUrl, 3)} style={styles.copyBtn} title={isEn ? 'Copy link' : '주소 복사'}>
                              {copiedComponents ? <Check size={14} color="var(--color-secondary)" /> : <Copy size={14} />}
                            </button>
                          </div>
                          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '2px 0 0 4px', lineHeight: '1.4' }}>
                            {isEn
                              ? '👉 After navigating, find Optimization Guide On Device Model and click [Check for Update] on the right. (Wait until the download completes and the version number is displayed.)'
                              : '👉 이동 후 Optimization Guide On Device Model 항목을 찾아 우측의 [업데이트 확인] 버튼을 누릅니다. (다운로드가 완료되어 버전 번호가 정상 표기될 때까지 대기합니다.)'}
                          </p>

                          {onStartChromeDownload && (
                            <div style={{ marginTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '12px' }}>
                              <button 
                                onClick={onStartChromeDownload}
                                className="glow-btn"
                                style={{
                                  padding: '8px 16px',
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  borderRadius: '20px',
                                  cursor: 'pointer',
                                  border: 'none',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                {isEn ? '⚡ Attempt Auto-Download/Activation' : '⚡ 브라우저 자동 다운로드/활성화 시도'}
                              </button>
                              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: '1.4', margin: '6px 0 0 0' }}>
                                {isEn
                                  ? '* If manual download is too tedious, click the button above. In some Chrome versions, the download starts in the background.'
                                  : '* 수동 다운로드가 번거롭다면 위 버튼을 클릭해 보세요. 일부 크롬 버전에서는 백그라운드에서 즉시 다운로드가 시작됩니다.'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div style={styles.guideFooter}>
                      {localSubMode === 'setup' ? (
                        <button 
                          onClick={() => setLocalSubMode('download')} 
                          style={styles.reloadBtn}
                        >
                          {isEn ? 'Next: Download Model ➡️' : '다음: 모델 다운받기 ➡️'}
                        </button>
                      ) : (
                        <button 
                          onClick={() => setLocalSubMode('setup')} 
                          style={styles.secondaryBtn}
                          className="settings-action-btn"
                        >
                          {isEn ? '⬅️ Prev: Show Flag Settings' : '⬅️ 이전: 플래그 설정 보기'}
                        </button>
                      )}
                      
                      <button onClick={() => window.location.reload()} style={{ ...styles.reloadBtn, backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: '#fff' }}>
                        <RefreshCw size={14} style={{ marginRight: '6px' }} /> {isEn ? 'Apply Refresh' : '새로고침 적용'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(5, 3, 10, 0.75)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    width: '90%',
    maxWidth: '520px',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    paddingBottom: '12px',
  },
  title: {
    fontSize: '1.25rem',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#bbb',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '50%',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px 10px',
    textAlign: 'center',
  },
  loadingTitle: {
    fontSize: '1.2rem',
    marginBottom: '8px',
  },
  loadingDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
    marginBottom: '24px',
  },
  progressContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  progressBarBg: {
    width: '100%',
    height: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '5px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
    boxShadow: '0 0 10px var(--color-secondary)',
    transition: 'width 0.4s ease',
  },
  progressLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
  },
  percentText: {
    color: 'var(--color-secondary)',
    fontWeight: '600',
  },
  hintText: {
    fontSize: '0.75rem',
    color: '#888',
  },
  infoContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  alertBox: {
    display: 'flex',
    backgroundColor: 'rgba(180, 80%, 65%, 0.05)',
    border: '1px solid rgba(180, 80%, 65%, 0.15)',
    borderRadius: '8px',
    padding: '16px',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  btnColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '8px',
  },
  actionBtn: {
    padding: '14px',
    fontSize: '0.95rem',
    fontWeight: '600',
  },
  secondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    padding: '12px',
    borderRadius: '30px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all var(--transition-fast)',
  },
  tertiaryBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    padding: '8px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    textDecoration: 'underline',
  },
  guideContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '4px',
  },
  guideHeader: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#fff',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '8px',
    marginBottom: '4px',
  },
  step: {
    display: 'flex',
    gap: '12px',
  },
  stepBadge: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#fff',
    flexShrink: 0,
    marginTop: '2px',
  },
  stepContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    width: '100%',
  },
  stepLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#fff',
  },
  stepDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
  },
  copyBox: {
    display: 'flex',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '6px 10px',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '4px',
  },
  codeText: {
    fontSize: '0.75rem',
    color: 'var(--color-secondary)',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    marginRight: '8px',
    fontFamily: 'monospace',
    width: '85%',
  },
  copyBtn: {
    background: 'none',
    border: 'none',
    color: '#bbb',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '14px',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  reloadBtn: {
    backgroundColor: 'var(--color-secondary)',
    border: 'none',
    color: '#111',
    fontWeight: '600',
    padding: '8px 16px',
    borderRadius: '16px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
  }
};