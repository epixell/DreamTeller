import React from 'react';
import { Plus, MessageSquare, Trash2, Settings, Key, Sparkles, X } from 'lucide-react';
import type { ChatSession } from '../services/storageService';
import { i18n } from '../services/i18nService';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string | null) => void;
  onDeleteSession: (id: string) => void;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
  onClearAll: () => void;
  language: 'ko' | 'en';
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onOpenSettings,
  onOpenAdmin,
  onClearAll,
  language
}) => {
  const handleNewChat = () => {
    onSelectSession(null);
    onClose();
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'traditional': return language === 'en' ? 'East' : '동양';
      case 'psychological': return language === 'en' ? 'Psych' : '심리';
      case 'hybrid': return language === 'en' ? 'Hyb' : '융합';
      default: return '';
    }
  };

  const t = i18n[language];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          style={styles.mobileOverlay} 
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        style={{
          ...styles.sidebar,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
        className="glass-panel sidebar-container"
      >
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoGroup} onClick={handleNewChat}>
            <div style={styles.logoIconContainer} className="star-spin">
              <Sparkles size={16} color="var(--color-accent)" />
            </div>
            <span style={styles.logoText} className="font-display text-gradient-cyan">DreamTeller</span>
          </div>
          
          {/* Close button for mobile */}
          <button onClick={onClose} style={styles.closeBtn} className="mobile-only">
            <X size={18} color="var(--text-muted)" />
          </button>
        </div>

        {/* New Chat Button */}
        <button 
          onClick={handleNewChat} 
          style={styles.newChatBtn}
          className="glow-btn"
        >
          <Plus size={16} style={{ marginRight: '8px' }} />
          {t.newChat}
        </button>

        {/* Chat List */}
        <div style={styles.listContainer}>
          <div style={styles.sectionHeader}>{t.historyTitle} ({sessions.length})</div>
          
          <div style={styles.scrollArea}>
            {sessions.length === 0 ? (
              <div style={styles.emptyText}>
                <MessageSquare size={20} style={{ opacity: 0.3, marginBottom: '8px' }} />
                <span>{t.noHistory}</span>
              </div>
            ) : (
              sessions.map((session) => {
                const isActive = session.id === activeSessionId;
                return (
                  <div 
                    key={session.id}
                    style={{
                      ...styles.sessionItem,
                      ...(isActive ? styles.sessionItemActive : {})
                    }}
                    className="session-item-hover"
                  >
                    {/* Chat Item Clickable Area */}
                    <div 
                       onClick={() => {
                        onSelectSession(session.id);
                        onClose();
                      }}
                      style={styles.sessionItemClick}
                    >
                      <MessageSquare 
                        size={14} 
                        color={isActive ? "var(--color-secondary)" : "var(--text-muted)"} 
                        style={{ flexShrink: 0 }}
                      />
                      <div style={styles.sessionMeta}>
                        <span style={{
                          ...styles.sessionTitle,
                          color: isActive ? '#fff' : 'var(--text-main)'
                        }}>
                          {session.title || (language === 'en' ? 'New Dream Interpretation' : '새 꿈 해석')}
                        </span>
                        <span style={styles.sessionDate}>
                          {session.date} • {getModeLabel(session.mode)}
                        </span>
                      </div>
                    </div>

                    {/* Delete Session Button */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      style={styles.deleteBtn}
                      title={language === 'en' ? "Delete conversation" : "해당 대화 삭제"}
                      className="session-delete-btn"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div style={styles.footer}>
          {sessions.length > 0 && (
            <button onClick={onClearAll} style={styles.clearAllBtn}>
              {t.clearAll}
            </button>
          )}

          <div style={styles.footerRow}>
            <button onClick={onOpenSettings} style={styles.footerBtn}>
              <Settings size={14} style={{ marginRight: '6px' }} />
              {t.settings}
            </button>

            <button onClick={onOpenAdmin} style={styles.footerBtn}>
              <Key size={14} style={{ marginRight: '6px' }} />
              {t.aetherGate}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  mobileOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    zIndex: 998,
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: '280px',
    backgroundColor: 'rgba(10, 6, 20, 0.92)',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    zIndex: 999,
    borderRadius: '0 20px 20px 0',
    transition: 'transform var(--transition-normal)',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  logoIconContainer: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    letterSpacing: '0.05em',
  },
  closeBtn: {
    padding: '6px',
    cursor: 'pointer',
  },
  newChatBtn: {
    width: '100%',
    padding: '12px',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    marginBottom: '20px',
  },
  sectionHeader: {
    fontSize: '0.75rem',
    color: '#666',
    fontWeight: '600',
    letterSpacing: '0.1em',
    marginBottom: '10px',
    textTransform: 'uppercase',
    paddingLeft: '4px',
  },
  scrollArea: {
    flexGrow: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    paddingRight: '4px',
  },
  emptyText: {
    fontSize: '0.8rem',
    color: '#444',
    textAlign: 'center',
    padding: '40px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  sessionItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    borderRadius: '10px',
    backgroundColor: 'transparent',
    border: '1px solid transparent',
    transition: 'all var(--transition-fast)',
    position: 'relative',
    cursor: 'pointer',
  },
  sessionItemActive: {
    backgroundColor: 'hsla(180, 80%, 65%, 0.06)',
    borderColor: 'rgba(180, 80%, 65%, 0.25)',
  },
  sessionItemClick: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    overflow: 'hidden',
  },
  sessionMeta: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    textAlign: 'left',
  },
  sessionTitle: {
    fontSize: '0.85rem',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sessionDate: {
    fontSize: '0.7rem',
    color: '#555',
    marginTop: '2px',
  },
  deleteBtn: {
    padding: '6px',
    background: 'none',
    border: 'none',
    color: '#444',
    cursor: 'pointer',
    opacity: 0,
    transition: 'all var(--transition-fast)',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
    paddingTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  clearAllBtn: {
    fontSize: '0.72rem',
    color: '#ff6b6b',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'center',
    alignSelf: 'center',
    textDecoration: 'underline',
    opacity: 0.6,
    transition: 'opacity 0.2s',
  },
  footerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
  },
  footerBtn: {
    flex: 1,
    padding: '8px',
    fontSize: '0.75rem',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  }
};
