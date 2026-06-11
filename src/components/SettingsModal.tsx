import React, { useState, useEffect } from 'react';
import { Settings, X, Key, Cpu, Cloud, FileText, Sparkles } from 'lucide-react';
import { storageService } from '../services/storageService';
import type { AppSettings } from '../services/storageService';
import { qwenAIService } from '../services/qwenAIService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange?: (settings: AppSettings) => void;
  browserInfo: {
    isChrome: boolean;
    chromeAIAvailable: boolean;
    reason?: 'no' | 'after-download' | 'not-chrome';
  };
  onTriggerQwenDownload: () => void;
  onTriggerChromeGuide: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  onSettingsChange,
  browserInfo,
  onTriggerQwenDownload,
  onTriggerChromeGuide
}) => {
  const [settings, setSettings] = useState<AppSettings>({
    preferredEngine: 'chrome-nano',
    geminiApiKey: '',
    theme: 'mystic',
  });
  const [isCached, setIsCached] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(storageService.getSettings());
      qwenAIService.checkModelCached().then(cached => {
        setIsCached(cached);
      });
    }
  }, [isOpen]);

  const handleSave = () => {
    storageService.saveSettings(settings);
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} className="fade-in">
      <div style={styles.modal} className="glass-panel">
        <div style={styles.header}>
          <h2 style={styles.title} className="font-display text-gradient-cyan">
            <Settings size={22} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Aether Gate - AI 관리자
          </h2>
          <button onClick={onClose} style={styles.closeBtn} title="닫기">
            <X size={20} />
          </button>
        </div>

        <div style={styles.body}>
          {/* AI Engine Selection */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>꿈 해석 AI 모델 설정</h3>
            <p style={styles.description}>
              의식을 해독할 두뇌 모델을 선택하세요. 온디바이스 모델은 브라우저 내부에서 데이터 유출 없이 직접 해몽합니다.
            </p>

            <div style={styles.engineGrid}>
              
              {/* Chrome Nano */}
              <div 
                onClick={() => setSettings(prev => ({ ...prev, preferredEngine: 'chrome-nano' }))}
                className={`settings-card ${settings.preferredEngine === 'chrome-nano' ? 'settings-card-active' : ''}`}
                style={{
                  ...styles.engineCard,
                  ...(settings.preferredEngine === 'chrome-nano' ? styles.engineCardActive : {})
                }}
              >
                <div style={styles.cardMainContent}>
                  <div style={styles.cardHeader}>
                    <Sparkles size={18} color="var(--color-secondary)" />
                    <span style={styles.cardTitle}>Chrome Gemini Nano</span>
                    {browserInfo.chromeAIAvailable ? (
                      <span style={styles.badgeSuccess}>✓ 활성화됨 (사용 가능)</span>
                    ) : (
                      <span style={styles.badgeWarning}>✗ 설정 필요</span>
                    )}
                  </div>
                  <p style={styles.cardDesc}>크롬 브라우저 내장 온디바이스 AI. (가장 빠름, 무료)</p>
                </div>
                {!browserInfo.chromeAIAvailable && (
                  <div style={styles.cardActionContainer}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onTriggerChromeGuide(); }} 
                      className="settings-action-btn"
                      style={styles.cardActionBtn}
                      title="크롬 내장 AI 설정 가이드 보기"
                    >
                      ⚙️ 설정하기
                    </button>
                  </div>
                )}
              </div>

              {/* Qwen Local */}
              <div 
                onClick={() => setSettings(prev => ({ ...prev, preferredEngine: 'qwen-local' }))}
                className={`settings-card ${settings.preferredEngine === 'qwen-local' ? 'settings-card-active' : ''}`}
                style={{
                  ...styles.engineCard,
                  ...(settings.preferredEngine === 'qwen-local' ? styles.engineCardActive : {})
                }}
              >
                <div style={styles.cardMainContent}>
                  <div style={styles.cardHeader}>
                    <Cpu size={18} color="var(--color-primary)" />
                    <span style={styles.cardTitle}>로컬 AI (Qwen2.5)</span>
                    {qwenAIService.isLoaded() || isCached ? (
                      <span style={styles.badgeSuccess}>✓ 준비 완료 (사용 가능)</span>
                    ) : (
                      <span style={styles.badgeWarning}>📥 다운로드 필요</span>
                    )}
                  </div>
                  <p style={styles.cardDesc}>브라우저 내부 구동 AI 모델. (최초 1회 약 300MB 다운로드 필요)</p>
                </div>
                {!(qwenAIService.isLoaded() || isCached) && (
                  <div style={styles.cardActionContainer}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onTriggerQwenDownload(); }} 
                      className="settings-action-btn"
                      style={styles.cardActionBtn}
                      title="Qwen AI 로컬 다운로드 시작"
                    >
                      📦 다운받기
                    </button>
                  </div>
                )}
              </div>

              {/* Gemini Cloud API */}
              <div 
                onClick={() => setSettings(prev => ({ ...prev, preferredEngine: 'gemini-api' }))}
                className={`settings-card ${settings.preferredEngine === 'gemini-api' ? 'settings-card-active' : ''}`}
                style={{
                  ...styles.engineCard,
                  ...(settings.preferredEngine === 'gemini-api' ? styles.engineCardActive : {})
                }}
              >
                <div style={styles.cardMainContent}>
                  <div style={styles.cardHeader}>
                    <Cloud size={18} color="#4dabf7" />
                    <span style={styles.cardTitle}>Gemini Cloud API</span>
                    {settings.geminiApiKey.trim().length > 5 ? (
                      <span style={styles.badgeSuccess}>✓ 키 설정됨 (사용 가능)</span>
                    ) : (
                      <span style={styles.badgeWarning}>🔑 키 필요</span>
                    )}
                  </div>
                  <p style={styles.cardDesc}>구글 클라우드 기반 해석. (가장 고품질 해석, API 키 입력 필요)</p>
                </div>
                {!settings.geminiApiKey.trim() && (
                  <div style={styles.cardActionContainer}>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setSettings(prev => ({ ...prev, preferredEngine: 'gemini-api' })); 
                      }} 
                      className="settings-action-btn"
                      style={styles.cardActionBtn}
                      title="Gemini API 키 입력 필드 활성화"
                    >
                      🔑 설정하기
                    </button>
                  </div>
                )}
              </div>

              {/* Mock Dictionary Demo */}
              <div 
                onClick={() => setSettings(prev => ({ ...prev, preferredEngine: 'mock-demo' }))}
                className={`settings-card ${settings.preferredEngine === 'mock-demo' ? 'settings-card-active' : ''}`}
                style={{
                  ...styles.engineCard,
                  ...(settings.preferredEngine === 'mock-demo' ? styles.engineCardActive : {})
                }}
              >
                <div style={styles.cardMainContent}>
                  <div style={styles.cardHeader}>
                    <FileText size={18} color="#a5d8ff" />
                    <span style={styles.cardTitle}>성좌의 지혜 (사전 해몽)</span>
                    <span style={styles.badgeSuccess}>✓ 즉시 사용 가능</span>
                  </div>
                  <p style={styles.cardDesc}>네트워크와 기기 사양 제한이 없는 순수 로컬 상징 사전 기반 분석.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Conditional Gemini API Key Input */}
          {settings.preferredEngine === 'gemini-api' && (
            <div style={styles.apiKeySection} className="fade-in">
              <div style={styles.apiKeyLabelGroup}>
                <Key size={16} color="var(--color-secondary)" style={{ marginRight: '6px' }} />
                <span style={styles.sectionSubTitle}>Gemini API Key</span>
              </div>
              <input
                type="password"
                placeholder="AI-xxxx..."
                value={settings.geminiApiKey}
                onChange={(e) => setSettings(prev => ({ ...prev, geminiApiKey: e.target.value }))}
                style={styles.input}
              />
              <p style={styles.apiKeyTip}>
                * API 키는 브라우저 내부 LocalStorage에만 안전하게 보관됩니다.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div style={styles.actions}>
            <button onClick={onClose} style={styles.cancelBtn}>
              취소
            </button>
            <button onClick={handleSave} className="glow-btn" style={styles.saveBtn}>
              설정 저장
            </button>
          </div>
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
    maxWidth: '560px',
    borderRadius: '20px',
    padding: '28px',
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
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '14px',
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
    color: '#aaa',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color var(--transition-fast)',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
  },
  sectionSubTitle: {
    fontSize: '0.88rem',
    fontWeight: '600',
    color: '#fff',
  },
  description: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
    margin: '0 0 12px 0',
  },
  engineGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  engineCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '16px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  engineCardActive: {
    backgroundColor: 'hsla(180, 80%, 65%, 0.08)',
    borderColor: 'var(--color-secondary)',
    boxShadow: '0 0 14px hsla(180, 80%, 65%, 0.15)',
  },
  cardMainContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: '1 1 280px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  cardTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#fff',
  },
  cardDesc: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
    margin: 0,
  },
  badgeSuccess: {
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
    border: '1px solid rgba(46, 204, 113, 0.3)',
    color: '#2ecc71',
    fontSize: '0.72rem',
    fontWeight: '600',
    padding: '3px 8px',
    borderRadius: '10px',
  },
  badgeWarning: {
    backgroundColor: 'rgba(241, 196, 15, 0.15)',
    border: '1px solid rgba(241, 196, 15, 0.3)',
    color: '#f1c40f',
    fontSize: '0.72rem',
    fontWeight: '600',
    padding: '3px 8px',
    borderRadius: '10px',
  },
  cardActionContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    flexShrink: 0,
  },
  cardActionBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-color)',
    borderRadius: '20px',
    padding: '6px 14px',
    color: '#fff',
    fontSize: '0.78rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    outline: 'none',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
  },
  apiKeySection: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  apiKeyLabelGroup: {
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color var(--transition-fast)',
  },
  apiKeyTip: {
    fontSize: '0.75rem',
    color: '#666',
    margin: 0,
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '10px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    paddingTop: '18px',
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    padding: '10px 20px',
    borderRadius: '30px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'color var(--transition-fast)',
  },
  saveBtn: {
    padding: '10px 24px',
    fontSize: '0.9rem',
    fontWeight: '600',
  }
};