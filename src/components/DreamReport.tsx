import React, { useState } from 'react';
import { Sparkles, Moon, Sun, Star, Compass, Heart, AlertOctagon, RotateCcw } from 'lucide-react';
import type { InterpretationResult } from '../services/aiService';
import { useTranslation } from 'react-i18next';

interface DreamReportProps {
  dreamText: string;
  result: InterpretationResult;
  selectedMode: 'traditional' | 'psychological' | 'hybrid';
  onReset: () => void;
  inlineMode?: boolean;
  language: 'ko' | 'en';
}

export const DreamReport: React.FC<DreamReportProps> = ({
  dreamText,
  result,
  selectedMode,
  onReset,
  inlineMode = false,
  language
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'symbols'>('analysis');

  const { symbols, deepAnalysis, advice, emotionScores, tarotCard } = result;

  const { t } = useTranslation();

  // 타로 카드 컨셉에 따른 아이콘 및 카드 색상 테마 분기
  const getCardTheme = (type: string) => {
    switch (type) {
      case 'sun':
        return {
          icon: <Sun size={36} color="var(--color-accent)" />,
          bg: 'linear-gradient(135deg, #2b1f0d 0%, #1f1205 100%)',
          border: '1px solid var(--color-accent)',
          glow: 'rgba(218, 165, 32, 0.25)'
        };
      case 'moon':
        return {
          icon: <Moon size={36} color="var(--color-primary)" />,
          bg: 'linear-gradient(135deg, #181125 0%, #0d0615 100%)',
          border: '1px solid var(--color-primary)',
          glow: 'rgba(170, 59, 255, 0.25)'
        };
      case 'tower':
        return {
          icon: <AlertOctagon size={36} color="#ff6b6b" />,
          bg: 'linear-gradient(135deg, #2c0f13 0%, #170508 100%)',
          border: '1px solid #ff6b6b',
          glow: 'rgba(255, 107, 107, 0.25)'
        };
      case 'lovers':
        return {
          icon: <Heart size={36} color="#ff8da1" />,
          bg: 'linear-gradient(135deg, #251221 0%, #140511 100%)',
          border: '1px solid #ff8da1',
          glow: 'rgba(255, 141, 161, 0.25)'
        };
      case 'fool':
        return {
          icon: <Compass size={36} color="var(--color-secondary)" />,
          bg: 'linear-gradient(135deg, #0e242a 0%, #041317 100%)',
          border: '1px solid var(--color-secondary)',
          glow: 'rgba(180, 80%, 65%, 0.25)'
        };
      case 'star':
      default:
        return {
          icon: <Star size={36} color="var(--color-secondary)" />,
          bg: 'linear-gradient(135deg, #102127 0%, #051014 100%)',
          border: '1px solid var(--color-secondary)',
          glow: 'rgba(180, 80%, 65%, 0.25)'
        };
    }
  };

  const cardTheme = getCardTheme(tarotCard.cardType);

  const getModeLabel = (mode: string) => {
    if (mode === 'traditional') return language === 'en' ? 'Eastern Traditional' : '동양 전통 해몽';
    if (mode === 'psychological') return language === 'en' ? 'Western Psychological' : '서양 심리학 해석';
    return language === 'en' ? 'Comprehensive Hybrid' : '종합 융합 분석';
  };

  const containerStyle = {
    ...styles.container,
    ...(inlineMode ? {
      width: '100%',
      maxWidth: '100%',
      margin: '0',
      padding: '0'
    } : {})
  };

  return (
    <div style={containerStyle} className="fade-in">
      
      {/* 1. 입력했던 꿈 요약 */}
      <div style={styles.dreamQuoteBox} className="glass-panel">
        <span style={styles.quoteMark}>{t('quoteStart')}</span>
        <p style={styles.dreamText}>{dreamText}</p>
        <span style={{ ...styles.quoteMark, ...styles.quoteMarkEnd }}>{t('quoteEnd')}</span>
        <div style={styles.badgeLine}>
          <span style={styles.modeBadge}>{getModeLabel(selectedMode)}</span>
        </div>
      </div>

      {/* 2. 메인 리포트 구역: 타로 카드 & 해석 대시보드 */}
      <div style={styles.reportGrid}>
        
        {/* 타로 카드 구역 */}
        <div style={styles.cardSection}>
          <span style={styles.cardHelp}>{t('tarotHelp')}</span>
          
          <div 
            style={{
              ...styles.tarotContainer,
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* CARD BACK (뒷면) */}
            <div style={styles.cardBack} className="glass-panel">
              <div style={styles.cardBackInner}>
                <div style={styles.cardBackOrb} className="float" />
                <div style={styles.cardBackLines} />
                <span style={styles.cardBackText} className="font-display">{t('cardBackText')}</span>
              </div>
            </div>

            {/* CARD FRONT (앞면) */}
            <div 
              style={{
                ...styles.cardFront,
                background: cardTheme.bg,
                border: cardTheme.border,
                boxShadow: `0 0 20px ${cardTheme.glow}`
              }}
            >
              <div style={styles.cardDecorationFrame}>
                <div style={styles.cardIconBox}>{cardTheme.icon}</div>
                <h3 style={styles.cardTitle} className="font-display">{tarotCard.title}</h3>
                <div style={styles.dividerLine} />
                <p style={styles.cardDesc}>{tarotCard.description}</p>
                <div style={styles.cardFooterSymbol}>
                  <Sparkles size={16} color="var(--color-accent)" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 해석 및 감정 지표 구역 */}
        <div style={styles.detailsSection} className="glass-panel">
          <div style={styles.tabHeader}>
            <button 
              onClick={() => setActiveTab('analysis')}
              style={{ ...styles.tabBtn, ...(activeTab === 'analysis' ? styles.tabBtnActive : {}) }}
            >
              {t('tabAnalysis')}
            </button>
            <button 
              onClick={() => setActiveTab('symbols')}
              style={{ ...styles.tabBtn, ...(activeTab === 'symbols' ? styles.tabBtnActive : {}) }}
            >
              {t('tabSymbols')} ({symbols.length})
            </button>
          </div>

          <div style={styles.tabContent}>
            {activeTab === 'analysis' ? (
              /* TAB A: Deep Analysis & Advice */
              <div className="fade-in" style={styles.textColumn}>
                <div style={styles.textBlock}>
                  <h4 style={styles.blockTitle} className="font-display text-gradient-purple">{t('sectionAnalysis')}</h4>
                  <p style={styles.blockText}>{deepAnalysis}</p>
                </div>

                <div style={styles.textBlock}>
                  <h4 style={styles.blockTitle} className="font-display text-gradient-gold">{t('sectionAdvice')}</h4>
                  <p style={styles.blockText}>{advice}</p>
                </div>
              </div>
            ) : (
              /* TAB B: Extracted Symbols */
              <div className="fade-in" style={styles.symbolsList}>
                {symbols.length === 0 ? (
                  <p style={styles.emptyText}>{t('emptySymbols')}</p>
                ) : (
                  symbols.map((s, idx) => (
                    <div key={idx} style={styles.symbolCard}>
                      <span style={styles.symbolName}>{s.name}</span>
                      <p style={styles.symbolMeaning}>{s.meaning}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Emotion Scores (감정 지표) */}
            <div style={styles.emotionsContainer}>
              <h4 style={styles.emotionsTitle} className="font-display text-gradient-cyan">{t('sectionEmotions')}</h4>
              
              <div style={styles.emotionsGrid}>
                {/* Fear */}
                <div style={styles.emotionItem}>
                  <div style={styles.emotionMeta}>
                    <span>{t('emotionFear')}</span>
                    <span style={{ color: '#ff6b6b' }}>{emotionScores.fear}%</span>
                  </div>
                  <div style={styles.meterBg}>
                    <div style={{ ...styles.meterFill, width: `${emotionScores.fear}%`, background: 'linear-gradient(90deg, #5c181c 0%, #ff6b6b 100%)' }} />
                  </div>
                </div>

                {/* Joy */}
                <div style={styles.emotionItem}>
                  <div style={styles.emotionMeta}>
                    <span>{t('emotionJoy')}</span>
                    <span style={{ color: 'var(--color-accent)' }}>{emotionScores.joy}%</span>
                  </div>
                  <div style={styles.meterBg}>
                    <div style={{ ...styles.meterFill, width: `${emotionScores.joy}%`, background: 'linear-gradient(90deg, #a05a0c 0%, var(--color-accent) 100%)' }} />
                  </div>
                </div>

                {/* Anxiety */}
                <div style={styles.emotionItem}>
                  <div style={styles.emotionMeta}>
                    <span>{t('emotionAnxiety')}</span>
                    <span style={{ color: '#d681ff' }}>{emotionScores.anxiety}%</span>
                  </div>
                  <div style={styles.meterBg}>
                    <div style={{ ...styles.meterFill, width: `${emotionScores.anxiety}%`, background: 'linear-gradient(90deg, #5d0f8c 0%, #d681ff 100%)' }} />
                  </div>
                </div>

                {/* Peace */}
                <div style={styles.emotionItem}>
                  <div style={styles.emotionMeta}>
                    <span>{t('emotionPeace')}</span>
                    <span style={{ color: 'var(--color-secondary)' }}>{emotionScores.peace}%</span>
                  </div>
                  <div style={styles.meterBg}>
                    <div style={{ ...styles.meterFill, width: `${emotionScores.peace}%`, background: 'linear-gradient(90deg, #104e57 0%, var(--color-secondary) 100%)' }} />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 3. 액션 버튼 그룹 */}
      {!inlineMode && (
        <div style={styles.actionRow}>
          <button onClick={onReset} className="glow-btn" style={styles.resetBtn}>
            <RotateCcw size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            {t('otherDreamBtn')}
          </button>
        </div>
      )}

    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '90%',
    maxWidth: '960px',
    margin: '30px auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  dreamQuoteBox: {
    padding: '24px 30px',
    borderRadius: '16px',
    textAlign: 'center',
    position: 'relative',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  quoteMark: {
    fontSize: '2.5rem',
    fontFamily: 'serif',
    color: 'var(--color-primary)',
    position: 'absolute',
    top: '10px',
    left: '18px',
    opacity: 0.3,
  },
  quoteMarkEnd: {
    left: 'auto',
    right: '18px',
    top: 'auto',
    bottom: '-15px',
  },
  dreamText: {
    fontSize: '1rem',
    color: '#fff',
    lineHeight: '1.6',
    fontStyle: 'italic',
    padding: '0 20px',
  },
  badgeLine: {
    marginTop: '12px',
    display: 'flex',
    justifyContent: 'center',
  },
  modeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'var(--color-secondary)',
    fontSize: '0.75rem',
    padding: '3px 10px',
    borderRadius: '12px',
    fontWeight: '500',
  },
  reportGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '28px',
    alignItems: 'start',
  },
  cardSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  cardHelp: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    animation: 'twinklingStars 1.5s infinite',
  },
  tarotContainer: {
    width: '240px',
    height: '380px',
    position: 'relative',
    perspective: '1000px',
    transformStyle: 'preserve-3d',
    transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
  },
  cardBack: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    borderRadius: '16px',
    padding: '16px',
    backgroundColor: 'rgba(20, 15, 30, 0.85)',
    border: '1.5px solid var(--color-primary)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  cardBackInner: {
    width: '100%',
    height: '100%',
    border: '1px solid rgba(180, 80%, 65%, 0.15)',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cardBackOrb: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #fff 0%, var(--color-primary) 70%)',
    boxShadow: '0 0 20px var(--color-primary)',
  },
  cardBackLines: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    border: '1px dashed rgba(180, 80%, 65%, 0.05)',
    borderRadius: '50%',
    animation: 'spinClockwise 30s infinite linear',
  },
  cardBackText: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginTop: '24px',
    letterSpacing: '0.3em',
  },
  cardFront: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    transform: 'rotateY(180deg)',
    borderRadius: '16px',
    padding: '16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardDecorationFrame: {
    width: '100%',
    height: '100%',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    textAlign: 'center',
  },
  cardIconBox: {
    marginTop: '12px',
    animation: 'float 4s ease-in-out infinite',
  },
  cardTitle: {
    fontSize: '1.25rem',
    margin: '16px 0 6px 0',
    color: '#fff',
    letterSpacing: '0.1em',
  },
  dividerLine: {
    width: '40px',
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    margin: '8px auto',
  },
  cardDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 8px',
  },
  cardFooterSymbol: {
    marginBottom: '8px',
  },
  detailsSection: {
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  tabHeader: {
    display: 'flex',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  tabBtn: {
    flex: 1,
    padding: '16px',
    background: 'transparent',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    textAlign: 'center',
    outline: 'none',
  },
  tabBtnActive: {
    color: 'var(--color-secondary)',
    borderBottom: '2px solid var(--color-secondary)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  tabContent: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  textColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  textBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  blockTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
  },
  blockText: {
    fontSize: '0.9rem',
    color: '#e2e2e2',
    lineHeight: '1.6',
  },
  symbolsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  emptyText: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    textAlign: 'center',
    padding: '20px',
  },
  symbolCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
    padding: '12px 16px',
  },
  symbolName: {
    fontWeight: '600',
    color: 'var(--color-secondary)',
    fontSize: '0.9rem',
    display: 'block',
    marginBottom: '4px',
  },
  symbolMeaning: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
  },
  emotionsContainer: {
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '20px',
    marginTop: '8px',
  },
  emotionsTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    marginBottom: '14px',
  },
  emotionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '14px',
  },
  emotionItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  emotionMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
  },
  meterBg: {
    width: '100%',
    height: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: '3px',
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    marginTop: '12px',
  },
  resetBtn: {
    background: 'none',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    padding: '12px 28px',
    borderRadius: '30px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    transition: 'all var(--transition-fast)',
  },
  saveBtn: {
    padding: '12px 32px',
    fontSize: '0.95rem',
  },
  saveBtnCompleted: {
    background: 'rgba(45, 90%, 60%, 0.1)',
    borderColor: 'rgba(45, 90%, 60%, 0.3)',
    color: 'var(--color-accent)',
    boxShadow: 'none',
    cursor: 'default',
  }
};
