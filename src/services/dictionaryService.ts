export interface DreamSymbol {
  key: string;           // 고유 키 (예: 'water')
  name: string;          // 한글 상징 이름 (예: '물')
  traditional: string;   // 동양 전통 해몽 풀이
  psychological: string; // 서양 심리학적 풀이 (프로이트/융)
}

const STORAGE_KEY = 'dreamteller_dictionary';

const DEFAULT_SYMBOLS: DreamSymbol[] = [
  {
    key: 'water',
    name: '물',
    traditional: '맑은 물은 횡재수와 큰 재물을 상징하는 길몽이며, 탁한 물은 건강 악화나 시비에 휘말릴 수 있는 경고로 해석합니다.',
    psychological: '무의식의 감정 상태와 에너지를 나타냅니다. 고요한 물은 평화로운 내면을, 소용돌이치는 물은 억압된 감정의 혼란을 투영합니다.'
  },
  {
    key: 'fire',
    name: '불',
    traditional: '불길이 활활 타오를수록 사업의 번창, 재물의 융성, 신분 상승 등을 상징하는 매우 강력한 길몽입니다.',
    psychological: '강렬한 열망, 분노, 혹은 내적인 변혁과 정화를 의미합니다. 낡은 자아를 태우고 새롭게 태어나고자 하는 열망을 반영합니다.'
  },
  {
    key: 'pig',
    name: '돼지',
    traditional: '대표적인 재물과 행운의 상징입니다. 돼지가 품으로 들어오거나 집안으로 들어오는 꿈은 횡재와 풍요를 암시합니다.',
    psychological: '기본적인 본능적 욕구, 풍요로움에 대한 갈망, 혹은 스스로 다스리지 못하는 탐욕과 게으름에 대한 무의식적 투영일 수 있습니다.'
  },
  {
    key: 'tooth',
    name: '이빨',
    traditional: '이빨이 빠지는 꿈은 친척이나 가까운 사람의 건강 악화, 우환, 혹은 추진하던 일의 실패를 경고하는 대표적인 흉몽입니다.',
    psychological: '성장통, 거세 불안, 혹은 통제력 상실을 상징합니다. 자신의 말이나 행동의 무력함이나 노화에 대한 불안을 나타냅니다.'
  },
  {
    key: 'fly',
    name: '하늘을 날다',
    traditional: '신분이나 명예의 상승, 소망 성취를 뜻하며, 구름 위를 날아다니는 꿈은 평화와 출세를 상징합니다.',
    psychological: '억압과 속박으로부터 벗어나고 싶은 자유의 갈망을 나타냅니다. 또는 현실에서 지나치게 높은 이상을 쫓고 있음을 경고하기도 합니다.'
  },
  {
    key: 'snake',
    name: '뱀',
    traditional: '지혜, 권력, 혹은 태몽을 뜻하기도 하나, 음모나 배신, 유혹 등 부정적인 대인관계의 경고로 보기도 합니다.',
    psychological: '융 학파에서는 치유와 에너지의 상징(우로보로스)으로 보며, 프로이트 학파에서는 성적 에너지(리비도)나 무의식적 공포를 의미합니다.'
  },
  {
    key: 'fall',
    name: '떨어지다',
    traditional: '명예의 실추, 직위 해제, 혹은 건강 상의 문제를 암시하며 준비 중인 시험이나 계획의 실패를 조심해야 함을 의미합니다.',
    psychological: '불안감과 지지 기반의 상실을 투영합니다. 인생의 불확실성에 대한 두려움이나 통제력을 잃고 있다는 두려움을 드러냅니다.'
  },
  {
    key: 'chase',
    name: '쫓기다',
    traditional: '불안, 초조, 좌절 등을 겪고 있음을 나타내며, 하는 일에 큰 장애가 발생하거나 대인관계 스트레스가 누적되었음을 뜻합니다.',
    psychological: '도망치고 싶은 현실의 갈등이나 외면하고 싶은 자기 자신의 어두운 면(그림자, Shadow)을 직면하라는 무의식의 신호입니다.'
  },
  {
    key: 'dragon',
    name: '용',
    traditional: '용은 권력, 최고의 명예, 출세, 대단한 길몽을 상징하며 입신양명하여 이름을 널리 알릴 징조입니다.',
    psychological: '내재된 거대한 에너지와 잠재력, 혹은 극복해야 할 거대하고 강력한 과제나 페르소나를 투영합니다.'
  },
  {
    key: 'sky',
    name: '하늘',
    traditional: '하늘은 국가, 지도자, 부모, 혹은 드높은 명예를 상징하며, 맑은 하늘은 모든 일이 순조롭게 풀림을 암시합니다.',
    psychological: '자유를 향한 영적 동경, 혹은 현실의 한계를 벗어나 초월하고자 하는 이상주의적 욕망을 나타냅니다.'
  }
];

export const dictionaryService = {
  // 전체 상징 목록 가져오기
  getSymbols(): DreamSymbol[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SYMBOLS));
      return DEFAULT_SYMBOLS;
    }
    try {
      const parsed = JSON.parse(stored);
      // DEFAULT_SYMBOLS에만 있고 parsed에는 없는 상징들을 병합하는 마이그레이션
      let updated = [...parsed];
      let hasChange = false;
      for (const def of DEFAULT_SYMBOLS) {
        if (!updated.some(s => s.name === def.name || s.key === def.key)) {
          updated.push(def);
          hasChange = true;
        }
      }
      if (hasChange) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    } catch (e) {
      console.error('Failed to parse dictionary storage', e);
      return DEFAULT_SYMBOLS;
    }
  },

  // 상징 추가
  addSymbol(symbol: Omit<DreamSymbol, 'key'>): DreamSymbol {
    const symbols = this.getSymbols();
    const newSymbol: DreamSymbol = {
      ...symbol,
      key: `custom_${Date.now()}`
    };
    symbols.push(newSymbol);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(symbols));
    return newSymbol;
  },

  // 상징 수정
  updateSymbol(updated: DreamSymbol): void {
    const symbols = this.getSymbols();
    const idx = symbols.findIndex(s => s.key === updated.key);
    if (idx !== -1) {
      symbols[idx] = updated;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(symbols));
    }
  },

  // 상징 삭제
  deleteSymbol(key: string): void {
    let symbols = this.getSymbols();
    symbols = symbols.filter(s => s.key !== key);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(symbols));
  },

  // 기본값으로 재설정
  resetToDefault(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SYMBOLS));
  }
};
