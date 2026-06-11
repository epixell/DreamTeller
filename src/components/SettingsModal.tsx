import React, { useState, useEffect } from 'react';
import { Settings, X, Key, Cpu, Cloud, FileText, Sparkles } from 'lucide-react';
import { storageService } from '../services/storageService';
import type { AppSettings } from '../services/storageService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange?: (settings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSettingsChange }) => {
  const [settings, setSettings] = useState<AppSettings>({
    preferredEngine: 'chrome-nano',
    geminiApiKey: '',
    theme: 'mystic',
  });

  useEffect(() => {
    if (isOpen) {
      setSettings(storageService.getSettings());
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
                style={{
                  ...styles.engineCard,
                  ...(settings.preferredEngine === 'chrome-nano' ? styles.engineCardActive : {})
                }}
              >
                <div style={styles.cardHeader}>
                  <Sparkles size={18} color="var(--color-secondary)" />
                  <span style={styles.cardTitle}>Chrome Gemini Nano</span>
                </div>
                <p style={styles.cardDesc}>크롬 브라우저 내장 온디바이스 AI. (가장 빠름, 무료, 설정 필요)</p>
              </div>

              {/* Qwen Local */}
              <div 
                onClick={() => setSettings(prev => ({ ...prev, preferredEngine: 'qwen-local' }))}
                style={{
                  ...styles.engineCard,
                  ...(settings.preferredEngine === 'qwen-local' ? styles.engineCardActive : {})
                }}
              >
                <div style={styles.cardHeader}>
                  <Cpu size={18} color="var(--color-primary)" />
                  <span style={styles.cardTitle}>로컬 AI (Qwen2.5)</span>
                </div>
                <p style={styles.cardDesc}>브라우저 로컬 구동 대규모 모델. (약 300MB 다운로드 필요, WebGPU 권장)</p>
              </div>

              {/* Gemini Cloud API */}
              <div 
                onClick={() => setSettings(prev => ({ ...prev, preferredEngine: 'gemini-api' }))}
                style={{
                  ...styles.engineCard,
                  ...(settings.preferredEngine === 'gemini-api' ? styles.engineCardActive : {})
                }}
              >
                <div style={styles.cardHeader}>
                  <Cloud size={18} color="#4dabf7" />
                  <span style={styles.cardTitle}>Gemini Cloud API</span>
                </div>
                <p style={styles.cardDesc}>구글 클라우드 기반 초거대 AI 해석. (가장 고품질 해석, API 키 입력 필요)</p>
              </div>

              {/* Mock Dictionary Demo */}
              <div 
                onClick={() => setSettings(prev => ({ ...prev, preferredEngine: 'mock-demo' }))}
                style={{
                  ...styles.engineCard,
                  ...(settings.preferredEngine === 'mock-demo' ? styles.engineCardActive : {})
                }}
              >
                <div style={styles.cardHeader}>
                  <FileText size={18} color="#a5d8ff" />
                  <span style={styles.cardTitle}>성좌의 지혜 (사전 해몽)</span>
                </div>
                <p style={styles.cardDesc}>네트워크와 기기 사양 제한이 없는 순수 로컬 상징 사전 기반 분석.</p>
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
                * API 키는 브라우저 내부 LocalStorage에만 안전하게 암호화 보관됩니다.
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
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px',
  },
  engineCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all var(--transition-normal)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  engineCardActive: {
    backgroundColor: 'hsla(180, 80%, 65%, 0.08)',
    borderColor: 'var(--color-secondary)',
    boxShadow: '0 0 14px hsla(180, 80%, 65%, 0.15)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
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