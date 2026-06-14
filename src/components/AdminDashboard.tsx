import React, { useState, useEffect } from 'react';
import { Lock, Unlock, BookOpen, Database, Clipboard, Settings, Plus, Edit2, Trash2, RotateCcw, AlertTriangle, ArrowLeft } from 'lucide-react';
import { dictionaryService } from '../services/dictionaryService';
import type { DreamSymbol } from '../services/dictionaryService';
import { storageService } from '../services/storageService';
import type { AuditLog } from '../services/storageService';
import { useTranslation } from 'react-i18next';

interface AdminDashboardProps {
  onBackToMain: () => void;
  language: 'ko' | 'en';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToMain, language }) => {
  const { t, i18n: i18nInstance } = useTranslation();
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  
  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState<'dictionary' | 'whitepaper' | 'logs' | 'prompts'>('dictionary');
  
  // Dictionary CRUD state
  const [symbols, setSymbols] = useState<DreamSymbol[]>([]);
  const [editingSymbol, setEditingSymbol] = useState<DreamSymbol | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newSymbol, setNewSymbol] = useState<Omit<DreamSymbol, 'key'>>({
    name: '',
    traditional: '',
    psychological: ''
  });

  // Audit Logs state
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    // Check session storage to keep unlocked during the session
    const sessionAuth = sessionStorage.getItem('dreamteller_admin_auth');
    if (sessionAuth === 'true') {
      setIsUnlocked(true);
    }
  }, []);

  useEffect(() => {
    if (isUnlocked) {
      setSymbols(dictionaryService.getSymbols());
      setLogs(storageService.getAuditLogs());
    }
  }, [isUnlocked]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'enemftmxk100door!!') {
      setIsUnlocked(true);
      setPasswordError(false);
      sessionStorage.setItem('dreamteller_admin_auth', 'true');
      
      // 감사 로그 기록
      storageService.addAuditLog({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        eventType: 'prompt_update', // 관리자 진입 로그용
        engineUsed: 'system',
        details: '관리자 페이지 로그인 성공'
      });
    } else {
      setPasswordError(true);
      setPassword('');
      // 감사 로그 기록
      storageService.addAuditLog({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        eventType: 'interpretation_fail',
        engineUsed: 'system',
        details: '관리자 페이지 로그인 실패 (잘못된 비밀번호)'
      });
    }
  };

  const handleLogout = () => {
    setIsUnlocked(false);
    sessionStorage.removeItem('dreamteller_admin_auth');
  };

  // --- Dictionary Operations ---
  const handleAddNew = () => {
    if (!newSymbol.name || !newSymbol.traditional || !newSymbol.psychological) {
      alert(language === 'en' ? 'Please fill in all fields.' : '모든 필드를 채워주세요.');
      return;
    }
    const added = dictionaryService.addSymbol(newSymbol);
    setSymbols([...symbols, added]);
    setIsAddingNew(false);
    setNewSymbol({ name: '', traditional: '', psychological: '' });
    
    // 감사 로그
    storageService.addAuditLog({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: 'dictionary_edit',
      engineUsed: 'system',
      details: `사전 신규 추가: ${newSymbol.name}`
    });
  };

  const handleUpdate = () => {
    if (!editingSymbol || !editingSymbol.name || !editingSymbol.traditional || !editingSymbol.psychological) {
      alert(language === 'en' ? 'Please fill in all fields.' : '모든 필드를 채워주세요.');
      return;
    }
    dictionaryService.updateSymbol(editingSymbol);
    setSymbols(symbols.map(s => s.key === editingSymbol.key ? editingSymbol : s));
    
    // 감사 로그
    storageService.addAuditLog({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: 'dictionary_edit',
      engineUsed: 'system',
      details: `사전 수정: ${editingSymbol.name}`
    });

    setEditingSymbol(null);
  };

  const handleDelete = (key: string, name: string) => {
    if (confirm(language === 'en' ? `Are you sure you want to delete the symbol '${name}'?` : `'${name}' 상징을 삭제하시겠습니까?`)) {
      dictionaryService.deleteSymbol(key);
      setSymbols(symbols.filter(s => s.key !== key));
      
      // 감사 로그
      storageService.addAuditLog({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        eventType: 'dictionary_edit',
        engineUsed: 'system',
        details: `사전 상징 삭제: ${name}`
      });
    }
  };

  const handleReset = () => {
    if (confirm(language === 'en' ? 'Restore all dream symbols to defaults? Any custom added symbols will be lost.' : '모든 꿈 사전을 원래 기본값으로 복원하시겠습니까? 커스텀 추가된 내용은 전부 삭제됩니다.')) {
      dictionaryService.resetToDefault();
      setSymbols(dictionaryService.getSymbols());
      
      // 감사 로그
      storageService.addAuditLog({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        eventType: 'dictionary_edit',
        engineUsed: 'system',
        details: '꿈 사전 기본 데이터 재설정'
      });
    }
  };

  // --- Log Operations ---
  const handleClearLogs = () => {
    if (confirm(t('confirmClearLogs'))) {
      storageService.clearAuditLogs();
      setLogs([]);
    }
  };

  const isEn = i18nInstance.language === 'en';

  if (!isUnlocked) {
    /* 1. 비밀번호 입력 잠금 화면 */
    return (
      <div style={styles.loginBg}>
        <div style={styles.loginCard} className="glass-panel text-center">
          <div style={styles.lockIconContainer} className="float">
            <Lock size={32} color="var(--color-accent)" />
          </div>
          <h2 style={styles.loginTitle} className="font-display text-gradient-cyan">Aether Gate</h2>
          <p style={styles.loginSubtitle}>{isEn ? 'Administrator authentication required.' : '관리자 인증이 필요합니다.'}</p>
          
          <form onSubmit={handleLogin} style={styles.form}>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password..."
              style={{
                ...styles.passwordInput,
                ...(passwordError ? styles.passwordInputError : {})
              }}
              autoFocus
            />
            {passwordError && (
              <p style={styles.errorText} className="fade-in">
                {isEn ? 'Password does not match. Please try again.' : '비밀번호가 일치하지 않습니다. 다시 입력해 주세요.'}
              </p>
            )}
            
            <div style={styles.loginBtnGroup}>
              <button type="button" onClick={onBackToMain} style={styles.loginBackBtn}>
                <ArrowLeft size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                {t('backToMain')}
              </button>
              <button type="submit" className="glow-btn" style={styles.loginSubmitBtn}>
                Gate Unlock
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  /* 2. 관리자 대시보드 화면 */
  return (
    <div style={styles.dashboardContainer} className="fade-in">
      {/* Top Header */}
      <div style={styles.topHeader} className="glass-panel">
        <div>
          <h1 style={styles.dashTitle} className="font-display text-gradient-purple">
            <Unlock size={24} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
            {t('adminTitle')}
          </h1>
          <p style={styles.dashSubtitle}>
            {isEn ? 'Dream Interpretation Manual & Symbol Dictionary Control Panel' : '꿈 분석 기준 매뉴얼 및 상징 데이터 제어판'}
          </p>
        </div>
        <div style={styles.headerBtnGroup}>
          <button onClick={onBackToMain} style={styles.headerBackBtn}>
            <ArrowLeft size={16} style={{ marginRight: '6px' }} /> {isEn ? 'Home' : '메인으로'}
          </button>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            {isEn ? 'Lock Portal' : '포털 잠그기'}
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={styles.tabBar}>
        <button 
          onClick={() => setActiveTab('dictionary')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'dictionary' ? styles.tabBtnActive : {}) }}
        >
          <Database size={16} style={{ marginRight: '6px' }} /> {isEn ? 'Manage Symbols' : '꿈 상징 사전 관리'}
        </button>
        <button 
          onClick={() => setActiveTab('whitepaper')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'whitepaper' ? styles.tabBtnActive : {}) }}
        >
          <BookOpen size={16} style={{ marginRight: '6px' }} /> {isEn ? 'Dream Whitepaper' : '꿈 해석 백서'}
        </button>
        <button 
          onClick={() => setActiveTab('prompts')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'prompts' ? styles.tabBtnActive : {}) }}
        >
          <Settings size={16} style={{ marginRight: '6px' }} /> {isEn ? 'AI System Prompt' : 'AI 시스템 지시문'}
        </button>
        <button 
          onClick={() => setActiveTab('logs')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'logs' ? styles.tabBtnActive : {}) }}
        >
          <Clipboard size={16} style={{ marginRight: '6px' }} /> {isEn ? 'Audit Logs' : '감사 로그 모니터'}
        </button>
      </div>

      {/* Main Tab Content */}
      <div style={styles.tabContent} className="glass-panel">
        
        {/* TAB 1: Dictionary Symbol Manager */}
        {activeTab === 'dictionary' && (
          <div className="fade-in">
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.contentTitle}>
                  {isEn ? 'Dream Symbol Dictionary' : '꿈 상징 사전 (Dream Dictionaries)'}
                </h2>
                <p style={styles.contentDesc}>
                  {isEn 
                    ? 'List of key symbol keywords extracted during dream interpretation. Stored values serve as the data source for dictionary-only mode and are injected into AI prompts.'
                    : '꿈 해석 시 추출할 상징 키워드 목록입니다. 여기에 등록된 값은 데모 모드 풀이의 원천이 되며, AI 가이드 프롬프트에 실시간 주입됩니다.'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleReset} style={styles.resetBtn}>
                  <RotateCcw size={14} style={{ marginRight: '6px' }} /> {isEn ? 'Reset to Default' : '기본값 초기화'}
                </button>
                <button onClick={() => { setIsAddingNew(true); setEditingSymbol(null); }} className="glow-btn" style={styles.addBtn}>
                  <Plus size={16} style={{ marginRight: '6px' }} /> {isEn ? 'Add New Symbol' : '신규 상징 추가'}
                </button>
              </div>
            </div>

            {/* Add New Form */}
            {isAddingNew && (
              <div style={styles.crudForm} className="fade-in">
                <h3 style={styles.formTitle}>{isEn ? 'Add New Dream Symbol' : '새로운 꿈 상징 추가'}</h3>
                <div style={styles.formGrid}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>{isEn ? 'Symbol Name (e.g., butterfly, departure)' : '상징 이름 (예: 나비, 이별)'}</label>
                    <input 
                      type="text" 
                      value={newSymbol.name}
                      onChange={(e) => setNewSymbol({ ...newSymbol, name: e.target.value })}
                      style={styles.inputText}
                      placeholder={isEn ? 'Enter keyword...' : '키워드를 적으세요...'}
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>{isEn ? 'Eastern Traditional Interpretation' : '동양 전통 해몽 해석'}</label>
                    <textarea 
                      value={newSymbol.traditional}
                      onChange={(e) => setNewSymbol({ ...newSymbol, traditional: e.target.value })}
                      style={styles.textarea}
                      placeholder={isEn ? 'Eastern philosophy / fortune interpretation...' : '동양 철학/길흉화복적 풀이...'}
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>{isEn ? 'Western Psychoanalytical Interpretation (Freud/Jung)' : '서양 정신분석학 해석 (프로이트/융)'}</label>
                    <textarea 
                      value={newSymbol.psychological}
                      onChange={(e) => setNewSymbol({ ...newSymbol, psychological: e.target.value })}
                      style={styles.textarea}
                      placeholder={isEn ? 'Inner mind / subconscious / desire projection...' : '내면 심리/무의식/욕구 투영 풀이...'}
                    />
                  </div>
                </div>
                <div style={styles.formBtnGroup}>
                  <button onClick={() => setIsAddingNew(false)} style={styles.formCancelBtn}>{isEn ? 'Cancel' : '취소'}</button>
                  <button onClick={handleAddNew} className="glow-btn" style={styles.formSubmitBtn}>{isEn ? 'Save' : '추가 저장'}</button>
                </div>
              </div>
            )}

            {/* Edit Form */}
            {editingSymbol && (
              <div style={styles.crudForm} className="fade-in">
                <h3 style={styles.formTitle}>{isEn ? 'Edit Dream Symbol' : '꿈 상징 편집'}</h3>
                <div style={styles.formGrid}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>{isEn ? 'Symbol Name' : '상징 이름'}</label>
                    <input 
                      type="text" 
                      value={editingSymbol.name}
                      onChange={(e) => setEditingSymbol({ ...editingSymbol, name: e.target.value })}
                      style={styles.inputText}
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>{isEn ? 'Eastern Traditional Interpretation' : '동양 전통 해몽 해석'}</label>
                    <textarea 
                      value={editingSymbol.traditional}
                      onChange={(e) => setEditingSymbol({ ...editingSymbol, traditional: e.target.value })}
                      style={styles.textarea}
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>{isEn ? 'Western Psychoanalytical Interpretation (Freud/Jung)' : '서양 정신분석학 해석 (프로이트/융)'}</label>
                    <textarea 
                      value={editingSymbol.psychological}
                      onChange={(e) => setEditingSymbol({ ...editingSymbol, psychological: e.target.value })}
                      style={styles.textarea}
                    />
                  </div>
                </div>
                <div style={styles.formBtnGroup}>
                  <button onClick={() => setEditingSymbol(null)} style={styles.formCancelBtn}>{isEn ? 'Cancel' : '취소'}</button>
                  <button onClick={handleUpdate} className="glow-btn" style={styles.formSubmitBtn}>{isEn ? 'Save Changes' : '변경 사항 저장'}</button>
                </div>
              </div>
            )}

            {/* Symbols Table */}
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.trHeader}>
                    <th style={{ ...styles.th, width: '15%' }}>{isEn ? 'Symbol' : '상징 키워드'}</th>
                    <th style={{ ...styles.th, width: '37.5%' }}>{isEn ? 'Eastern Traditional Perspective' : '동양 전통 해몽학 관점'}</th>
                    <th style={{ ...styles.th, width: '37.5%' }}>{isEn ? 'Western Psychoanalytical Perspective' : '서양 정신분석학 관점 (융/프로이트)'}</th>
                    <th style={{ ...styles.th, width: '10%', textAlign: 'center' }}>{isEn ? 'Manage' : '관리'}</th>
                  </tr>
                </thead>
                <tbody>
                  {symbols.map(s => (
                    <tr key={s.key} style={styles.tr}>
                      <td style={{ ...styles.td, fontWeight: '600', color: 'var(--color-secondary)' }}>
                        {isEn ? (s.nameEn || s.name) : s.name}
                      </td>
                      <td style={styles.td}>{isEn ? (s.traditionalEn || s.traditional) : s.traditional}</td>
                      <td style={styles.td}>{isEn ? (s.psychologicalEn || s.psychological) : s.psychological}</td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <div style={styles.actionsCell}>
                          <button 
                            onClick={() => { setEditingSymbol(s); setIsAddingNew(false); }}
                            style={styles.editBtn}
                            title={isEn ? 'Edit' : '편집'}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(s.key, s.name)}
                            style={styles.deleteBtn}
                            title={isEn ? 'Delete' : '삭제'}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Dream Interpretation Whitepaper */}
        {activeTab === 'whitepaper' && (
          <div className="fade-in" style={styles.whitepaperGrid}>
            <h2 style={styles.contentTitle}>꿈 해석 백서 (Dream Interpretation Manual)</h2>
            <p style={{ ...styles.contentDesc, marginBottom: '24px' }}>
              DreamTeller 애플리케이션이 제공하는 꿈 분석 풀이의 3가지 학술적/문화적 기준 가이드북입니다.
            </p>

            <div style={styles.cardCol}>
              {/* Traditional */}
              <div style={styles.paperCard}>
                <h3 style={styles.paperCardTitle} className="font-display text-gradient-gold">1. 동양 전통 해몽학 관점 (길흉과 표상)</h3>
                <div style={styles.paperCardBody}>
                  <p>
                    동양 전통 해몽의 본질은 꿈속에 나타난 표상(의식 속에 투영된 특정 사물 및 인물)이 실재 미래의 현실에서 다가올 <b>기운의 음양조화와 길흉화복(吉凶禍福)</b>을 거울처럼 먼저 내비친다는 동기감응론에 기초합니다.
                  </p>
                  <ul style={styles.paperList}>
                    <li><b>길몽 (Lucky Dream)</b>: 맑은 물, 활활 타는 불, 돼지, 하늘을 비행함 등은 재물이나 관직운, 명예가 상승하는 기운입니다.</li>
                    <li><b>흉몽 (Cautionary Dream)</b>: 이빨이 빠짐, 신체 일부가 손상됨, 흙탕물 등은 우환, 주변인의 건강 악화, 계약의 상실을 예고합니다.</li>
                    <li><b>태몽 (Conception Dream)</b>: 영물이 품에 안기거나 수확물을 가득 담아오는 꿈은 생명 탄생 및 해당 아이의 성향을 미리 보여줍니다.</li>
                  </ul>
                </div>
              </div>

              {/* Psychoanalysis */}
              <div style={styles.paperCard}>
                <h3 style={styles.paperCardTitle} className="font-display text-gradient-purple">2. 서양 정신분석학 관점 (무의식과 자아성찰)</h3>
                <div style={styles.paperCardBody}>
                  <p>
                    서양 심리학적 접근은 꿈을 외부의 영적 계시가 아니라, <b>사용자 자신의 정신적 내면이 겪어내는 소통 시도</b>로 간주합니다.
                  </p>
                  <ul style={styles.paperList}>
                    <li><b>지그문트 프로이트 (Sigmund Freud)</b>: 꿈은 '소망의 충족(Wish Fulfillment)'입니다. 현실에서 의도적으로 억압된 성적 리비도나 금기된 갈망들이 왜곡된 연출(상징적 압축과 전위)을 거쳐 꿈속에서 발현되는 것으로 봅니다.</li>
                    <li><b>칼 융 (Carl Gustav Jung)</b>: 꿈은 의식과 무의식의 상보성(자정작용)입니다. 현실의 치우친 의식을 바로잡기 위해 집단적 무의식의 원형(Shadow, Anima/Animus)이 꿈에 메신저 형태로 등장해 무의식을 의식화함으로써 온전한 자아실현(Individuation)을 돕는 역할을 합니다.</li>
                  </ul>
                </div>
              </div>

              {/* Cognitive/Emotional */}
              <div style={styles.paperCard}>
                <h3 style={styles.paperCardTitle} className="font-display text-gradient-cyan">3. 현대 인지/감정 분석 관점 (정신적 과부하 정리)</h3>
                <div style={styles.paperCardBody}>
                  <p>
                    현대 뇌과학 및 인지심리학적 분석은 꿈을 <b>뇌가 현실에서 수신한 무수한 정보와 감정 찌꺼기를 선별 정리하는 청소 시간</b>으로 봅니다.
                  </p>
                  <ul style={styles.paperList}>
                    <li><b>감정 정리 (Emotional Consolidation)</b>: 억압되었거나 해소되지 못한 불안, 공포, 슬픔 등의 감정을 꿈의 비현실적인 스토리라인에 결합하여 안전하게 방출하고 정화하는 자가 치료 기제입니다.</li>
                    <li><b>해결 제언</b>: 꿈속의 감정 비율(공포, 불안 대 안도, 기쁨)을 백분율로 환산하여 사용자의 현재 현실 스트레스 누적도를 판별하는 지표로 사용합니다.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Prompt Configurator */}
        {activeTab === 'prompts' && (
          <div className="fade-in">
            <h2 style={styles.contentTitle}>AI 시스템 프롬프트 및 파라미터 (System Prompt Configuration)</h2>
            <p style={styles.contentDesc}>
              AI 엔진(Chrome Gemini Nano, Cloud Gemini API, Qwen Local) 구동 시 모델 내부로 주입되는 시스템 명령 조율 현황입니다.
            </p>

            <div style={styles.promptTemplateBox}>
              <div style={styles.promptHeader}>
                <span style={styles.promptTitle}>System Prompt Template (Core Instructions)</span>
                <span style={styles.badgeKey}>Read Only</span>
              </div>
              <pre style={styles.promptCode}>
{`당신은 심층 심리학과 동양 전통 해몽학을 융합한 우주적 깊이를 가진 세계 최고의 꿈 해석가(DreamTeller)입니다.
사용자가 꾼 꿈을 분석하여 다음 JSON 형식으로만 정확히 반환해 주세요. 추가적인 설명이나 백틱(\`\`\`) 없이 순수 JSON만 반환해야 합니다.

사용자의 꿈 텍스트와 매치되는 핵심 상징 지식 사전은 다음과 같습니다 (필요시 적극 활용하되, 입력에 반응하여 가감하세요):
[상징 데이터 주입 컨텍스트]

[해석 기준 지침]
- [선택된 해몽 관점에 따른 세부 규칙]
- 한국어로 작성해 주세요. 문체는 "~입니다", "~해석됩니다"처럼 품격 있고 부드러운 영적인 어조로 작성해 주세요.

[반환해야 할 JSON 형식]
{
  "symbols": [
    { "name": "물", "meaning": "꿈에서 물이 맑게 고인 것은 무의식의 정화와 마음의 평화를 뜻하며 전통적으로 재물을 의미합니다." }
  ],
  "deepAnalysis": "전체 꿈에 대한 심층적이고 몽환적인 해석 본문 (최소 3~4문장)",
  "advice": "사용자가 오늘 하루 삶에 대입할 수 있는 따뜻하고 구체적인 조언",
  "emotionScores": {
    "fear": 20,
    "joy": 10,
    "anxiety": 50,
    "peace": 20
  },
  "tarotCard": {
    "title": "달 (The Moon)",
    "description": "감춰진 무의식의 안개를 걷어내고 마음의 지혜를 구하는 시기입니다.",
    "cardType": "moon"
  }
}`}
              </pre>
            </div>
            
            <div style={{ ...styles.alertBox, marginTop: '20px', border: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.01)' }}>
              <AlertTriangle size={20} color="var(--color-accent)" style={{ marginRight: '10px', flexShrink: 0 }} />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {isEn 
                  ? '* Modifications and fine-tuning of the prompt template are controlled via developer custom edits in the code inside src/services/aiService.ts.'
                  : '* 프롬프트 템플릿의 변형과 미세 조정(Fine-tuning)은 src/services/aiService.ts 소스코드 내 getSystemPrompt() 함수에서 개발자용 커스텀 편집으로 제어됩니다.'}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Audit Logs */}
        {activeTab === 'logs' && (
          <div className="fade-in">
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.contentTitle}>{isEn ? 'System Audit Logs' : '시스템 감사 로그 (Audit Logs)'}</h2>
                <p style={styles.contentDesc}>
                  {isEn 
                    ? 'Anonymized performance and diagnostic records collected during local browser sessions, including interpretation attempts, success rates, and dictionary edits.'
                    : '꿈 해석 시도, 성공/실패율, 사전 편집 등 로컬 브라우저 세션에서 수집된 익명화된 성능 및 진단 기록입니다.'}
                </p>
              </div>
              <div>
                <button onClick={handleClearLogs} style={styles.deleteBtnText} disabled={logs.length === 0}>
                  {isEn ? 'Clear All Logs' : '로그 기록 영구삭제'}
                </button>
              </div>
            </div>

            {logs.length === 0 ? (
              <div style={styles.emptyLogs}>{isEn ? 'Audit logs are empty.' : '감사 기록이 비어 있습니다.'}</div>
            ) : (
              <div style={styles.logList}>
                {logs.map(log => (
                  <div key={log.id} style={styles.logItem}>
                    <div style={styles.logMeta}>
                      <span style={styles.logTime}>{new Date(log.timestamp).toLocaleString()}</span>
                      <span style={{
                        ...styles.logBadge,
                        backgroundColor: 
                          log.eventType === 'interpretation_success' ? 'rgba(45, 90%, 60%, 0.15)' :
                          log.eventType === 'interpretation_fail' ? 'rgba(230, 50, 50, 0.15)' :
                          'rgba(180, 80%, 65%, 0.15)',
                        color:
                          log.eventType === 'interpretation_success' ? 'var(--color-accent)' :
                          log.eventType === 'interpretation_fail' ? '#ff6b6b' :
                          'var(--color-secondary)'
                      }}>
                        {log.eventType.toUpperCase()}
                      </span>
                      <span style={styles.logEngine}>Engine: {log.engineUsed}</span>
                    </div>
                    <div style={styles.logDetails}>{log.details}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  loginBg: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '70vh',
    width: '100%',
    padding: '20px',
  },
  loginCard: {
    width: '100%',
    maxWidth: '400px',
    padding: '36px',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  lockIconContainer: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '20px',
  },
  loginTitle: {
    fontSize: '2rem',
    marginBottom: '8px',
  },
  loginSubtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginBottom: '28px',
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  passwordInput: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '14px',
    color: '#fff',
    fontSize: '1rem',
    textAlign: 'center',
    outline: 'none',
    transition: 'all var(--transition-fast)',
  },
  passwordInputError: {
    borderColor: '#ff6b6b',
    boxShadow: '0 0 10px rgba(255, 107, 107, 0.2)',
  },
  errorText: {
    fontSize: '0.75rem',
    color: '#ff6b6b',
    textAlign: 'center',
    marginTop: '-4px',
  },
  loginBtnGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    gap: '10px',
    marginTop: '10px',
  },
  loginBackBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  loginSubmitBtn: {
    padding: '10px 20px',
    fontSize: '0.9rem',
  },
  dashboardContainer: {
    width: '90%',
    maxWidth: '1200px',
    margin: '30px auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  topHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderRadius: '16px',
  },
  dashTitle: {
    fontSize: '1.6rem',
    margin: 0,
  },
  dashSubtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginTop: '4px',
  },
  headerBtnGroup: {
    display: 'flex',
    gap: '12px',
  },
  headerBackBtn: {
    background: 'none',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    padding: '8px 16px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'all var(--transition-fast)',
  },
  logoutBtn: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    border: '1px solid rgba(255, 107, 107, 0.3)',
    color: '#ff6b6b',
    padding: '8px 16px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'all var(--transition-fast)',
  },
  tabBar: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '4px',
  },
  tabBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '10px 18px',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all var(--transition-fast)',
  },
  tabBtnActive: {
    backgroundColor: 'var(--color-primary)',
    borderColor: 'var(--color-primary)',
    color: '#fff',
    boxShadow: '0 0 10px hsla(265, 75%, 65%, 0.3)',
  },
  tabContent: {
    padding: '28px',
    borderRadius: '16px',
    minHeight: '400px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '16px',
    gap: '20px',
  },
  contentTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#fff',
  },
  contentDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginTop: '4px',
    lineHeight: '1.4',
  },
  resetBtn: {
    background: 'none',
    border: '1px solid var(--border-color)',
    color: 'var(--text-muted)',
    padding: '8px 16px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  addBtn: {
    padding: '8px 20px',
    fontSize: '0.85rem',
  },
  crudForm: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
  },
  formTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '16px',
  },
  formGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  inputText: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '10px',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
  },
  textarea: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '10px',
    color: '#fff',
    fontSize: '0.9rem',
    minHeight: '70px',
    resize: 'vertical',
    outline: 'none',
    lineHeight: '1.4',
  },
  formBtnGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
  },
  formCancelBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  formSubmitBtn: {
    padding: '8px 20px',
    fontSize: '0.85rem',
  },
  tableWrapper: {
    overflowX: 'auto',
    width: '100%',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  trHeader: {
    borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
  },
  th: {
    padding: '12px 16px',
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'background var(--transition-fast)',
  },
  td: {
    padding: '16px',
    fontSize: '0.85rem',
    color: 'var(--text-main)',
    lineHeight: '1.5',
    verticalAlign: 'top',
  },
  actionsCell: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
  },
  editBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-secondary)',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '4px',
    backgroundColor: 'rgba(180, 80%, 65%, 0.1)',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#ff6b6b',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '4px',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  whitepaperGrid: {
    display: 'flex',
    flexDirection: 'column',
  },
  cardCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  paperCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '20px',
  },
  paperCardTitle: {
    fontSize: '1.05rem',
    marginBottom: '10px',
  },
  paperCardBody: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    lineHeight: '1.6',
  },
  paperList: {
    marginTop: '10px',
    paddingLeft: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    listStyleType: 'disc',
  },
  promptTemplateBox: {
    backgroundColor: '#0c0a12',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '8px',
    padding: '16px',
    overflow: 'auto',
  },
  promptHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '8px',
  },
  promptTitle: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--color-secondary)',
  },
  promptCode: {
    fontFamily: 'monospace',
    fontSize: '0.8rem',
    color: '#ddd',
    lineHeight: '1.4',
    whiteSpace: 'pre-wrap',
  },
  alertBox: {
    display: 'flex',
    padding: '12px 16px',
    borderRadius: '8px',
    alignItems: 'center',
  },
  deleteBtnText: {
    background: 'none',
    border: 'none',
    color: '#ff6b6b',
    cursor: 'pointer',
    fontSize: '0.85rem',
    textDecoration: 'underline',
  },
  emptyLogs: {
    padding: '60px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
  },
  logList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '500px',
    overflowY: 'auto',
  },
  logItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
    padding: '12px 16px',
  },
  logMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '6px',
  },
  logTime: {
    fontSize: '0.75rem',
    color: '#888',
  },
  logBadge: {
    fontSize: '0.7rem',
    fontWeight: '600',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  logEngine: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginLeft: 'auto',
  },
  logDetails: {
    fontSize: '0.85rem',
    color: '#dfdfdf',
    lineHeight: '1.4',
  }
};
