import React from 'react';
import { X, Shield, Mail, Sparkles } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'about-contact';
  language: 'ko' | 'en' | 'ja' | 'zh-TW';
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, type, language }) => {
  if (!isOpen) return null;

  const isEn = language === 'en';

  return (
    <div style={styles.overlay} className="fade-in">
      <div style={styles.modal} className="glass-panel">
        <div style={styles.header}>
          <h2 style={styles.title} className="font-display text-gradient-cyan">
            {type === 'privacy' ? (
              <>
                <Shield size={22} style={{ marginRight: '8px', verticalAlign: 'middle' }} color="var(--color-secondary)" />
                {isEn ? 'Privacy Policy' : '개인정보처리방침'}
              </>
            ) : (
              <>
                <Mail size={22} style={{ marginRight: '8px', verticalAlign: 'middle' }} color="var(--color-accent)" />
                {isEn ? 'About & Contact' : '소개 및 문의'}
              </>
            )}
          </h2>
          <button onClick={onClose} style={styles.closeBtn} title={isEn ? 'Close' : '닫기'}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.body}>
          {type === 'privacy' ? (
            <div style={styles.content}>
              {isEn ? (
                <>
                  <p style={styles.paragraph}>
                    DreamTeller values your privacy. We are committed to maintaining a completely safe and private space for you to explore your subconscious.
                  </p>
                  
                  <h4 style={styles.subTitle}>1. Zero-Server Data Policy (On-Device AI)</h4>
                  <p style={styles.paragraph}>
                    Your dreams are highly personal. Therefore, DreamTeller <strong>does not send or store your dream content on any external servers</strong>. All AI text analysis is processed locally inside your web browser using WebLLM/Chrome built-in AI technology.
                  </p>

                  <h4 style={styles.subTitle}>2. Local Storage Usage</h4>
                  <p style={styles.paragraph}>
                    Your dream records and AI conversation history are saved purely in your browser's local storage (<code>localStorage</code>). This data is completely controlled by you and can be permanently deleted by clearing your browser cache or clicking "Clear History" inside the dashboard.
                  </p>

                  <h4 style={styles.subTitle}>3. Third-Party Services & Cookies</h4>
                  <p style={styles.paragraph}>
                    We may use analytics tools or display advertisements (such as Google AdSense) to keep this service running. These platforms may collect non-personal device information and use cookies according to Google's privacy policies to show personalized ads.
                  </p>

                  <h4 style={styles.subTitle}>4. Policy Updates</h4>
                  <p style={styles.paragraph}>
                    This privacy policy is effective as of June 2026. Any future changes will be posted directly on this portal.
                  </p>
                </>
              ) : (
                <>
                  <p style={styles.paragraph}>
                    DreamTeller는 사용자의 개인정보와 무의식의 조각들을 소중히 다루며, 안전한 오프라인 분석 환경을 제공하기 위해 최선을 다하고 있습니다.
                  </p>
                  
                  <h4 style={styles.subTitle}>1. 개인정보 비전송 원칙 (온디바이스 AI)</h4>
                  <p style={styles.paragraph}>
                    사용자가 입력하시는 꿈의 구체적인 텍스트나 사적인 고민은 <strong>외부 서버로 일절 전송되지 않습니다.</strong> 모든 AI 해몽 분석은 WebGPU와 크롬 브라우저 내장 AI 엔진 기술을 통해 사용자 기기 로컬 내에서 독립적으로 처리됩니다.
                  </p>

                  <h4 style={styles.subTitle}>2. 로컬 브라우저 저장소 활용</h4>
                  <p style={styles.paragraph}>
                    사용자의 꿈 기록 및 AI 대화 내역은 전적으로 웹 브라우저의 내부 저장공간(<code>localStorage</code>)에만 암호 상태로 격리 저장됩니다. 사용자가 인터넷 브라우저 캐시를 청소하거나 관리자 메뉴의 기록 삭제 버튼을 누르면 모든 데이터는 영구히 삭제됩니다.
                  </p>

                  <h4 style={styles.subTitle}>3. 쿠키 및 서드파티 제휴</h4>
                  <p style={styles.paragraph}>
                    본 사이트는 안정적인 서비스 개발 및 광고 노출(구글 애드센스 등)을 위해 쿠키를 활용할 수 있습니다. 이 과정에서 구글의 개인정보보호정책에 따라 기기 식별값 및 방문 로그 등이 수집될 수 있습니다.
                  </p>

                  <h4 style={styles.subTitle}>4. 개정 및 관리</h4>
                  <p style={styles.paragraph}>
                    본 개인정보처리방침은 2026년 6월부터 효력이 발생하며, 변동 사항은 본 포털을 통해 상시 업데이트됩니다.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div style={styles.content}>
              {isEn ? (
                <>
                  <div style={styles.aboutCard} className="glass-panel">
                    <Sparkles size={24} color="var(--color-secondary)" style={{ marginBottom: '10px' }} />
                    <p style={{ ...styles.paragraph, fontStyle: 'italic', color: '#fff' }}>
                      "Dreams are the letters that the subconscious writes to the conscious."
                    </p>
                  </div>

                  <h4 style={styles.subTitle}>What is DreamTeller?</h4>
                  <p style={styles.paragraph}>
                    DreamTeller is a next-generation dream analysis portal. We merge ancient mythology, eastern dream traditions, and modern Carl Jung/Sigmund Freud psychology using client-side RAG technology and local LLMs.
                  </p>

                  <h4 style={styles.subTitle}>Contact Information</h4>
                  <p style={styles.paragraph}>
                    For feedback, feature requests, partnership inquiries, or bugs, feel free to email the developer team.
                  </p>
                  
                  <div style={styles.emailContainer}>
                    <Mail size={16} color="var(--color-secondary)" style={{ marginRight: '6px' }} />
                    <a href="mailto:dreamteller.contact@gmail.com" style={styles.emailLink}>
                      dreamteller.contact@gmail.com
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <div style={styles.aboutCard} className="glass-panel">
                    <Sparkles size={24} color="var(--color-secondary)" style={{ marginBottom: '10px' }} />
                    <p style={{ ...styles.paragraph, fontStyle: 'italic', color: '#fff' }}>
                      "꿈은 무의식이 의식에게 보내는 가장 신비로운 편지입니다."
                    </p>
                  </div>

                  <h4 style={styles.subTitle}>DreamTeller 소개</h4>
                  <p style={styles.paragraph}>
                    DreamTeller는 고대 신화와 동양 전통 해몽, 그리고 현대 정신분석학(융, 프로이트) 이론을 결합하여 무의식의 비전을 읽어내는 해몽 전문 융합 플랫폼입니다. 웹 브라우저 내에서 직접 도는 로컬 RAG 검색 엔진 및 초경량 LLM을 기반으로 제작되었습니다.
                  </p>

                  <h4 style={styles.subTitle}>개발팀 문의하기</h4>
                  <p style={styles.paragraph}>
                    기능 제안, 번역 오류 제보, 사이트 피드백 또는 비즈니스 제휴 등에 대해 문의 사항이 있으시다면 아래 이메일로 연락주시기 바랍니다.
                  </p>
                  
                  <div style={styles.emailContainer}>
                    <Mail size={16} color="var(--color-secondary)" style={{ marginRight: '6px' }} />
                    <a href="mailto:dreamteller.contact@gmail.com" style={styles.emailLink}>
                      dreamteller.contact@gmail.com
                    </a>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} className="glow-btn" style={styles.okBtn}>
            {isEn ? 'OK' : '확인'}
          </button>
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
    zIndex: 2000,
  },
  modal: {
    width: '90%',
    maxWidth: '560px',
    borderRadius: '20px',
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '85vh',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '12px',
    flexShrink: 0,
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
    overflowY: 'auto',
    paddingRight: '6px',
    flexGrow: 1,
    marginBottom: '20px',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  paragraph: {
    fontSize: '0.88rem',
    color: 'var(--text-muted)',
    lineHeight: '1.6',
    margin: 0,
  },
  subTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#fff',
    margin: '12px 0 2px 0',
  },
  aboutCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    margin: '4px 0',
  },
  emailContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '10px 14px',
    marginTop: '6px',
    width: 'fit-content',
  },
  emailLink: {
    fontSize: '0.88rem',
    color: 'var(--color-secondary)',
    textDecoration: 'none',
    fontWeight: '600',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    paddingTop: '16px',
    flexShrink: 0,
  },
  okBtn: {
    padding: '8px 24px',
    fontSize: '0.9rem',
    fontWeight: '600',
  }
};
