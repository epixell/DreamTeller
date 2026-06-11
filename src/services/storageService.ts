export interface DreamRecord {
  id: string;
  date: string;
  content: string;
  selectedMode: 'traditional' | 'psychological' | 'hybrid';
  aiEngine: 'chrome-nano' | 'qwen-local' | 'gemini-api' | 'mock-demo';
  interpretation: {
    symbols: { name: string; meaning: string }[];
    deepAnalysis: string;
    advice: string;
    emotionScores: {
      fear: number;
      joy: number;
      anxiety: number;
      peace: number;
    };
    tarotCard: {
      title: string;
      description: string;
      cardType: string; // e.g. 'star', 'moon', 'sun', 'tower', 'fool', 'lovers'
    };
  };
}

export interface AppSettings {
  preferredEngine: 'chrome-nano' | 'qwen-local' | 'gemini-api' | 'mock-demo';
  geminiApiKey: string;
  theme: 'mystic';
}


export interface AuditLog {
  id: string;
  timestamp: string;
  eventType: 'interpretation_start' | 'interpretation_success' | 'interpretation_fail' | 'dictionary_edit' | 'prompt_update';
  engineUsed: string;
  details: string;
}

const HISTORY_KEY = 'dreamteller_history';
const SETTINGS_KEY = 'dreamteller_settings';
const LOGS_KEY = 'dreamteller_audit_logs';

export const storageService = {
  // --- Dream History ---
  getHistory(): DreamRecord[] {
    const data = localStorage.getItem(HISTORY_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse dream history', e);
      return [];
    }
  },

  saveRecord(record: DreamRecord): void {
    const history = this.getHistory();
    history.unshift(record); // 최신 글이 맨 위로
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    
    // 감사 로그 기록
    this.addAuditLog({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: 'interpretation_success',
      engineUsed: record.aiEngine,
      details: `꿈 길이: ${record.content.length}글자, 해석 모드: ${record.selectedMode}`
    });
  },

  deleteRecord(id: string): void {
    let history = this.getHistory();
    history = history.filter(r => r.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  },

  // --- App Settings ---
  getSettings(): AppSettings {
    const data = localStorage.getItem(SETTINGS_KEY);
    const defaultSettings: AppSettings = {
      preferredEngine: 'chrome-nano',
      geminiApiKey: '',
      theme: 'mystic'
    };
    if (!data) return defaultSettings;
    try {
      return { ...defaultSettings, ...JSON.parse(data) };
    } catch (e) {
      return defaultSettings;
    }
  },

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  // --- Audit Logs ---
  getAuditLogs(): AuditLog[] {
    const data = localStorage.getItem(LOGS_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  },

  addAuditLog(log: AuditLog): void {
    const logs = this.getAuditLogs();
    logs.unshift(log); // 최신 로그 우선
    if (logs.length > 200) logs.pop(); // 최대 200개 유지
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  },

  clearAuditLogs(): void {
    localStorage.removeItem(LOGS_KEY);
  }
};
