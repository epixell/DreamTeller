export interface DreamSymbol {
  key: string;           // 고유 키 (예: 'water')
  name: string;          // 한글 상징 이름 (예: '물')
  nameEn?: string;       // 영어 상징 이름 (예: 'Water')
  nameJa?: string;       // 일본어 상징 이름 (예: '水')
  nameZh?: string;       // 중국어 번체 상징 이름 (예: '水')
  traditional: string;   // 동양 전통 해몽 풀이 (한국어)
  traditionalEn?: string; // 동양 전통 해몽 풀이 (영어)
  traditionalJa?: string; // 동양 전통 해몽 풀이 (일본어)
  traditionalZh?: string; // 동양 전통 해몽 풀이 (중국어 번체)
  psychological: string; // 서양 심리학적 풀이 (한국어)
  psychologicalEn?: string; // 서양 심리학적 풀이 (영어)
  psychologicalJa?: string; // 서양 심리학적 풀이 (일본어)
  psychologicalZh?: string; // 서양 심리학적 풀이 (중국어 번체)
}

const STORAGE_KEY = 'dreamteller_dictionary';

const DEFAULT_SYMBOLS: DreamSymbol[] = [
  {
    key: 'water',
    name: '물',
    nameEn: 'Water',
    nameJa: '水',
    nameZh: '水',
    traditional: '맑은 물은 횡재수와 큰 재물을 상징하는 길몽이며, 탁한 물은 건강 악화나 시비에 휘말릴 수 있는 경고로 해석합니다.',
    traditionalEn: 'Clear water is a lucky dream symbolizing windfall and great wealth, while turbid water represents health deterioration or warnings of getting caught in disputes.',
    traditionalJa: '澄んだ水は、思いがけない幸運や大きな財産を象徴하는吉夢であり、濁った水は健康状態の悪化や争いごとに巻き込まれる警告と解釈されます。',
    traditionalZh: '清水是象徵意外之財與巨大財富的吉兆，而渾濁的水則被解讀為健康惡化或捲入是非的警示。',
    psychological: '무의식의 감정 상태와 에너지를 나타냅니다. 고요한 물은 평화로운 내면을, 소용돌이치는 물은 억압된 감정의 혼란을 투영합니다.',
    psychologicalEn: 'Represents the emotional state and energy of the subconscious. Calm water projects inner peace, while swirling water reflects emotional chaos and repression.',
    psychologicalJa: '無意識の感情状態やエネルギーを表します。穏やかな水は平和な内面を、うねる水は抑圧された感情の混乱を投影します。',
    psychologicalZh: '代表潛意識的情感狀態與能量。平靜的水反映出內心的平和，而洶湧的漩渦則投射出壓抑情緒的混亂。'
  },
  {
    key: 'fire',
    name: '불',
    nameEn: 'Fire',
    nameJa: '火',
    nameZh: '火',
    traditional: '불길이 활활 타오를수록 사업의 번창, 재물의 융성, 신분 상승 등을 상징하는 매우 강력한 길몽입니다.',
    traditionalEn: 'A very powerful auspicious dream. The brighter the fire burns, the more it symbolizes prosperity in business, abundance of wealth, and rise in social status.',
    traditionalJa: '炎が勢いよく燃え上がるほど、事業の繁栄、財産の隆盛、地位の上昇などを象徴する非常に強力な吉夢です。',
    traditionalZh: '火焰燃燒得越旺盛，越是象徵事業興旺、財源廣進、地位提升等極為強大的吉兆。',
    psychological: '강렬한 열망, 분노, 혹은 내적인 변혁과 정화를 의미합니다. 낡은 자아를 태우고 새롭게 태어나고자 하는 열망을 반영합니다.',
    psychologicalEn: 'Represents intense desire, anger, or inner transformation and purification. It reflects the urge to burn the old self and be reborn.',
    psychologicalJa: '強烈な熱望、怒り、あるいは内的な変革と浄化を意味します。古い自己を焼き払い、新しく生まれ変わりたいという熱望を反映しています。',
    psychologicalZh: '意指強烈的渴望、憤怒，或是內在的變革與淨化。反映了燒盡舊我、重獲新生的強烈願望。'
  },
  {
    key: 'pig',
    name: '돼지',
    nameEn: 'Pig',
    nameJa: '豚',
    nameZh: '豬',
    traditional: '대표적인 재물과 행운의 상징입니다. 돼지가 품으로 들어오거나 집안으로 들어오는 꿈은 횡재와 풍요를 암시합니다.',
    traditionalEn: 'A representative symbol of wealth and good fortune. A dream of a pig entering your arms or house indicates windfall and abundance.',
    traditionalJa: '대표적인 재물과 행운의 상징입니다. 돼지가 품으로 들어오거나 집안으로 들어오는 꿈은 臨時収入이나 풍요를 암시합니다.',
    traditionalZh: '代表性的財富與幸運象徵。豬撲入懷中或進入家門的夢境，暗示著橫財與富足。',
    psychological: '기본적인 본능적 욕구, 풍요로움에 대한 갈망, 혹은 스스로 다스리지 못하는 탐욕과 게으름에 대한 무의식적 투영일 수 있습니다.',
    psychologicalEn: 'Can be a subconscious projection of basic instinctive desires, longing for abundance, or greed and laziness that you cannot control.',
    psychologicalJa: '基本的な本能的欲求、豊かさへの渇望、あるいは自らコントロールできない貪欲さや怠惰に対する無意識の投影である可能性があります。',
    psychologicalZh: '可能是基本本能慾望、對富足的渴望，或是潛意識中對自己無法控制的貪婪與懶惰的投射。'
  },
  {
    key: 'tooth',
    name: '이빨',
    nameEn: 'Teeth',
    nameJa: '歯',
    nameZh: '牙齒',
    traditional: '이빨이 빠지는 꿈은 친척이나 가까운 사람의 건강 악화, 우환, 혹은 추진하던 일의 실패를 경고하는 대표적인 흉몽입니다.',
    traditionalEn: 'A representative nightmare warning of health deterioration, misfortune of relatives, or failure of planned projects.',
    traditionalJa: '歯が抜ける夢は、親戚や親しい人の健康悪化、不幸、あるいは進行中の仕事の失敗を警告する代表的な凶夢です。',
    traditionalZh: '牙齒脫落的夢境是警告親戚或身邊親近之人健康惡化、遭遇厄運，或所推進之事面臨失敗的代表性凶兆。',
    psychological: '성장통, 거세 불안, 혹은 통제력 상실을 상징합니다. 자신의 말이나 행동의 무력함이나 노화에 대한 불안을 나타냅니다.',
    psychologicalEn: 'Symbolizes growing pains, castration anxiety, or loss of control. It represents anxiety about the powerlessness of one\'s words/actions or aging.',
    psychologicalJa: '成長痛、去勢不安、あるいはコントロールの喪失を象徴します。自分の言葉や行動の無力感、衰えに対する不安を表します。',
    psychologicalZh: '象徵成長痛、閹割焦慮或失去控制力。表現了對自身言行無力感或衰老的焦慮。'
  },
  {
    key: 'fly',
    name: '하늘을 날다',
    nameEn: 'Flying',
    nameJa: '空を飛ぶ',
    nameZh: '飛翔',
    traditional: '신분이나 명예의 상승, 소망 성취를 뜻하며, 구름 위를 날아다니는 꿈은 평화와 출세를 상징합니다.',
    traditionalEn: 'Represents rise in status or honor and fulfillment of wishes. Flying above clouds symbolizes peace and success.',
    traditionalJa: '地位や名誉の上昇、願いの成就を意味し、雲の上を飛び回る夢は平和と出世を象徴します。',
    traditionalZh: '意指地位或名譽的提升、心願達成，在雲端飛翔的夢境象徵著和平與飛黃騰達。',
    psychological: '억압과 속박으로부터 벗어나고 싶은 자유의 갈망을 나타냅니다. 또는 현실에서 지나치게 높은 이상을 쫓고 있음을 경고하기도 합니다.',
    psychologicalEn: 'Indicates a longing for freedom to escape from oppression and restraint. It also warns against chasing unrealistically high ideals.',
    psychologicalJa: '抑圧や束縛から逃れたいという自由への渇望を表します。または現実において高すぎる理想を追い求めていることへの警告でもあります。',
    psychologicalZh: '表達了渴望擺脫壓抑與束縛、追求自由的嚮往。或者也是警告在現實中追求了過高且不切實際的理想。'
  },
  {
    key: 'snake',
    name: '뱀',
    nameEn: 'Snake',
    nameJa: '蛇',
    nameZh: '蛇',
    traditional: '지혜, 권력, 혹은 태몽을 뜻하기도 하나, 음모나 배신, 유혹 등 부정적인 대인관계의 경고로 보기도 합니다.',
    traditionalEn: 'Can represent wisdom, power, or conception, but is also viewed as a warning of conspiracies, betrayal, or temptation in relationships.',
    traditionalJa: '知恵、権力、あるいは胎夢を意味することもありますが、陰謀や裏切り、誘惑など、人間関係における否定的な警告とも解釈されます。',
    traditionalZh: '雖代表智慧、權力或胎夢，但也被視為陰謀、背叛、誘惑等否定性人際關係的警示。',
    psychological: '융 학파에서는 치유와 에너지의 상징(우로보로스)으로 보며, 프로이트 학파에서는 성적 에너지(리비도)나 무의식적 공포를 의미합니다.',
    psychologicalEn: 'In Jungian psychology, it symbolizes healing and energy (Ouroboros). In Freudian terms, it means sexual energy (libido) or subconscious fear.',
    psychologicalJa: 'ユング派では癒やしとエネルギーの象徴（ウロボロス）と見なし、フロイト派では性的エネルギー（リビドー）や無意識の恐怖を意味します。',
    psychologicalZh: '榮格學派將其視為治癒與能量的象徵（銜尾蛇），而佛洛伊德學派則解讀為性能量（原力）或潛意識的恐懼。'
  },
  {
    key: 'fall',
    name: '떨어지다',
    nameEn: 'Falling',
    nameJa: '落ちる',
    nameZh: '墜落',
    traditional: '명예의 실추, 직위 해제, 혹은 건강 상의 문제를 암시하며 준비 중인 시험이나 계획의 실패를 조심해야 함을 의미합니다.',
    traditionalEn: 'Suggests loss of honor, dismissal from position, or health issues, warning of potential failures in exams or plans.',
    traditionalJa: '名誉の失墜、免職、あるいは健康上の問題を暗示し、準備中の試験や計画の失敗に注意する必要があることを意味します。',
    traditionalZh: '暗示名譽受損、免職或健康問題，意指需要提防正在準備的考試或計劃面臨失敗。',
    psychological: '불안감과 지지 기반의 상실을 투영합니다. 인생의 불확실성에 대한 두려움이나 통제력을 잃고 있다는 두려움을 드러냅니다.',
    psychologicalEn: 'Projects anxiety and loss of support. It reveals fear of life\'s uncertainty or losing control.',
    psychologicalJa: '不安感や支持基盤の喪失を投影します。人生の不確実性に対する恐れや、コントロールを失っているという恐怖を表します。',
    psychologicalZh: '投射出焦慮感與失去支持基礎的感覺。揭示了對生活不確定性的恐懼，或失去控制力的害怕。'
  },
  {
    key: 'chase',
    name: '쫓기다',
    nameEn: 'Being Chased',
    nameJa: '追われる',
    nameZh: '被追逐',
    traditional: '불안, 초조, 좌절 등을 겪고 있음을 나타내며, 하는 일에 큰 장애가 발생하거나 대인관계 스트레스가 누적되었음을 뜻합니다.',
    traditionalEn: 'Indicates anxiety, impatience, or frustration, suggesting major obstacles in work or accumulated relationship stress.',
    traditionalJa: '不安、焦り、挫折などを感じていることを表し、行っている仕事に大きな障害が発生するか、人間関係のストレスが蓄積していることを意味します。',
    traditionalZh: '表明正經歷焦慮、焦躁、挫折等，意指工作上將遭遇重大障礙，或人際關係壓力已累積到極限。',
    psychological: '도망치고 싶은 현실의 갈등이나 외면하고 싶은 자기 자신의 어두운 면(그림자, Shadow)을 직면하라는 무의식의 신호입니다.',
    psychologicalEn: 'A subconscious signal to face conflicts you want to flee from or the shadow (dark side of yourself) you want to ignore.',
    psychologicalJa: '逃げ出したい現実の葛藤や、目を背けたい自分自身の暗い面（シャドウ、影）に向き合いなさいという無意識からのシグナルです。',
    psychologicalZh: '這是潛意識發出的信號，促使您去直面想要逃避的現實衝突，或是想要忽視的自身陰暗面（陰影，Shadow）。'
  },
  {
    key: 'dragon',
    name: '용',
    nameEn: 'Dragon',
    nameJa: '竜',
    nameZh: '龍',
    traditional: '용은 권력, 최고의 명예, 출세, 대단한 길몽을 상징하며 입신양명하여 이름을 널리 알릴 징조입니다.',
    traditionalEn: 'The dragon is a great auspicious dream symbolizing power, supreme honor, and success, predicting fame and rise in status.',
    traditionalJa: '竜は権力、最高の誉れ、出世、素晴らしい吉夢を象徴し、立身出世して名を広く轟かせる兆しです。',
    traditionalZh: '龍象徵著權力、至高無上的榮譽、發達、極佳的吉兆，預示著立身揚名、聲名遠播。',
    psychological: '내재된 거대한 에너지와 잠재력, 혹은 극복해야 할 거대하고 강력한 과제나 페르소나를 투영합니다.',
    psychologicalEn: 'Projects your inherent massive energy, potential, or powerful tasks/persona that you need to overcome.',
    psychologicalJa: '内在する巨大なエネルギーと潜在能力、あるいは克服すべき巨大で強力な課題やペルソナを投影します。',
    psychologicalZh: '投射出內在巨大的能量與潛力，或是需要克服的巨大且強大的任務或人格面具（Persona）。'
  },
  {
    key: 'sky',
    name: '하늘',
    nameEn: 'Sky',
    nameJa: '空',
    nameZh: '天空',
    traditional: '하늘은 국가, 지도자, 부모, 혹은 드높은 명예를 상징하며, 맑은 하늘은 모든 일이 순조롭게 풀림을 암시합니다.',
    traditionalEn: 'The sky symbolizes the nation, leader, parents, or high honor. A clear sky implies that everything will proceed smoothly.',
    traditionalJa: '空は国家、指導者、親、あるいは高い名誉を象徴し、澄み切った空はすべての出来事が順調に運ぶことを暗示します。',
    traditionalZh: '天空象徵著國家、領導者、父母或崇高的名譽，晴朗的天空暗示萬事順遂。',
    psychological: '자유를 향한 영적 동경, 혹은 현실의 한계를 벗어나 초월하고자 하는 이상주의적 욕망을 나타냅니다.',
    psychologicalEn: 'Represents a spiritual longing for freedom, or an idealistic desire to transcend the limitations of reality.',
    psychologicalJa: '空は国家、指導者、親、あるいは高い名誉を象徴し、澄み切った空はすべての出来事が順調に運ぶことを暗示します。',
    psychologicalZh: '表達了對自由的精神嚮往，或是渴望超越現實限制的理想主義慾望。'
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
      // DEFAULT_SYMBOLS에만 있고 parsed에는 없는 상징들을 병합하거나 신규 일어/중어 필드를 채워주는 마이그레이션
      let updated = [...parsed];
      let hasChange = false;
      for (const def of DEFAULT_SYMBOLS) {
        const existingIdx = updated.findIndex(s => s.key === def.key);
        if (existingIdx === -1) {
          updated.push(def);
          hasChange = true;
        } else {
          const existing = updated[existingIdx];
          if (!existing.nameEn || !existing.traditionalEn || !existing.psychologicalEn ||
              !existing.nameJa || !existing.traditionalJa || !existing.psychologicalJa ||
              !existing.nameZh || !existing.traditionalZh || !existing.psychologicalZh) {
            updated[existingIdx] = {
              ...def,
              ...existing,
              nameEn: def.nameEn,
              traditionalEn: def.traditionalEn,
              psychologicalEn: def.psychologicalEn,
              nameJa: def.nameJa,
              traditionalJa: def.traditionalJa,
              psychologicalJa: def.psychologicalJa,
              nameZh: def.nameZh,
              traditionalZh: def.traditionalZh,
              psychologicalZh: def.psychologicalZh
            };
            hasChange = true;
          }
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
