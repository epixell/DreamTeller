import React, { useState } from 'react';
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
  onSelectEngine
}) => {
  const [copiedFlag1, setCopiedFlag1] = useState(false);
  const [copiedFlag2, setCopiedFlag2] = useState(false);
  const [copiedComponents, setCopiedComponents] = useState(false);

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

  return (
    <div style={styles.overlay} className="fade-in">
      <div style={styles.modal} className="glass-panel">
        <div style={styles.header}>
          <h2 style={styles.title} className="font-display text-gradient-cyan">
            <HelpCircle size={22} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            {engineMode === 'qwen-local' ? '로컬 AI 모델 관리자' : 'AI 해몽 게이트웨이'}
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
                {engineMode === 'chrome-nano' ? '크롬 내장 AI 활성화 및 진단 중...' : '로컬 AI 두뇌를 다운로드하는 중...'}
              </h3>
              <p style={styles.loadingDesc}>
                {engineMode === 'chrome-nano' ? (
                  '크롬 브라우저 내부의 Gemini Nano 모델(약 1.5GB)을 다운로드 및 활성화하고 있습니다. 첫 구동 시 크롬 브라우저가 백그라운드에서 다운로드를 제어하므로 상태가 업데이트되는 데 시간이 다소 걸릴 수 있습니다.'
                ) : (
                  '기기 내에서 직접 해석할 Qwen2.5 AI 모델을 다운로드하고 있습니다. 최초 1회만 약 300MB를 다운로드하며, 완료 후 즉시 구동됩니다.'
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
                  '* 무반응일 경우, chrome://components 로 접속하여 "Optimization Guide On Device Model"의 [업데이트 확인]을 누르시면 아주 빠르게 완료됩니다.'
                ) : (
                  '* 네트워크 속도에 따라 30초~2분 정도 소요될 수 있습니다. 창을 닫지 마세요.'
                )}
              </p>
            </div>
          ) : engineMode === 'qwen-local' ? (
            /* ================= QWEN 로컬 AI 다운로드 동의 화면 ================= */
            <div style={styles.infoContainer} className="fade-in">
              <div style={styles.alertBox}>
                <Download size={20} color="var(--color-secondary)" style={{ marginRight: '8px', flexShrink: 0 }} />
                <div>
                  <span style={{ fontWeight: '600', color: '#fff' }}>로컬 AI 모델(300MB) 다운로드 동의</span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    해당 기기에서 완전히 독립적으로 동작하는 Qwen AI 모델(약 300MB)을 브라우저에 적재해야 합니다.
                    인터넷 사용료가 발생할 수 있으며, 기기 사양에 따라 시간이 다소 걸릴 수 있습니다.
                  </p>
                </div>
              </div>

              <div style={styles.btnColumn}>
                <button 
                  onClick={onStartQwenDownload} 
                  className="glow-btn"
                  style={styles.actionBtn}
                >
                  📦 모델 다운로드 시작 (300MB)
                </button>
                <button 
                  onClick={() => onSelectEngine('mock-demo')} 
                  style={styles.secondaryBtn}
                >
                  🔮 다운로드 없이 로컬 사전 해몽으로 진행
                </button>
                <button 
                  onClick={onClose} 
                  style={styles.tertiaryBtn}
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            /* ================= CHROME NANO 활성화 가이드 화면 ================= */
            <div style={styles.infoContainer} className="fade-in">
              {browserInfo.isChrome && !browserInfo.chromeAIAvailable ? (
                /* 크롬이지만 설정이 꺼진 경우 */
                <div>
                  <div style={styles.alertBox}>
                    <Globe size={20} color="var(--color-secondary)" style={{ marginRight: '8px', flexShrink: 0 }} />
                    <div>
                      <span style={{ fontWeight: '600', color: '#fff' }}>무료 크롬 내장 AI (Gemini Nano) 활성화 단계</span>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        구글 크롬 브라우저의 무료 내장 AI 설정을 활성화하고 모델 파일을 다운로드하셔야 
                        가장 빠르고 쾌적하게 100% 온디바이스 해몽을 즐기실 수 있습니다.
                      </p>
                    </div>
                  </div>

                  <div style={styles.guideContainer} className="fade-in">
                    <h4 style={styles.guideHeader}>크롬 내장 AI(Gemini Nano) 설정 및 다운로드 3단계</h4>
                    
                    <div style={styles.step}>
                      <div style={styles.stepBadge}>1</div>
                      <div style={styles.stepContent}>
                        <span style={styles.stepLabel}>크롬 플래그 설정 및 재시작 (최초 1회)</span>
                        <p style={styles.stepDesc}>아래 주소들을 각각 복사해 주소창에 넣은 뒤 설정을 변경하고 크롬을 재시작합니다.</p>
                        
                        <div style={{ ...styles.copyBox, marginBottom: '6px' }}>
                          <code style={styles.codeText}>{flag1}</code>
                          <button onClick={() => handleCopy(flag1, 1)} style={styles.copyBtn} title="복사">
                            {copiedFlag1 ? <Check size={14} color="var(--color-secondary)" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#aaa', marginLeft: '4px' }}>➡️ 값을 <b>Enabled BypassPerfRequirement</b>로 변경</span>

                        <div style={{ ...styles.copyBox, marginTop: '8px', marginBottom: '6px' }}>
                          <code style={styles.codeText}>{flag2}</code>
                          <button onClick={() => handleCopy(flag2, 2)} style={styles.copyBtn} title="복사">
                            {copiedFlag2 ? <Check size={14} color="var(--color-secondary)" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#aaa', marginLeft: '4px' }}>➡️ 값을 <b>Enabled</b>로 변경</span>

                        <p style={{ ...styles.stepDesc, marginTop: '8px', color: 'var(--color-secondary)' }}>
                          ※ 설정 후 크롬 맨 아래에 나타나는 <b>[Relaunch]</b>(다시 시작) 버튼을 꼭 눌러주세요.
                        </p>
                      </div>
                    </div>

                    <div style={styles.step}>
                      <div style={styles.stepBadge}>2</div>
                      <div style={styles.stepContent}>
                        <span style={styles.stepLabel}>실제 AI 모델 파일 다운로드</span>
                        <p style={styles.stepDesc}>아래 주소를 주소창에 복사해 이동하여 실제 AI 모델 파일을 다운로드합니다.</p>
                        
                        <div style={styles.copyBox}>
                          <code style={styles.codeText}>{compUrl}</code>
                          <button onClick={() => handleCopy(compUrl, 3)} style={styles.copyBtn} title="복사">
                            {copiedComponents ? <Check size={14} color="var(--color-secondary)" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <p style={{ ...styles.stepDesc, marginTop: '6px' }}>
                          이동 후 <b>"Optimization Guide On Device Model"</b> 항목을 찾아 우측의 <b>[업데이트 확인]</b> 버튼을 누르면 다운로드가 시작됩니다. (버전이 0.0.0.0에서 실제 숫자 버전으로 바뀔 때까지 기다립니다.)
                        </p>
                      </div>
                    </div>

                    <div style={styles.step}>
                      <div style={styles.stepBadge}>3</div>
                      <div style={styles.stepContent}>
                        <span style={styles.stepLabel}>완료 및 새로고침 적용</span>
                        <p style={styles.stepDesc}>다운로드가 끝나면 아래 [새로고침 적용] 버튼을 눌러 상태를 갱신합니다.</p>
                      </div>
                    </div>

                    <div style={styles.guideFooter}>
                      <button onClick={() => onSelectEngine('mock-demo')} style={styles.backBtn}>🔮 사전 해몽으로 체인지</button>
                      <button onClick={() => window.location.reload()} style={styles.reloadBtn}>
                        <RefreshCw size={14} style={{ marginRight: '6px' }} /> 새로고침 적용
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* 크롬이 아니거나 모바일/사파리인 경우 */
                <div>
                  <div style={styles.alertBox}>
                    <Globe size={20} color="var(--color-accent)" style={{ marginRight: '8px', flexShrink: 0 }} />
                    <div>
                      <span style={{ fontWeight: '600', color: '#fff' }}>구글 크롬 브라우저 사용 권장</span>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        현재 크롬 브라우저가 아니거나 내장 AI를 지원하지 않는 환경입니다. 크롬 브라우저를 사용하시면 추가 설정 없이 온디바이스 AI 해몽을 즐기실 수 있습니다.
                      </p>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '16px 0 24px', textAlign: 'center' }}>
                    현재 환경에서는 다운로드 없이 즉시 실행되는 **성좌의 지혜 (로컬 사전 해몽)**를 통해 꿈을 해석해 드립니다.
                  </p>

                  <div style={styles.btnColumn}>
                    <button 
                      onClick={() => onSelectEngine('mock-demo')} 
                      className="glow-btn"
                      style={styles.actionBtn}
                    >
                      🔮 성좌의 지혜 (로컬 사전 해몽) 시작하기
                    </button>
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