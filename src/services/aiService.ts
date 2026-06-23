import { chromeAIService } from './chromeAIService';
import { qwenAIService } from './qwenAIService';
import { dictionaryService } from './dictionaryService';
import type { DreamSymbol } from './dictionaryService';
import { storageService } from './storageService';
import { blogKeywords } from '../data/blogKeywords';

export interface InterpretationResult {
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
    cardType: string;
  };
  referencedPost?: {
    id: string;
    title: string;
  } | null;
}

// 다국어 필드 추출 헬퍼 함수
const getLocVal = (obj: any, baseField: string, lang: string) => {
  if (lang === 'en') return obj[baseField + 'En'] || obj[baseField];
  if (lang === 'ja') return obj[baseField + 'Ja'] || obj[baseField + 'En'] || obj[baseField];
  if (lang === 'zh-TW') return obj[baseField + 'Zh'] || obj[baseField + 'En'] || obj[baseField];
  return obj[baseField];
};

// AI 응답을 안전하게 파싱하는 헬퍼 함수
function parseAIResponse(rawText: string, matchedSymbols: DreamSymbol[], selectedMode: string, language: string): InterpretationResult {
  const cleanText = rawText.trim();
  
  // 1. JSON 형식 추출 및 파싱 시도
  try {
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const deepAnalysis = parsed.deepAnalysis || parsed.analysis || parsed.result || '';
      const advice = parsed.advice || parsed.suggestion || '';
      if (deepAnalysis && advice) {
        return {
          symbols: (parsed.symbols && Array.isArray(parsed.symbols) && parsed.symbols.length > 0)
            ? parsed.symbols.map((s: any) => ({ name: s.name || s.keyword || '', meaning: s.meaning || s.desc || '' }))
            : (matchedSymbols.length > 0 ? matchedSymbols.map(s => ({
                name: getLocVal(s, 'name', language),
                meaning: selectedMode === 'traditional' 
                  ? getLocVal(s, 'traditional', language)
                  : getLocVal(s, 'psychological', language)
              })) : []),
          deepAnalysis: deepAnalysis,
          advice: advice,
          emotionScores: {
            fear: Number(parsed.emotionScores?.fear ?? Math.floor(Math.random() * 30) + 10),
            joy: Number(parsed.emotionScores?.joy ?? Math.floor(Math.random() * 40) + 20),
            anxiety: Number(parsed.emotionScores?.anxiety ?? Math.floor(Math.random() * 30) + 10),
            peace: Number(parsed.emotionScores?.peace ?? Math.floor(Math.random() * 40) + 30)
          },
          tarotCard: {
            title: parsed.tarotCard?.title || (
              language === 'en' ? 'Glimmering Milky Way' :
              language === 'ja' ? '運命の天の川' :
              language === 'zh-TW' ? '命運的銀河' : '운명의 은하수'
            ),
            description: parsed.tarotCard?.description || (
              language === 'en' ? 'Mystical fragments of your dream have aligned.' :
              language === 'ja' ? '神秘的な夢の断片が整列しました。' :
              language === 'zh-TW' ? '神秘的夢境碎片已排列就緒。' : '신비로운 꿈의 조각들이 정렬되었습니다.'
            ),
            cardType: ['star', 'moon', 'sun', 'tower', 'fool', 'lovers'].includes(parsed.tarotCard?.cardType)
              ? parsed.tarotCard.cardType
              : 'star'
          }
        };
      }
    }
  } catch (e) {
    console.warn('JSON parsing failed, falling back to robust parser', e);
  }

  // 1.5 JSON 파싱이 실패하고 마크다운/줄글 리포트가 온 경우 구조화 추출기 작동
  const isPlainReport = cleanText.includes('##') || 
                        cleanText.includes('상징 분석') || cleanText.includes('동양적 해석') || cleanText.includes('심리학적 해석') || cleanText.includes('전체적인 해석') ||
                        cleanText.toLowerCase().includes('symbol') || cleanText.toLowerCase().includes('eastern') || cleanText.toLowerCase().includes('psychological') || cleanText.toLowerCase().includes('analysis');
                        
  if (isPlainReport) {
    console.log('Detected markdown/plain report from AI, running structure extractor');
    const symbols: { name: string; meaning: string }[] = [];
    const lines = cleanText.split('\n');
    
    lines.forEach(line => {
      const trimmed = line.trim();
      // "Name : Meaning" 형태 추출 (글머리 기호 제거 후 매칭)
      const match = trimmed.replace(/^[-*\s\d\.]+/g, '').match(/^([가-힣a-zA-Z\s\(\)]+)\s*:\s*(.+)$/);
      if (match) {
        const name = match[1].trim();
        const meaning = match[2].trim();
        const lowerName = name.toLowerCase().replace(/\s*/g, '');
        const blacklistedNames = [
          'deepanalysis', 'advice', 'symbols', 'tarotcard', 'title', 'description', 'cardtype', 'emotionscores', 'fear', 'joy', 'anxiety', 'peace',
          '분석', '조언', '해석', '꿈내용', '분석모드', '동양적해석', '서양적해석', '꿈의상징적의미', '상징적의미', '종합적해석', '종합해석', '결론', '주의사항', '요약',
          '꿈이름', '핵심메시지', '모드', '상징분석', '동양적', '서양적', 'analysis', 'message', 'mode'
        ];
        
        if (name.length >= 2 && name.length <= 20 && !blacklistedNames.includes(lowerName) && !blacklistedNames.some(b => lowerName.includes(b))) {
          if (!symbols.some(s => s.name === name)) {
            symbols.push({ name, meaning });
          }
        }
      }
    });

    let deepAnalysis = '';
    let advice = '';
    
    // 전체적인 해석 / 종합 해석 영역 추출
    const overallMatch = cleanText.match(/(?:overall\s*analysis|overall\s*interpretation|deep\s*analysis|deep\s*interpretation|analysis|interpretation|전체적인\s*해석|전체적\s*해석|종합\s*해석|종합적\s*해석|심층\s*분석|심층\s*해석)\s*:\s*([\s\S]*?)(?=\n\s*(?:[#\-\*]|\d+\.|$))/i)
      || cleanText.match(/(?:2\.\s*동양적\s*해석|동양적\s*해석|심리학적\s*해석|서양적\s*해석|eastern\s*interpretation|western\s*interpretation)\s*:\s*([\s\S]*?)(?=\n\s*(?:[#\-\*]|\d+\.|$))/i);
      
    if (overallMatch && overallMatch[1].trim().length > 10) {
      deepAnalysis = overallMatch[1].trim();
      // 내부 글머리 기호 제거 및 정렬
      deepAnalysis = deepAnalysis.split('\n')
        .filter(l => !l.trim().startsWith('*') && !l.trim().startsWith('-'))
        .join(' ')
        .trim();
    }
    
    // 조언 영역 추출
    const adviceMatch = cleanText.match(/(?:조언|현실\s*조언|현실에\s*주는\s*조언|제언|행동\s*가이드|advice|suggestion|practical\s*advice|guideline)\s*:\s*([\s\S]*?)(?=\n\s*(?:[#\-\*]|\d+\.|$))/i);
    if (adviceMatch && adviceMatch[1].trim().length > 10) {
      advice = adviceMatch[1].trim();
    }
    
    // 특수기호 및 연속 공백 정제
    const cleanFormatting = (txt: string) => {
      return txt
        .replace(/[#\-\*`\']/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    if (deepAnalysis) deepAnalysis = cleanFormatting(deepAnalysis);
    if (advice) advice = cleanFormatting(advice);

    if (!deepAnalysis) {
      const paragraphs = cleanText.split('\n\n')
        .map(p => p.trim())
        .filter(p => p.length > 20 && !p.startsWith('*') && !p.startsWith('-') && !p.startsWith('#') && !p.includes('꿈 내용:'));
      if (paragraphs.length > 0) {
        deepAnalysis = cleanFormatting(paragraphs[paragraphs.length - 1]);
      } else {
        if (language === 'en') {
          deepAnalysis = 'Mystical energy from the universe is translating your dream frequency. Please explore the symbol tab for details.';
        } else if (language === 'ja') {
          deepAnalysis = '宇宙の神秘的なエネルギーが夢の周波数を経てあなたにメッセージを伝えています。象徴辞書タブを通じてさらに詳細な暗示を解読してみてください。';
        } else if (language === 'zh-TW') {
          deepAnalysis = '來自宇宙的神秘能量正透過夢境的頻率向您傳達訊息。請透過象徵辭典分頁來解讀更詳細的暗示。';
        } else {
          deepAnalysis = '무의식의 우주적 에너지가 꿈의 주파수를 거쳐 당신에게 메세지를 전하고 있습니다. 상징 사전 탭을 통해 더 세세한 암시를 해독해 보세요.';
        }
      }
    }
    
    if (!advice) {
      if (language === 'en') {
        advice = 'Reflect quietly on the message of the dream, taking time to clear your mind and look within.';
      } else if (language === 'ja') {
        advice = '夢が照らし出す象徴を現実の羅針盤とし、内面のストレスをケアして瞑想する浄化の時間を持ってください。';
      } else if (language === 'zh-TW') {
        advice = '將夢境映射的象徵作為現實的指南針，給自己一些時間來照料內在壓力並進行瞑想與淨化。';
      } else {
        advice = '꿈이 비추는 상징을 현실의 나침반 삼아, 내면의 스트레스를 돌보고 명상하는 정화의 시간을 가지시기 바랍니다.';
      }
    }

    // 타로 카드 자동 공명 매칭
    let cardTitle = '별 (The Star)';
    let cardDesc = '어둠 속을 비추는 희망의 빛과 영감, 정화의 에너지를 의미합니다.';
    if (language === 'en') {
      cardTitle = 'The Star';
      cardDesc = 'Symbolizes hope shining in the dark, healing grace, and spiritual guidance.';
    } else if (language === 'ja') {
      cardTitle = '星 (The Star)';
      cardDesc = '暗闇を照らす希望の光とインスピレーション、浄化のエネルギーを意味します。';
    } else if (language === 'zh-TW') {
      cardTitle = '星星 (The Star)';
      cardDesc = '如同穿透黑暗的星光，象徵在心中悄然萌芽的希望與淨化能量。';
    }
    let cardType = 'star';
    
    const cardKeywordsKo = [
      { title: '태양 (The Sun)', type: 'sun', desc: '명확한 자각, 생명력의 회복, 눈앞을 밝히는 강한 긍정의 힘을 의미합니다.', keys: ['태양', '빛'] },
      { title: '달 (The Moon)', type: 'moon', desc: '무의식의 영역, 깊은 감정의 동요, 때로는 보이지 않는 불안과 신비로움을 상징합니다.', keys: ['달', '무의식'] },
      { title: '탑 (The Tower)', type: 'tower', desc: '갑작스러운 통찰, 고정관념의 파괴, 새로운 의식의 성장을 위해 기존 벽을 깨는 힘을 상징합니다.', keys: ['탑', '파괴'] },
      { title: '연인 (The Lovers)', type: 'lovers', desc: '조화와 결합, 올바른 선택, 내면의 가치관 정립과 관계의 치유를 뜻합니다.', keys: ['연인', '인연', '사랑'] },
      { title: '광대 (The Fool)', type: 'fool', desc: '자유로운 영혼, 새로운 여정의 시작, 고정관념에서 벗어난 모험과 무한한 가능성을 암시합니다.', keys: ['광대', '여행', '시작'] },
      { title: '별 (The Star)', type: 'star', desc: '어둠을 헤치는 별빛처럼, 마음속에 조용히 싹트는 희망이 있습니다.', keys: ['별', '희망'] }
    ];

    const cardKeywordsEn = [
      { title: 'The Sun', type: 'sun', desc: 'Represents clear awareness, recovery of vitality, and strong positive energy shining upon your path.', keys: ['sun', 'light', 'bright'] },
      { title: 'The Moon', type: 'moon', desc: 'Symbolizes the realm of the unconscious, deep emotional waves, and sometimes invisible anxiety or intuition.', keys: ['moon', 'unconscious', 'night'] },
      { title: 'The Tower', type: 'tower', desc: 'Indicates sudden insight, breakdown of old structures, and growth of new consciousness.', keys: ['tower', 'break', 'sudden'] },
      { title: 'The Lovers', type: 'lovers', desc: 'Represents harmony, union, alignment of values, and healing of relationships.', keys: ['lovers', 'love', 'relationship'] },
      { title: 'The Fool', type: 'fool', desc: 'Suggests a free spirit, the start of a new journey, and infinite potential free of prejudice.', keys: ['fool', 'journey', 'start'] },
      { title: 'The Star', type: 'star', desc: 'Symbolizes hope shining in the dark, healing grace, and spiritual guidance.', keys: ['star', 'hope', 'peace'] }
    ];

    const cardKeywordsJa = [
      { title: '太陽 (The Sun)', type: 'sun', desc: '明確な自覚、生命力の回復、目の前を照らす強い肯定の力を意味します。', keys: ['太陽', '光', 'ひかり'] },
      { title: '月 (The Moon)', type: 'moon', desc: '無意識の領域、深い感情の動揺、時には目に見えない不安や神秘性を象徴します。', keys: ['月', '無意識', 'よる'] },
      { title: '塔 (The Tower)', type: 'tower', desc: '突然の洞察、固定観念の破壊、新たな意識の成長のために既存の壁を壊す力を象徴します。', keys: ['塔', '破壊', 'とう'] },
      { title: '恋人 (The Lovers)', type: 'lovers', desc: '調和と結合、正しい選択, 内面の価値観の確立と関係の癒やしを意味します。', keys: ['恋人', '縁', '愛', 'あい'] },
      { title: '愚者 (The Fool)', type: 'fool', desc: '自由な魂、新たな旅立ち、固定観念にとらわれない冒険と無限の可能性を暗示します。', keys: ['愚者', '旅', '始まり'] },
      { title: '星 (The Star)', type: 'star', desc: '暗闇を照らす星の光のように、心の中に静かに芽生える希望があります。', keys: ['星', '希望', 'ほし'] }
    ];

    const cardKeywordsZh = [
      { title: '太陽 (The Sun)', type: 'sun', desc: '代表清晰的覺察、生命力的恢復，以及照亮眼前道路的強大積極力量。', keys: ['太陽', '陽光', '光芒'] },
      { title: '月亮 (The Moon)', type: 'moon', desc: '象徵潛意識領域、深層情緒的波動，以及有時看不見的焦慮與神秘感。', keys: ['月亮', '潛意識', '黑夜'] },
      { title: '高塔 (The Tower)', type: 'tower', desc: '象徵突然的洞察力、打破舊有觀念，以及為了新意識成長而衝破障礙的力量。', keys: ['高塔', '破壞', '倒塌'] },
      { title: '戀人 (The Lovers)', type: 'lovers', desc: '意指和諧與結合、正確的選擇，以及內在價值觀的確立與關係的治癒。', keys: ['戀人', '因緣', '愛情', '選擇'] },
      { title: '愚者 (The Fool)', type: 'fool', desc: '暗示自由的靈魂、新旅程的開始，以及擺脫刻板印象的冒險與無限可能。', keys: ['愚者', '旅行', '開始', '起點'] },
      { title: '星星 (The Star)', type: 'star', desc: '如同穿透黑暗的星光，象徵在心中悄然萌芽的希望與淨化能量。', keys: ['星星', '希望', '淨化'] }
    ];

    const cardKeywords = 
      language === 'en' ? cardKeywordsEn : 
      language === 'ja' ? cardKeywordsJa : 
      language === 'zh-TW' ? cardKeywordsZh : cardKeywordsKo;

    for (const ck of cardKeywords) {
      if (ck.keys.some(k => cleanText.toLowerCase().includes(k))) {
        cardTitle = ck.title;
        cardDesc = ck.desc;
        cardType = ck.type;
        break;
      }
    }

    const fear = cleanText.includes('공포') || cleanText.includes('불안') || cleanText.toLowerCase().includes('fear') || cleanText.includes('恐怖') || cleanText.includes('恐懼') ? 55 : Math.floor(Math.random() * 25) + 15;
    const joy = cleanText.includes('기쁨') || cleanText.includes('행운') || cleanText.toLowerCase().includes('joy') || cleanText.includes('喜び') || cleanText.includes('喜悅') ? 65 : Math.floor(Math.random() * 30) + 25;
    const anxiety = cleanText.includes('갈등') || cleanText.includes('스트레스') || cleanText.toLowerCase().includes('anxiety') || cleanText.includes('葛藤') || cleanText.includes('衝突') ? 60 : Math.floor(Math.random() * 25) + 15;
    const peace = cleanText.includes('평온') || cleanText.includes('성찰') || cleanText.toLowerCase().includes('peace') || cleanText.includes('平穏') || cleanText.includes('平靜') ? 70 : Math.floor(Math.random() * 30) + 30;

    return {
      symbols: symbols.length > 0 ? symbols : matchedSymbols.map(s => ({
        name: getLocVal(s, 'name', language),
        meaning: selectedMode === 'traditional' 
          ? getLocVal(s, 'traditional', language)
          : getLocVal(s, 'psychological', language)
      })),
      deepAnalysis,
      advice,
      emotionScores: { fear, joy, anxiety, peace },
      tarotCard: {
        title: cardTitle,
        description: cardDesc,
        cardType
      }
    };
  }

  // 2. JSON 파싱이 실패했거나 불완전한 경우, 정규식 및 섹션별 텍스트 파서 작동
  console.log('Using robust text parser for AI response');

  const extractField = (keys: string[], text: string): string => {

    for (const key of keys) {
      // JSON style: "key": "value"
      const jsonStrPattern = new RegExp(`["']?${key}["']?\\s*:\\s*"([\\s\\S]*?)"(?=\\s*,|\\s*\\})`, 'i');
      let match = text.match(jsonStrPattern);
      if (match && match[1].trim().length > 10) {
        return match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').trim();
      }

      // Plain text style: Key: value
      const plainTextPattern = new RegExp(`(?:${key}|심층\\s*분석|심층\\s*해석|해석|분석|조언|현실\\s*조언|팁)\\s*:\\s*([\\s\\S]*?)(?=\\n\\s*(?:[a-zA-Z]+|심층|조언|타로|\\*|#|-|$))`, 'i');
      match = text.match(plainTextPattern);
      if (match && match[1].trim().length > 10) {
        return match[1].replace(/[{}\[\]"]/g, '').trim();
      }
    }
    return '';
  };

  let deepAnalysis = extractField(['deepAnalysis', 'analysis'], cleanText);
  let advice = extractField(['advice', 'suggestion'], cleanText);
  
  const cardTitle = extractField(['title'], cleanText) || (
    language === 'en' ? 'The Star' :
    language === 'ja' ? '星 (The Star)' :
    language === 'zh-TW' ? '星星 (The Star)' : '별 (The Star)'
  );
  const cardDesc = extractField(['description', 'desc'], cleanText) || (
    language === 'en' ? 'Symbolizes hope shining in the dark, healing grace, and spiritual guidance.' :
    language === 'ja' ? '暗闇を照らす星の光のように、心の中に静かに芽生える希望があります。' :
    language === 'zh-TW' ? '如同穿透黑暗的星光，象徵在心中悄然萌芽的希望與淨化能量。' : '어둠을 헤치는 별빛처럼, 마음속에 조용히 싹트는 희망이 있습니다.'
  );
  let cardType = extractField(['cardType'], cleanText).toLowerCase().trim() || 'star';
  if (!['star', 'moon', 'sun', 'tower', 'fool', 'lovers'].includes(cardType)) {
    cardType = 'star';
  }

  const symbols: { name: string; meaning: string }[] = [];
  
  // JSON array style: { "name": "xxx", "meaning": "yyy" }
  const symbolRegex = /\{\s*["'](?:name|keyword)["']\s*:\s*["']([^"']+)["']\s*,\s*["'](?:meaning|desc)["']\s*:\s*["']([^"']+)["']\s*\}/gi;
  let symbolMatch;
  while ((symbolMatch = symbolRegex.exec(cleanText)) !== null) {
    symbols.push({ name: symbolMatch[1].trim(), meaning: symbolMatch[2].trim() });
  }

  // Plain text style: - 키워드 : 설명
  if (symbols.length === 0) {
    const bulletRegex = /(?:^|\n)[-*\s]*([가-힣\w\s]{2,10})\s*:\s*([^#\n]+)/g;
    let bulletMatch;
    while ((bulletMatch = bulletRegex.exec(cleanText)) !== null) {
      const name = bulletMatch[1].trim();
      const meaning = bulletMatch[2].trim();
      const lowerName = name.toLowerCase().replace(/\s*/g, '');
      const blacklistedNames = [
        'deepanalysis', 'advice', 'symbols', 'tarotcard', 'title', 'description', 'cardtype', 'emotionscores', 'fear', 'joy', 'anxiety', 'peace',
        '분석', '조언', '해석', '꿈내용', '분석모드', '동양적해석', '서양적해석', '꿈의상징적의미', '상징적의미', '종합적해석', '종합해석', '결론', '주의사항', '요약'
      ];
      // 텍스트 헤더가 아니고 의미 있는 상징 단어만 추출하도록 필터링
      if (!blacklistedNames.includes(lowerName) && !blacklistedNames.some(b => lowerName.includes(b))) {
        symbols.push({ name, meaning });
      }
    }
  }

  // 만약 분석 내용이 아예 추출되지 않았다면, 생성된 텍스트 전체를 분석 내용으로 강제 전환
  if (!deepAnalysis) {
    const sanitized = cleanText
      .replace(/[{}\[\]"]/g, '')
      .replace(/^\s*(?:symbols|deepAnalysis|advice|tarotCard)\s*:\s*/gi, '')
      .trim();
    if (sanitized.length > 20) {
      deepAnalysis = sanitized;
    } else {
      if (language === 'en') deepAnalysis = 'Mystical energy from the universe is translating your dream frequency.';
      else if (language === 'ja') deepAnalysis = '宇宙の神秘的なエネルギーが夢の周波数を経てあなたにメッセージを伝えています。';
      else if (language === 'zh-TW') deepAnalysis = '來自宇宙的神秘能量正透過夢境的頻率向您傳達訊息。';
      else deepAnalysis = '우주의 신비로운 기운이 꿈의 장막을 통과하여 당신의 심연을 비추고 있습니다.';
    }
  }

  // 만약 조언이 없으면 분석 내용 중 마지막 문장들을 활용하거나 기본값 적용
  if (!advice) {
    const sentences = deepAnalysis.split(/[.!?]\s+/);
    if (sentences.length > 2) {
      advice = sentences.slice(-2).join('. ') + (/[.!?]$/.test(sentences.slice(-1)[0]) ? '' : '.');
      deepAnalysis = sentences.slice(0, -2).join('. ') + (/[.!?]$/.test(sentences.slice(-3)[0]) ? '' : '.');
    } else {
      if (language === 'en') advice = 'Reflect quietly on the message of the dream, taking time to clear your mind and look within.';
      else if (language === 'ja') advice = '夢が照らし出す象徴を現実の羅針盤とし、内面のストレスをケアして瞑想する浄化の時間を持ってください。';
      else if (language === 'zh-TW') advice = '將夢境映射的象徵作為現實的指南針，給自己一些時間來照料內在壓力並進行瞑想與淨化。';
      else advice = '현실 세계의 소란함에서 벗어나 깊은 평온을 묵상하는 시간을 가지시기 바랍니다.';
    }
  }

  // JSON 태그 찌꺼기 및 마크다운 볼드 기호 정제 헬퍼
  const cleanUpJsonJunk = (text: string): string => {
    return text
      .replace(/(?:symbols|keyword|name|meaning|deepAnalysis|analysis|thoughtProcess|advice|suggestion|tarotCard|title|description|desc|cardType|emotionScores|fear|joy|anxiety|peace)\s*:\s*/gi, '')
      .replace(/[{}\[\]"']/g, '') // 남아있는 괄호 및 따옴표 제거
      .replace(/\*\*/g, '')        // 마크다운 볼드표시 제거
      .replace(/,\s*,/g, ',')      // 연속된 쉼표 제거
      .replace(/^,|,$/g, '')       // 문장 처음/끝의 쉼표 제거
      .trim();
  };

  if (deepAnalysis) deepAnalysis = cleanUpJsonJunk(deepAnalysis);
  if (advice) advice = cleanUpJsonJunk(advice);

  const finalSymbols = symbols.length > 0 ? symbols : matchedSymbols.map(s => ({
    name: getLocVal(s, 'name', language),
    meaning: selectedMode === 'traditional' 
      ? getLocVal(s, 'traditional', language) 
      : getLocVal(s, 'psychological', language)
  }));

  const fearMatch = cleanText.match(/["']?fear["']?\s*:\s*(\d+)/i);
  const joyMatch = cleanText.match(/["']?joy["']?\s*:\s*(\d+)/i);
  const anxietyMatch = cleanText.match(/["']?anxiety["']?\s*:\s*(\d+)/i);
  const peaceMatch = cleanText.match(/["']?peace["']?\s*:\s*(\d+)/i);

  const fear = fearMatch ? Number(fearMatch[1]) : 25;
  const joy = joyMatch ? Number(joyMatch[1]) : 40;
  const anxiety = anxietyMatch ? Number(anxietyMatch[1]) : 30;
  const peace = peaceMatch ? Number(peaceMatch[1]) : 50;

  return {
    symbols: finalSymbols,
    deepAnalysis,
    advice,
    emotionScores: { fear, joy, anxiety, peace },
    tarotCard: {
      title: cardTitle,
      description: cardDesc,
      cardType
    }
  };
}

// 로컬 사전 기반 매칭 해몽 (온라인 AI 불통 및 사전 전용 시 작동)
function generateMockInterpretation(
  matchedSymbols: DreamSymbol[],
  selectedMode: 'traditional' | 'psychological' | 'hybrid',
  language: 'ko' | 'en' | 'ja' | 'zh-TW'
): InterpretationResult {
  const symbolsToUse = matchedSymbols.length > 0 
    ? matchedSymbols 
    : [dictionaryService.getSymbols()[Math.floor(Math.random() * dictionaryService.getSymbols().length)]];

  const symbolDetails = symbolsToUse.map(s => {
    let meaning = getLocVal(s, 'traditional', language);
    if (selectedMode === 'psychological') {
      meaning = getLocVal(s, 'psychological', language);
    } else if (selectedMode === 'hybrid') {
      if (language === 'en') {
        meaning = `[Eastern] ${s.traditionalEn || s.traditional} [Psychological] ${s.psychologicalEn || s.psychological}`;
      } else if (language === 'ja') {
        meaning = `[東洋] ${s.traditionalJa || s.traditional} [心理] ${s.psychologicalJa || s.psychological}`;
      } else if (language === 'zh-TW') {
        meaning = `[東方] ${s.traditionalZh || s.traditional} [心理] ${s.psychologicalZh || s.psychological}`;
      } else {
        meaning = `[전통] ${s.traditional} [심리] ${s.psychological}`;
      }
    }
    
    return { name: getLocVal(s, 'name', language), meaning };
  });

  let deepAnalysis = '';
  let advice = '';
  const symbolNames = symbolsToUse.map(s => getLocVal(s, 'name', language)).join(', ');

  if (language === 'en') {
    if (selectedMode === 'traditional') {
      deepAnalysis = `The primary symbol in your dream is [${symbolNames}]. According to traditional Eastern dream interpretation, this dream portends a change in the flow of your real-world fortunes. `;
      symbolsToUse.forEach(s => {
        const symbolMeaning = (s.traditionalEn || s.traditional).replace(/상징합니다\./g, '').replace(/입니다\./g, '');
        deepAnalysis += `Particularly, the symbol '${s.nameEn || s.name}' deeply carries the meaning of: ${symbolMeaning} It highlights rising fortunes or elements that require caution. `;
      });
      advice = `It is recommended to align with the traditional flow of fortune, avoid overly ambitious plans, and maintain peace of mind by following natural courses.`;
    } else if (selectedMode === 'psychological') {
      deepAnalysis = `Your subconscious is expressing your current inner emotional state through the symbol [${symbolNames}]. From a modern psychoanalytical perspective, these symbols are expressions of desires or conflicts you have repressed or recently begun to realize. `;
      symbolsToUse.forEach(s => {
        const symbolMeaning = (s.psychologicalEn || s.psychological).replace(/상징합니다\./g, '').replace(/입니다\./g, '');
        deepAnalysis += `Particularly, dreaming of '${s.nameEn || s.name}' reflects your current psychological state: ${symbolMeaning} It suggests a need to face inner anxieties or desires for growth. `;
      });
      advice = `It is wise to listen to your inner voice and take time to calmly identify and organize the sources of emotional stress or pressure you have felt recently.`;
    } else {
      deepAnalysis = `This dream contains a comprehensive message combining Eastern spiritual symbolism and Western subconscious analysis. The symbols of [${symbolNames}] in your dream are guideposts of destiny and, at the same time, portraits of your own mind. `;
      symbolsToUse.forEach(s => {
        const tradMeaning = (s.traditionalEn || s.traditional).replace(/상징합니다\./g, '').replace(/입니다\./g, '');
        const psychMeaning = (s.psychologicalEn || s.psychological).replace(/상징합니다\./g, '').replace(/입니다\./g, '');
        deepAnalysis += `For '${s.nameEn || s.name}', it traditionally represents: ${tradMeaning} while psychologically representing: ${psychMeaning} It is a process of integrating spiritual strength and psychological healing. `;
      });
      advice = `It is a time to navigate the world with a balanced perspective, encompassing both ancient wisdom and the psychological reality you face.`;
    }
  } else if (language === 'ja') {
    if (selectedMode === 'traditional') {
      deepAnalysis = `あなたの夢に登場した主要な象徴は [${symbolNames}] です。東洋伝統の夢占いによると、この夢は現実世界における運気の変化を暗示しています。`;
      symbolsToUse.forEach(s => {
        const symbolMeaning = (s.traditionalJa || s.traditional).replace(/象徴します\./g, '').replace(/です\./g, '');
        deepAnalysis += `特に「${s.nameJa || s.name}」という象徴は、${symbolMeaning}という意味を深く内包しています。全体的に運気が上昇する流れや、注意すべき要素を指し示しています。`;
      });
      advice = `伝統的な運気の流れに身を任せ、過度に野心的な計画は避け、自然の摂理に従って心を平穏に保つことをお勧めします。`;
    } else if (selectedMode === 'psychological') {
      deepAnalysis = `あなたの無意識は、[${symbolNames}] という象徴を通じて現在の内面の感情状態を表現しています。現代の精神分析学的な観点から見ると、これらの象徴は、あなたが抑圧しているか、あるいは最近自覚し始めた欲求や葛藤の表れです。`;
      symbolsToUse.forEach(s => {
        const symbolMeaning = (s.psychologicalJa || s.psychological).replace(/象徴します\./g, '').replace(/です\./g, '');
        deepAnalysis += `特に「${s.nameJa || s.name}」に関する夢は、${symbolMeaning}という現在の心理状態を反映しています。内面の不安や成長への欲求と向き合う必要があることを示しています。`;
      });
      advice = `内なる声に耳を傾け、最近感じていた精神的なストレスやプレッシャーの原因を、自ら落ち着いて整理する時間を持つことが賢明です。`;
    } else {
      deepAnalysis = `この夢は、東洋のスピリチュアルな象徴性と西洋の深い無意識の分析が結合された、総合的な暗示を含んでいます。夢の中の [${symbolNames}] という象徴は、運命の道標であると同時に、あなた自身の心の肖像画でもあります。`;
      symbolsToUse.forEach(s => {
        const tradMeaning = (s.traditionalJa || s.traditional).replace(/象徴します\./g, '').replace(/です\./g, '');
        const psychMeaning = (s.psychologicalJa || s.psychological).replace(/象徴します\./g, '').replace(/です\./g, '');
        deepAnalysis += `「${s.nameJa || s.name}」について、伝統的には ${tradMeaning} を表し、心理学的には ${psychMeaning} という状態を代弁しています。スピリチュアルな力と心理的な癒やしが統合されていくプロセスです。`;
      });
      advice = `東洋の古代の知恵と、現在直面している心理的な現実の両方を包み込み、バランスの取れた視点で人生を切り開いていく姿勢が必要な時期です。`;
    }
  } else if (language === 'zh-TW') {
    if (selectedMode === 'traditional') {
      deepAnalysis = `您的夢境中出現的主要象徵是 [${symbolNames}]。根據東方傳統解夢學，此夢暗示了您在現實世界中運勢（氣場）的變化。`;
      symbolsToUse.forEach(s => {
        const symbolMeaning = (s.traditionalZh || s.traditional).replace(/象徵著/g, '').replace(/。/g, '');
        deepAnalysis += `特別是「${s.nameZh || s.name}」這個象徵，深層內含著 ${symbolMeaning} 的意義。整體上指明了運勢上升的趨勢或需要加以提防的要素。`;
      });
      advice = `建議順應傳統運勢的流動，避免過度勉強或冒險的計劃，順其自然以保持心靈的平靜。`;
    } else if (selectedMode === 'psychological') {
      deepAnalysis = `您的潛意識正透過 [${symbolNames}] 象徵來表達您當前內心的情緒狀態。從現代精神分析學的角度來看，這些象徵代表了您所壓抑或近期開始察覺的慾望與衝突。`;
      symbolsToUse.forEach(s => {
        const symbolMeaning = (s.psychologicalZh || s.psychological).replace(/象徵著/g, '').replace(/。/g, '');
        deepAnalysis += `特別是關於「${s.nameZh || s.name}」的夢境，反映了您當前的心理狀態：${symbolMeaning}。這表明有必要去直面內心的焦慮或成長慾望。`;
      });
      advice = `傾聽內心的聲音，抽出時間冷靜地整理一下最近感受到的情緒壓力或壓迫感的來源，這是明智的做法。`;
    } else {
      deepAnalysis = `此夢包含了結合東方心靈象徵與西方潛意識分析的綜合啟示。夢中的 [${symbolNames}] 象徵既是命運的指路標，同時也是您心靈的自畫像。`;
      symbolsToUse.forEach(s => {
        const tradMeaning = (s.traditionalZh || s.traditional).replace(/象徵著/g, '').replace(/。/g, '');
        const psychMeaning = (s.psychologicalZh || s.psychological).replace(/象徵著/g, '').replace(/。/g, '');
        deepAnalysis += `對於「${s.nameZh || s.name}」，傳統上代表了 ${tradMeaning}，而心理學上則代表了 ${psychMeaning} 的狀態。這是心靈力量與心理治癒相結合的過程。`;
      });
      advice = `此時需要抱持均衡的視角，融合過去的智慧與您當前所面臨的心理現實，以沉著的態度度過人生。`;
    }
  } else {
    if (selectedMode === 'traditional') {
      deepAnalysis = `당신의 꿈속에 등장한 주요 상징은 [${symbolNames}] 입니다. 동양 전통 해몽학에 따르면, 이 꿈은 당신의 현실 세계의 운기(運氣) 변화를 암시합니다. `;
      symbolsToUse.forEach(s => {
        deepAnalysis += `특히 '${s.name}' 상징은 ${s.traditional.replace('상징합니다.', '')} 의미를 깊게 내포하고 있습니다. 전체적으로 운이 상승하는 흐름이나 주의해야 할 요소를 짚어내고 있습니다. `;
      });
      advice = `전통적인 운의 흐름에 맞춰 너무 무리한 계획은 피하고, 순리를 따르며 마음을 평온히 유지하는 것이 좋습니다.`;
    } else if (selectedMode === 'psychological') {
      deepAnalysis = `당신의 무의식은 [${symbolNames}] 상징을 통해 현재 내면의 감정 상태를 표현하고 있습니다. 현대 정신분석학적 관점에서 이 상징들은 당신이 억압하고 있거나 최근 자각하기 시작한 욕망과 갈등의 표현입니다. `;
      symbolsToUse.forEach(s => {
        deepAnalysis += `특히 '${s.name}'에 관한 꿈은 ${s.psychological.replace('상징합니다.', '')} 현재 심리적 상태를 반영합니다. 내면의 불안이나 성장 욕구를 직면할 필요가 있음을 나타냅니다. `;
      });
      advice = `내면의 목소리에 귀를 기울이고, 최근 느꼈던 감정적 스트레스나 압박의 원인을 스스로 차분하게 정리해보는 시간을 가지는 것이 현명합니다.`;
    } else {
      deepAnalysis = `이 꿈은 동양의 영성적 상징과 서양의 깊은 무의식적 분석이 결합된 종합적 암시를 담고 있습니다. 꿈속의 [${symbolNames}] 상징들은 운명의 이정표이자 동시에 당신 마음의 자화상입니다. `;
      symbolsToUse.forEach(s => {
        deepAnalysis += `'${s.name}'의 경우 전통적으로는 ${s.traditional.replace('상징합니다.', '')} 의미가 있으며, 심리학적으로는 ${s.psychological.replace('상징합니다.', '')} 상태를 대변합니다. 영적인 힘과 심리적 치유가 결합되어 가는 과정입니다. `;
      });
      advice = `과거의 지혜와 현재 당신이 마주한 심리적 현실을 모두 아우르며 균형 잡힌 시각으로 세상을 헤쳐 나가는 태도가 필요한 시점입니다.`;
    }
  }

  const fear = Math.floor(Math.random() * 40) + 10;
  const joy = Math.floor(Math.random() * 50) + 20;
  const anxiety = Math.floor(Math.random() * 40) + 15;
  const peace = Math.floor(Math.random() * 50) + 25;

  const cardsKo = [
    { title: '별 (The Star)', type: 'star', desc: '어둠 속을 비추는 희망의 빛과 영감, 정화의 에너지를 의미합니다.' },
    { title: '달 (The Moon)', type: 'moon', desc: '무의식의 영역, 깊은 감정의 동요, 때로는 보이지 않는 불안과 신비로움을 상징합니다.' },
    { title: '태양 (The Sun)', type: 'sun', desc: '명확한 자각, 생명력의 회복, 눈앞을 밝히는 강한 긍정의 힘을 의미합니다.' },
    { title: '탑 (The Tower)', type: 'tower', desc: '갑작스러운 통찰, 고정관념의 파괴, 새로운 의식의 성장을 위해 기존 벽을 깨는 힘을 상징합니다.' },
    { title: '광대 (The Fool)', type: 'fool', desc: '자유로운 영혼, 새로운 여정의 시작, 고정관념에서 벗어난 모험과 무한한 가능성을 암시합니다.' },
    { title: '연인 (The Lovers)', type: 'lovers', desc: '조화와 결합, 올바른 선택, 내면의 가치관 정립과 관계의 치유를 뜻합니다.' }
  ];

  const cardsEn = [
    { title: 'The Star', type: 'star', desc: 'Indicates hope shining in the dark, healing grace, and spiritual guidance.' },
    { title: 'The Moon', type: 'moon', desc: 'Symbolizes the realm of the unconscious, deep emotional waves, and sometimes invisible anxiety or intuition.' },
    { title: 'The Sun', type: 'sun', desc: 'Represents clear awareness, recovery of vitality, and strong positive energy.' },
    { title: 'The Tower', type: 'tower', desc: 'Indicates sudden insight, breakdown of old structures, and growth of new consciousness.' },
    { title: 'The Fool', type: 'fool', desc: 'Suggests a free spirit, the start of a new journey, and infinite potential.' },
    { title: 'The Lovers', type: 'lovers', desc: 'Represents harmony, union, alignment of values, and healing of relationships.' }
  ];

  const cardsJa = [
    { title: '星 (The Star)', type: 'star', desc: '暗闇を照らす希望の光とインスピレーション、浄化のエネルギーを意味します。' },
    { title: '月 (The Moon)', type: 'moon', desc: '無意識の領域、深い感情の動揺、時には目に見えない不安や神秘性を象徴します。' },
    { title: '太陽 (The Sun)', type: 'sun', desc: '明確な自覚、生命力の回復、目の前を照らす強い肯定の力を意味します。' },
    { title: '塔 (The Tower)', type: 'tower', desc: '突然の洞察、固定観念의破壊、新たな意識の成長のために既存の壁を壊す力を象徴します。' },
    { title: '愚者 (The Fool)', type: 'fool', desc: '自由な魂、新たな旅立ち、固定観念にとらわれない冒険と無限の可能性を暗示します。' },
    { title: '恋人 (The Lovers)', type: 'lovers', desc: '調和と結合、正しい選択、내면의 가치관의確立と関係의癒やしを意味します。' }
  ];

  const cardsZh = [
    { title: '星星 (The Star)', type: 'star', desc: '如同穿透黑暗的星光，象徵在心中悄然萌芽的希望與淨化能量。' },
    { title: '月亮 (The Moon)', type: 'moon', desc: '潛意識領域、深層情緒的波動，以及有時看不見的焦慮與神秘感。' },
    { title: '太陽 (The Sun)', type: 'sun', desc: '代表清晰的覺察、生命力的恢復，以及照亮眼前道路的強大積極力量。' },
    { title: '高塔 (The Tower)', type: 'tower', desc: '象徵突然的洞察力、打破舊有觀念，以及為了新意識成長而衝破障礙的力量。' },
    { title: '愚者 (The Fool)', type: 'fool', desc: '暗示自由的靈魂、新旅程的開始，以及擺脫刻板印象的冒險與無限可能。' },
    { title: '戀人 (The Lovers)', type: 'lovers', desc: '意指和諧與結合、正確的選擇，以及內在價值觀的確立與關係的治癒。' }
  ];

  const cards = 
    language === 'en' ? cardsEn : 
    language === 'ja' ? cardsJa : 
    language === 'zh-TW' ? cardsZh : cardsKo;
  const chosenCard = cards[Math.floor(Math.random() * cards.length)];

  return {
    symbols: symbolDetails,
    deepAnalysis,
    advice,
    emotionScores: { fear, joy, anxiety, peace },
    tarotCard: {
      title: chosenCard.title,
      description: chosenCard.desc,
      cardType: chosenCard.type
    }
  };
}

const SYSTEM_PROMPT = `
당신은 신비롭고 깊이 있는 꿈 해석 전문가이자 무의식 분석가입니다.
사용자가 입력한 꿈의 기억을 바탕으로 동양 전통 해몽과 서양 심리학적 관점을 적용해 해석 리포트를 작성해 주세요.
반드시 아래 JSON 스키마를 만족하는 유효한 JSON 형식으로만 응답해야 합니다. 추가적인 설명이나 마크다운 코드 블록 (\`\`\`json ...) 없이 오직 순수한 JSON 텍스트만 출력하세요.

JSON Schema:
{
  "symbols": [
    {
      "name": "꿈속의 핵심 상징 명사 (예: 하늘, 바다, 용 등)",
      "meaning": "해당 상징이 이 꿈의 맥락에서 나타내는 동양 전통 해몽학적 의미(길몽/흉몽 및 운기)와 서양 정신분석학적 관점(억압된 욕망, 불안, 자아 성장 등)을 결합하여 최소 2~3문장 이상의 풍부하고 상세한 풀이로 작성해 주세요. 절대로 단편적인 한 줄 요약에 그쳐서는 안 됩니다."
    }
  ],
  "deepAnalysis": "꿈의 전반적인 분위기와 흐름을 동서양 이론을 바탕으로 몽환적이고 아름답게 서술한 4~5문장 분량의 심층 분석",
  "advice": "사용자가 현실 생활에서 실천할 수 있는 영적/심리적 조언 2~3문장",
  "emotionScores": {
    "fear": 0~100 사이의 두려움/공포 점수 (숫자),
    "joy": 0~100 사이의 기쁨/희망 점수 (숫자),
    "anxiety": 0~100 사이의 불안/혼란 점수 (숫자),
    "peace": 0~100 사이의 평온/자각 점수 (숫자)
  },
  "tarotCard": {
    "title": "꿈의 메시지와 공명하는 타로 카드명 (예: 별, 달, 태양, 탑, 광대, 연인 중 하나 선택)",
    "description": "이 카드가 꿈의 주인에게 전하는 메시지 및 조언",
    "cardType": "star, moon, sun, tower, fool, lovers 중 정확히 하나 선택 (소문자)"
  }
}

*반드시 꿈 내용에서 최소 2개 이상의 의미 있는 상징들을 추출하고 각각 깊이 있게 해석해 주세요.
`;

const SYSTEM_PROMPT_EN = `
You are a mystical and deep dream interpretation expert and subconscious analyst.
Based on the dream memory entered by the user, write an interpretation report applying Eastern traditional dream interpretation and Western psychological perspectives.
You must respond ONLY in a valid JSON format that satisfies the JSON schema below. Output only pure JSON text without any additional explanation or markdown code blocks (\`\`\`json ...).

JSON Schema:
{
  "symbols": [
    {
      "name": "Core symbol noun in the dream (e.g., sky, ocean, dragon, etc.)",
      "meaning": "Provide a rich and detailed explanation of at least 2-3 sentences combining the Eastern traditional meaning (good/bad luck) and Western psychoanalytical perspective (repressed desires, anxiety, ego growth) of this symbol in the context of the dream. Never write a short one-line summary."
    }
  ],
  "deepAnalysis": "A deep, dreamlike, and beautiful analysis of the overall mood and flow of the dream based on Eastern and Western theories, in 4-5 sentences.",
  "advice": "2-3 sentences of spiritual/psychological advice that the user can practice in real life.",
  "emotionScores": {
    "fear": Fear/nightmare score between 0 and 100 (number),
    "joy": Joy/hope score between 0 and 100 (number),
    "anxiety": Anxiety/tension score between 0 and 100 (number),
    "peace": Peace/relief score between 0 and 100 (number)
  },
  "tarotCard": {
    "title": "Name of a tarot card resonating with the dream's message (choose one of: star, moon, sun, tower, fool, lovers)",
    "description": "The message and advice this card conveys to the dreamer",
    "cardType": "star, moon, sun, tower, fool, lovers exactly one of them (lowercase)"
  }
}

*Extract at least 2 meaningful symbols from the dream content and interpret each in depth. All text values in the JSON MUST be written in English.
`;

const SYSTEM_PROMPT_JA = `
あなたは神秘的で深い夢解釈の専門家であり、無意識の分析家です。
ユーザーが入力した夢の記憶に基づいて、東洋伝統の夢占いと西洋心理学的な観点を適用した解釈レポートを作成してください。
必ず以下のJSONスキーマを満たす有効なJSON形式でのみ応答してください。追加の説明やマークダウンのコードブロック（\`\`\`json ...）を含めず、純粋なJSONテキストのみを出力してください。

JSON Schema:
{
  "symbols": [
    {
      "name": "夢の中の主要な象徴名詞（例：空、海、龍など）",
      "meaning": "この象徴が夢の文脈で示す東洋伝統の夢占い的な意味（吉夢/凶夢および運気）と西洋精神分析学的な観点（抑圧された欲求、不安、自己の成長など）を結合し、少なくとも2〜3文以上の豊富で詳細な説明を作成してください。絶対に一文の単純な要約に留めてはなりません。"
    }
  ],
  "deepAnalysis": "夢の全体的な雰囲気と流れを東洋と西洋の理論に基づいて夢幻的かつ美しく記述した、4〜5文程度の深層分析",
  "advice": "ユーザーが現実生活で実践できる精神的/心理的なアドバイス2〜3文",
  "emotionScores": {
    "fear": 0〜100の間の恐怖/悪夢スコア（数値）,
    "joy": 0〜100の間の喜び/希望スコア（数値）,
    "anxiety": 0〜100の間の不安/葛藤スコア（数値）,
    "peace": 0〜100の間の平穏/回復スコア（数値）
  },
  "tarotCard": {
    "title": "夢의メッセージと共鳴するタロットカード名（星、月、太陽、塔、愚者、恋人のいずれかを選択）",
    "description": "このカードが夢の主に伝えるメッセージとアドバイス",
    "cardType": "star, moon, sun, tower, fool, lovers のいずれか一つ（正確に小文字で指定）"
  }
}

*必ず夢の内容から少なくとも2つ以上の意味のある象徴を抽出し、それぞれ深く解釈してください。JSON内のすべてのテキスト値は日本語で作成する必要があります。
`;

const SYSTEM_PROMPT_ZH = `
您是一位神秘且深邃的解夢專家與潛意識分析師。
請根據用戶輸入的夢境記憶，結合東方傳統解夢學與西方心理學視角，撰寫一份解夢報告。
請務必僅以符合以下 JSON Schema 的有效 JSON 格式進行回應。請勿輸出任何額外的解釋或 Markdown 代碼塊（如 \`\`\`json ...），只輸出純 JSON 文本。

JSON Schema:
{
  "symbols": [
    {
      "name": "夢境中的核心象徵名詞（例如：天空、海洋、龍等）",
      "meaning": "結合該象徵在此夢境語境下的東方傳統解夢學意義（吉凶與運勢氣場）與西方精神分析學視角（被壓抑的慾望、焦慮、自我成長等），撰寫至少2-3句豐富且詳細的解析。切勿僅寫下簡短的一句摘要。"
    }
  ],
  "deepAnalysis": "基於東西方理論，對夢境的整體氛圍與起伏進行夢幻且優美的深層分析，字數約4-5句。",
  "advice": "給予用戶在現實生活中可以實踐的2-3句心靈/心理建議。",
  "emotionScores": {
    "fear": 介於0到100之間的恐懼/惡夢分數（數字）,
    "joy": 介於0到100之間的喜悅/希望分數（數字）,
    "anxiety": 介於0到100之間的焦慮/衝突分數（數字）,
    "peace": 介於0到100之間的平靜/覺察分數（數字）
  },
  "tarotCard": {
    "title": "與夢境訊息產生共鳴的塔羅牌名稱（請選擇以下之一：星星、月亮、太陽、高塔、愚者、戀人）",
    "description": "這張牌傳遞給夢境主人的訊息與建議",
    "cardType": "star, moon, sun, tower, fool, lovers 中的精確一個（小寫）"
  }
}

*請務必從夢境內容中提取至少2個有意義的象徵並進行深入解析。JSON 中的所有文本值必須以繁體中文（台灣/香港習慣用語）撰寫。
`;

const createUserPrompt = (content: string, mode: 'traditional' | 'psychological' | 'hybrid') => {
  let modeDesc = '동서양 종합 해몽';
  if (mode === 'traditional') modeDesc = '동양 전통 해몽 (길몽/흉몽 및 현실 세계의 길잡이)';
  else if (mode === 'psychological') modeDesc = '서양 심리학 해석 (무의식의 억압, 자아 성찰, 프로이트/융의 관점)';
  
  return `
[분석 요청 꿈 내용]
"${content}"

[분석 모드]
${modeDesc}

위 내용을 바탕으로 신비로운 해몽 리포트를 작성해 주세요.
`;
};

const createUserPromptEn = (content: string, mode: 'traditional' | 'psychological' | 'hybrid') => {
  let modeDesc = 'Eastern and Western Comprehensive Interpretation';
  if (mode === 'traditional') modeDesc = 'Eastern Traditional Dream Interpretation';
  else if (mode === 'psychological') modeDesc = 'Western Psychological Interpretation (repressed unconsciousness, self-reflection, Freud/Jung perspectives)';
  
  return `
[Dream Content for Analysis]
"${content}"

[Analysis Mode]
${modeDesc}

Based on the above content, write a mystical dream interpretation report in English.
`;
};

const createUserPromptJa = (content: string, mode: 'traditional' | 'psychological' | 'hybrid') => {
  let modeDesc = '東洋と西洋の総合夢占い';
  if (mode === 'traditional') modeDesc = '東洋伝統の夢占い（吉夢/凶夢および現実世界への指針）';
  else if (mode === 'psychological') modeDesc = '西洋心理学解釈（無意識의抑圧, 自己省察, ユングの観点）';
  
  return `
[分析依頼の夢の内容]
"${content}"

[分析モード]
${modeDesc}

上記の内容に基づいて、神秘的な夢占いレポートを日本語で作成してください。
`;
};

const createUserPromptZh = (content: string, mode: 'traditional' | 'psychological' | 'hybrid') => {
  let modeDesc = '東西方綜合解夢';
  if (mode === 'traditional') modeDesc = '東方傳統解夢（吉凶與現實世界的指引）';
  else if (mode === 'psychological') modeDesc = '西方心理學解析（潛意識壓抑, 自我省察, 佛洛伊德/榮格視角）';
  
  return `
[請求分析的夢境內容]
"${content}"

[分析模式]
${modeDesc}

請基於上述內容，以繁體中文撰寫一份神秘的解夢報告。
`;
};

export const aiService = {
  async interpret(
    content: string,
    mode: 'traditional' | 'psychological' | 'hybrid',
    language: 'ko' | 'en' | 'ja' | 'zh-TW',
    onProgress?: (progress: number, text: string) => void
  ): Promise<InterpretationResult> {
    // 1. 단어 분석 매칭
    const matchedSymbols = dictionaryService.getSymbols().filter(symbol => {
      return content.includes(symbol.name) || (symbol.nameEn && content.toLowerCase().includes(symbol.nameEn.toLowerCase()));
    });

    const settings = storageService.getSettings();
    const engineToUse = settings.preferredEngine;

    // 1.5 Local RAG - 블로그 관련 컬럼 매칭 및 컨텍스트 로딩
    let referencedPost = null;
    let injectedContext = '';

    const matchedKeyword = blogKeywords.find(item => {
      return item.keywords.some(k => content.includes(k) || content.toLowerCase().includes(k.toLowerCase()));
    });

    if (matchedKeyword) {
      try {
        let progressText = `서고 자료 참조 중: ${matchedKeyword.postTitleKo}...`;
        if (language === 'en') progressText = `Referencing column: ${matchedKeyword.postTitleEn}...`;
        else if (language === 'ja') progressText = `書庫資料参照中: ${matchedKeyword.postTitleEn || matchedKeyword.postTitleKo}...`;
        else if (language === 'zh-TW') progressText = `正在參考書庫資料: ${matchedKeyword.postTitleEn || matchedKeyword.postTitleKo}...`;
        if (onProgress) onProgress(10, progressText);

        const res = await fetch(`/data/blog/${matchedKeyword.postId}.json`);
        if (res.ok) {
          const blogDetail = await res.json();
          let title = blogDetail.title;
          if (language === 'en') title = blogDetail.titleEn || blogDetail.title;
          else if (language === 'ja') title = blogDetail.titleJa || blogDetail.titleEn || blogDetail.title;
          else if (language === 'zh-TW') title = blogDetail.titleZh || blogDetail.titleEn || blogDetail.title;

          referencedPost = {
            id: blogDetail.id,
            title: title
          };
          
          let mythology = blogDetail.mythology;
          if (language === 'en') mythology = blogDetail.mythologyEn || blogDetail.mythology;
          else if (language === 'ja') mythology = blogDetail.mythologyJa || blogDetail.mythologyEn || blogDetail.mythology;
          else if (language === 'zh-TW') mythology = blogDetail.mythologyZh || blogDetail.mythologyEn || blogDetail.mythology;

          let psychology = blogDetail.psychology;
          if (language === 'en') psychology = blogDetail.psychologyEn || blogDetail.psychology;
          else if (language === 'ja') psychology = blogDetail.psychologyJa || blogDetail.psychologyEn || blogDetail.psychology;
          else if (language === 'zh-TW') psychology = blogDetail.psychologyZh || blogDetail.psychologyEn || blogDetail.psychology;

          const getSectionTitle = (s: any) => {
            if (language === 'en') return s.titleEn || s.title;
            if (language === 'ja') return s.titleJa || s.titleEn || s.title;
            if (language === 'zh-TW') return s.titleZh || s.titleEn || s.title;
            return s.title;
          };
          const getSectionContent = (s: any) => {
            if (language === 'en') return s.contentEn || s.content;
            if (language === 'ja') return s.contentJa || s.contentEn || s.content;
            if (language === 'zh-TW') return s.contentZh || s.contentEn || s.content;
            return s.content;
          };

          let contextHeader = `[참조 꿈해몽 전문 가이드라인 (Reference Blog Column)]`;
          if (language === 'en') {
            contextHeader = `[Reference Blog Column]`;
          } else if (language === 'ja') {
            contextHeader = `[参照コラムのガイドライン (Reference Blog Column)]`;
          } else if (language === 'zh-TW') {
            contextHeader = `[參考解夢專欄指南 (Reference Blog Column)]`;
          }

          injectedContext = `
${contextHeader}
- Title: ${title}
- Symbolic Meaning: ${mythology}
- Scenarios:
${blogDetail.sections.map((s: any) => `  * ${getSectionTitle(s)}: ${getSectionContent(s)}`).join('\n')}
- Psychological Background: ${psychology}
`;
        }
      } catch (err) {
        console.warn('Failed to fetch blog context for RAG:', err);
      }
    }

    // 만약 mock-demo가 선택되었으면 즉시 사전 해몽 반환
    if (engineToUse === 'mock-demo') {
      if (onProgress) {
        let msg30 = '무의식의 영적 주파수를 튜닝하는 중...';
        let msg70 = '성좌의 상징 사전을 탐색하는 중...';
        let msg100 = '의식의 포털 연결 성공!';
        if (language === 'en') {
          msg30 = 'Tuning the spiritual frequency of subconscious...';
          msg70 = 'Searching the constellations dream dictionary...';
          msg100 = 'Connection to consciousness portal successful!';
        } else if (language === 'ja') {
          msg30 = '無意識の霊的周波数をチューニング中...';
          msg70 = '星座の象徴辞書を探索中...';
          msg100 = '意識のポータル接続成功！';
        } else if (language === 'zh-TW') {
          msg30 = '正在調諧潛意識的靈性頻率...';
          msg70 = '正在檢索星座象徵辭典...';
          msg100 = '意識傳送門連線成功！';
        }
        onProgress(30, msg30);
        await new Promise(r => setTimeout(r, 600));
        onProgress(70, msg70);
        await new Promise(r => setTimeout(r, 600));
        onProgress(100, msg100);
      }
      const mockResult = generateMockInterpretation(matchedSymbols, mode, language);
      return { ...mockResult, referencedPost };
    }

    // AI 엔진 구동 시작
    try {
      let rawResponse = '';
      let userPrompt = createUserPrompt(content, mode);
      if (language === 'en') userPrompt = createUserPromptEn(content, mode);
      else if (language === 'ja') userPrompt = createUserPromptJa(content, mode);
      else if (language === 'zh-TW') userPrompt = createUserPromptZh(content, mode);
      
      // RAG 컨텍스트가 있으면 프롬프트 끝에 주입
      if (injectedContext) {
        let contextPromptText = `\n\n*중요: 위 [참조 꿈해몽 전문 가이드라인]의 해몽 원리 및 신화/심리학적 맥락을 바탕으로 하여 사용자의 꿈 내용을 맞춤형으로 심층 해석해 주세요.`;
        if (language === 'en') {
          contextPromptText = `\n\n*IMPORTANT: Based on the principles, mythological, and psychological context in the [Reference Blog Column] above, provide a customized, deep analysis of the user's dream.`;
        } else if (language === 'ja') {
          contextPromptText = `\n\n*重要: 上記の [参照コラムのガイドライン] の解釈原則と神話的/心理学的文脈に基づいて、ユーザーの夢の内容をカスタマイズして深く解釈してください。`;
        } else if (language === 'zh-TW') {
          contextPromptText = `\n\n*重要：請根據上述 [參考解夢專欄指南] 中的解夢原理、神話與心理學背景，為用戶的夢境內容進行量身打造的深層解析。`;
        }
        userPrompt += `\n\n${injectedContext}\n\n${contextPromptText}`;
      }
      
      let sysPrompt = SYSTEM_PROMPT;
      if (language === 'en') sysPrompt = SYSTEM_PROMPT_EN;
      else if (language === 'ja') sysPrompt = SYSTEM_PROMPT_JA;
      else if (language === 'zh-TW') sysPrompt = SYSTEM_PROMPT_ZH;

      if (engineToUse === 'chrome-nano') {
        let msg20 = 'Chrome 내장 AI에 주파수 연결 중...';
        if (language === 'en') msg20 = 'Connecting frequency to Chrome AI...';
        else if (language === 'ja') msg20 = 'Chrome内蔵AIに周波数を接続中...';
        else if (language === 'zh-TW') msg20 = '正在連線至 Chrome 內建 AI 的頻率...';
        if (onProgress) onProgress(20, msg20);
        rawResponse = await chromeAIService.prompt(sysPrompt, userPrompt, onProgress);
      } else if (engineToUse === 'qwen-local') {
        let msg20 = '로컬 AI 모델(Qwen) 세션 초기화 중...';
        if (language === 'en') msg20 = 'Initializing local AI (Qwen) session...';
        else if (language === 'ja') msg20 = 'ローカルAIモデル(Qwen)セッションを初期化中...';
        else if (language === 'zh-TW') msg20 = '正在初始化本地 AI 模型 (Qwen) 工作階段...';
        if (onProgress) onProgress(20, msg20);
        if (!qwenAIService.isLoaded()) {
          await qwenAIService.initEngine((percent, text) => {
            if (onProgress) onProgress(percent, text);
          });
        }
        rawResponse = await qwenAIService.prompt(sysPrompt, userPrompt, onProgress);
      } else {
        throw new Error('선택된 유효한 AI 엔진이 없습니다.');
      }

      let msg95 = '해석 데이터 결정화 중...';
      if (language === 'en') msg95 = 'Crystallizing interpretation data...';
      else if (language === 'ja') msg95 = '解釈データを結晶化中...';
      else if (language === 'zh-TW') msg95 = '正在結晶化解析數據...';
      if (onProgress) onProgress(95, msg95);

      const parsed = parseAIResponse(rawResponse, matchedSymbols, mode, language);

      let msg100 = '포털 해독 완료!';
      if (language === 'en') msg100 = 'Portal decoded successfully!';
      else if (language === 'ja') msg100 = 'ポータルの解読完了！';
      else if (language === 'zh-TW') msg100 = '傳送門解碼完成！';
      if (onProgress) onProgress(100, msg100);

      return { ...parsed, referencedPost };

    } catch (e: any) {
      console.warn('AI 해석 실패, 사전 해몽으로 백업 작동:', e);
      if (onProgress) {
        let msg80 = `[경고] AI 해석 실패 (${e.message || e}). 성좌의 사전으로 해몽을 우회 중...`;
        if (language === 'en') msg80 = `[Warning] AI interpretation failed. Accessing dream dictionary...`;
        else if (language === 'ja') msg80 = `[警告] AI解釈失敗 (${e.message || e})。星座の辞書で夢占いを迂回中...`;
        else if (language === 'zh-TW') msg80 = `[警告] AI 解析失敗 (${e.message || e})。正在透過星座辭典繞道解夢...`;
        onProgress(80, msg80);
        await new Promise(r => setTimeout(r, 1200));
      }
      const mockResult = generateMockInterpretation(matchedSymbols, mode, language);
      return { ...mockResult, referencedPost };
    }
  },

  async chat(
    history: { sender: 'user' | 'ai'; text: string }[],
    newMessage: string,
    initialDream: string,
    initialResult: InterpretationResult,
    language: 'ko' | 'en' | 'ja' | 'zh-TW',
    onProgress?: (progress: number, text: string) => void
  ): Promise<string> {
    const settings = storageService.getSettings();
    const engineToUse = settings.preferredEngine;

    const CHAT_SYSTEM_PROMPT = `
당신은 신비롭고 깊이 있는 꿈 해석 전문가이자 무의식 분석가입니다.
사용자가 이전에 입력한 꿈 내용과 이에 대한 해몽 분석 결과를 바탕으로, 사용자의 추가 질문에 답해주는 대화형 멘토 역할을 해 주세요.
사용자의 질문에 대해 따뜻하고, 몽환적이며, 통찰력 있는 어조로 답변해 주세요. 전문적인 심리학 용어나 전통 해몽의 지혜를 필요할 때 곁들여 대답해 주세요.
`;

    const CHAT_SYSTEM_PROMPT_EN = `
You are a mystical and deep dream interpretation expert and subconscious analyst.
Based on the dream content and interpretation results previously entered by the user, act as an interactive mentor answering their follow-up questions.
Please reply in a warm, dreamlike, and insightful tone in English. Incorporate professional psychological terminology or Eastern traditional wisdom when appropriate.
`;

    const CHAT_SYSTEM_PROMPT_JA = `
あなたは神秘的で深い夢解釈の専門家であり、無意識の分析家です。
ユーザーが以前に入力した夢の内容とそれに対する夢占いの分析結果に基づいて、ユーザーの追加の質問に答える対話型のメンターの役割を果たしてください。
ユーザーの質問に対して、温かく、夢幻的で、洞察力のあるトーンで日本語で回答してください。必要なときには、専門的な心理学用語や伝統的な夢占いの知恵を交えて答えてください。
`;

    const CHAT_SYSTEM_PROMPT_ZH = `
您是一位神秘且深邃的解夢專家與潛意識分析師。
請根據用戶先前輸入的夢境內容與解夢分析結果，扮演互動式導師角色，解答用戶的進一步提問。
請以溫暖、夢幻且富有洞察力的語氣，用繁體中文（台灣/香港習慣用語）回答用戶的提問。在合適的時候，可以融入專業的心理學術語或東方傳統解夢智慧。
`;

    const userPromptKo = `
[분석 대상 꿈 내용]
"${initialDream}"

[이전 해몽 분석 결과]
- 심층 분석: ${initialResult.deepAnalysis}
- 현실 조언: ${initialResult.advice}
- 추출된 상징: ${initialResult.symbols.map(s => `${s.name} (${s.meaning})`).join(', ')}

[대화 기록]
${history.map(msg => `${msg.sender === 'user' ? '사용자' : 'AI'}: ${msg.text}`).join('\n')}
사용자: ${newMessage}

위 대화 기록과 꿈 내용을 바탕으로, 사용자의 마지막 질문에 대해 친절하고 깊이 있는 꿈해몽 조언을 해주세요.
`;

    const userPromptEn = `
[Dream Content for Analysis]
"${initialDream}"

[Previous Interpretation Results]
- Deep Analysis: ${initialResult.deepAnalysis}
- Practical Advice: ${initialResult.advice}
- Extracted Symbols: ${initialResult.symbols.map(s => `${s.name} (${s.meaning})`).join(', ')}

[Conversation History]
${history.map(msg => `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.text}`).join('\n')}
User: ${newMessage}

Based on the above conversation history and dream content, please provide a kind and detailed dream interpretation response in English to the user's last message.
`;

    const userPromptJa = `
[分析対象の夢の内容]
"${initialDream}"

[以前の夢占い分析結果]
- Deep Analysis: ${initialResult.deepAnalysis}
- Practical Advice: ${initialResult.advice}
- Extracted Symbols: ${initialResult.symbols.map(s => `${s.name} (${s.meaning})`).join(', ')}

[対話履歴]
${history.map(msg => `${msg.sender === 'user' ? 'ユーザー' : 'AI'}: ${msg.text}`).join('\n')}
ユーザー: ${newMessage}

対話履歴と夢の内容に基づいて、ユーザーの最後の質問に対して、日本語で親切かつ深い夢占いのア드バイス를 해주세요.
`;

    const userPromptZh = `
[分析對象夢境內容]
"${initialDream}"

[先前的解夢分析結果]
- 深層分析：${initialResult.deepAnalysis}
- 現實建議：${initialResult.advice}
- 提取出的象徵：${initialResult.symbols.map(s => `${s.name} (${s.meaning})`).join(', ')}

[對話記錄]
${history.map(msg => `${msg.sender === 'user' ? '用戶' : 'AI'}：${msg.text}`).join('\n')}
用戶：${newMessage}

請根據上述對話記錄與夢境內容，以繁體中文對用戶的最後一個提問給予親切且深度的解夢建議。
`;

    if (engineToUse === 'mock-demo') {
      if (onProgress) {
        let msg30 = '무의식의 에너지를 공명하는 중...';
        let msg100 = '대화 연결 완료';
        if (language === 'en') {
          msg30 = 'Resonating subconscious energies...';
          msg100 = 'Conversation channel established';
        } else if (language === 'ja') {
          msg30 = '無意識のエネルギーを共鳴中...';
          msg100 = '対話接続完了';
        } else if (language === 'zh-TW') {
          msg30 = '正在共鳴潛意識能量...';
          msg100 = '對話連線完成';
        }
        onProgress(30, msg30);
        await new Promise(r => setTimeout(r, 450));
        onProgress(100, msg100);
      }
      if (language === 'en') {
        if (newMessage.toLowerCase().includes('tarot') || newMessage.toLowerCase().includes('card')) {
          return 'The tarot card presented in your dream serves as a guidepost pointing to your inner self. Its message is no coincidence, indicating your psychological readiness and conviction regarding your current paths.';
        }
        return `The keyword "${newMessage}" you raised is creating mystical ripples beneath the surface of your subconscious. This symbol likely reflects a hidden potential or a repressed desire that you are now beginning to acknowledge in reality.`;
      } else if (language === 'ja') {
        if (newMessage.includes('タロット') || newMessage.includes('カード')) {
          return '夢の中に提示されたタロットカードは、あなたの心が指し示す道標です。このカードが伝えるメッセージは単なる偶然ではなく、現在悩んでいる選択に対する内的な確信を示しています。';
        }
        return `あなたが投げかけた「${newMessage}」という質問は、無意識の水面下で非常に神秘的な波動を起こしています。この象徴は、現実であなたが気づかなかった潜在能力の表現である可能性がありますので、自分自身の声にさらに集中してみることをお勧めします。`;
      } else if (language === 'zh-TW') {
        if (newMessage.includes('塔羅') || newMessage.includes('卡')) {
          return '夢境中呈現的塔羅牌是您心靈所指引的指路針。這張牌所傳遞的訊息絕非偶然，它代表了您對當前選擇的內在確信與心理準備。';
        }
        return `您提出的「${newMessage}」問題正在潛意識的水面下引起非常神秘的漣漪。這個象徵可能反映了您在現實中尚未察覺的潛在能力或壓抑的慾望，建議您多傾聽自己內心的聲音。`;
      } else {
        if (newMessage.includes('타로') || newMessage.includes('카드')) {
          return '꿈속에 제시된 타로 카드는 당신의 마음이 가리키는 이정표입니다. 이 카드가 전하는 메시지는 단순히 우연이 아니며, 현재 고민하고 있는 선택에 대한 내적인 확신을 나타냅니다.';
        }
        if (newMessage.includes('돼지') || newMessage.includes('여인') || newMessage.includes('화성')) {
          return `꿈에 등장한 돼지나 우주는 고대의 지혜와 현대적 갈망의 교차점이나 결합체입니다. 특히 '${newMessage}'에 대한 물음은 당신이 가보지 않은 미지의 영역에서 번영을 창조하고자 하는 심리적 열망을 드러내고 있습니다.`;
        }
        return `당신이 던진 '${newMessage}'라는 질문은 무의식의 수면 아래에서 매우 신비로운 파동을 일으키고 있습니다. 이 상징은 현실에서 당신이 깨닫지 못했던 잠재력의 표현일 수 있으니, 스스로의 목소리에 더 집중해 보시기를 권장합니다.`;
      }
    }

    try {
      let rawResponse = '';
      let userPrompt = userPromptKo;
      if (language === 'en') userPrompt = userPromptEn;
      else if (language === 'ja') userPrompt = userPromptJa;
      else if (language === 'zh-TW') userPrompt = userPromptZh;

      let sysPrompt = CHAT_SYSTEM_PROMPT;
      if (language === 'en') sysPrompt = CHAT_SYSTEM_PROMPT_EN;
      else if (language === 'ja') sysPrompt = CHAT_SYSTEM_PROMPT_JA;
      else if (language === 'zh-TW') sysPrompt = CHAT_SYSTEM_PROMPT_ZH;

      if (engineToUse === 'chrome-nano') {
        let msg20 = 'Chrome 내장 AI에 주파수 연결 중...';
        if (language === 'en') msg20 = 'Connecting frequency to Chrome AI...';
        else if (language === 'ja') msg20 = 'Chrome内蔵AIに周波数を接続中...';
        else if (language === 'zh-TW') msg20 = '正在連線至 Chrome 內建 AI 的頻率...';
        if (onProgress) onProgress(20, msg20);
        rawResponse = await chromeAIService.prompt(sysPrompt, userPrompt, onProgress);
      } else if (engineToUse === 'qwen-local') {
        let msg20 = '로컬 AI 모델(Qwen) 세션 확인 중...';
        if (language === 'en') msg20 = 'Checking local AI (Qwen) session...';
        else if (language === 'ja') msg20 = 'ローカルAIモデル(Qwen)セッションを確認中...';
        else if (language === 'zh-TW') msg20 = '正在確認本地 AI 模型 (Qwen) 工作階段...';
        if (onProgress) onProgress(20, msg20);
        if (!qwenAIService.isLoaded()) {
          await qwenAIService.initEngine((percent, text) => {
            if (onProgress) onProgress(percent, text);
          });
        }
        rawResponse = await qwenAIService.prompt(sysPrompt, userPrompt, onProgress);
      } else {
        throw new Error('선택된 AI 엔진이 없습니다.');
      }

      // Clean up response from formatting markers
      return rawResponse
        .replace(/(?:thoughtProcess|thought|response)\s*:\s*/gi, '')
        .replace(/[{}\[\]"']/g, '')
        .trim();
    } catch (e: any) {
      console.warn('AI 대화 실패, 백업 답변 사용:', e);
      if (language === 'en') {
        return `The portal connection faded while conversing with your subconscious. However, your query '${newMessage}' serves as a key to unlock your inner potential.`;
      } else if (language === 'ja') {
        return `無意識との対話中にポータル接続が途切れました。しかし、あなたの質問「${newMessage}」は内なる潜在能力を開く鍵となるでしょう。`;
      } else if (language === 'zh-TW') {
        return `在與潛意識對話時傳送門連線中斷了。然而，您的提問「${newMessage}」將作為開啟內在潛能的鑰匙。`;
      } else {
        return `대화를 이어가던 중 에테르 AI 채널이 일시적으로 중단되었습니다. 하지만 당신의 질문 '${newMessage}'는 내면의 무의식을 열어주는 열쇠로 작용할 것입니다.`;
      }
    }
  }
};