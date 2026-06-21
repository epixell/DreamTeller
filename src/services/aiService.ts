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

// AI 응답을 안전하게 파싱하는 헬퍼 함수
function parseAIResponse(rawText: string, matchedSymbols: DreamSymbol[], selectedMode: string, language: string): InterpretationResult {
  const cleanText = rawText.trim();
  const isEn = language === 'en';
  
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
                name: isEn ? (s.nameEn || s.name) : s.name,
                meaning: selectedMode === 'traditional' 
                  ? (isEn ? (s.traditionalEn || s.traditional) : s.traditional) 
                  : (isEn ? (s.psychologicalEn || s.psychological) : s.psychological)
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
            title: parsed.tarotCard?.title || (isEn ? 'Glimmering Milky Way' : '운명의 은하수'),
            description: parsed.tarotCard?.description || (isEn ? 'Mystical fragments of your dream have aligned.' : '신비로운 꿈의 조각들이 정렬되었습니다.'),
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
        deepAnalysis = isEn 
          ? 'Mystical energy from the universe is translating your dream frequency. Please explore the symbol tab for details.'
          : '무의식의 우주적 에너지가 꿈의 주파수를 거쳐 당신에게 메세지를 전하고 있습니다. 상징 사전 탭을 통해 더 세세한 암시를 해독해 보세요.';
      }
    }
    
    if (!advice) {
      advice = isEn
        ? 'Reflect quietly on the message of the dream, taking time to clear your mind and look within.'
        : '꿈이 비추는 상징을 현실의 나침반 삼아, 내면의 스트레스를 돌보고 명상하는 정화의 시간을 가지시기 바랍니다.';
    }

    // 타로 카드 자동 공명 매칭
    let cardTitle = isEn ? 'The Star' : '별 (The Star)';
    let cardDesc = isEn ? 'Indicates hope shining in the dark, healing grace, and spiritual guidance.' : '어둠 속을 비추는 희망의 빛과 영감, 정화의 에너지를 의미합니다.';
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

    const cardKeywords = isEn ? cardKeywordsEn : cardKeywordsKo;

    for (const ck of cardKeywords) {
      if (ck.keys.some(k => cleanText.toLowerCase().includes(k))) {
        cardTitle = ck.title;
        cardDesc = ck.desc;
        cardType = ck.type;
        break;
      }
    }

    const fear = cleanText.includes('공포') || cleanText.includes('불안') || cleanText.toLowerCase().includes('fear') ? 55 : Math.floor(Math.random() * 25) + 15;
    const joy = cleanText.includes('기쁨') || cleanText.includes('행운') || cleanText.toLowerCase().includes('joy') ? 65 : Math.floor(Math.random() * 30) + 25;
    const anxiety = cleanText.includes('갈등') || cleanText.includes('스트레스') || cleanText.toLowerCase().includes('anxiety') ? 60 : Math.floor(Math.random() * 25) + 15;
    const peace = cleanText.includes('평온') || cleanText.includes('성찰') || cleanText.toLowerCase().includes('peace') ? 70 : Math.floor(Math.random() * 30) + 30;

    return {
      symbols: symbols.length > 0 ? symbols : matchedSymbols.map(s => ({
        name: isEn ? (s.nameEn || s.name) : s.name,
        meaning: selectedMode === 'traditional' 
          ? (isEn ? (s.traditionalEn || s.traditional) : s.traditional) 
          : (isEn ? (s.psychologicalEn || s.psychological) : s.psychological)
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
  
  const cardTitle = extractField(['title'], cleanText) || '별 (The Star)';
  const cardDesc = extractField(['description', 'desc'], cleanText) || '어둠을 헤치는 별빛처럼, 마음속에 조용히 싹트는 희망이 있습니다.';
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
      deepAnalysis = '우주의 신비로운 기운이 꿈의 장막을 통과하여 당신의 심연을 비추고 있습니다.';
    }
  }

  // 만약 조언이 없으면 분석 내용 중 마지막 문장들을 활용하거나 기본값 적용
  if (!advice) {
    const sentences = deepAnalysis.split(/[.!?]\s+/);
    if (sentences.length > 2) {
      advice = sentences.slice(-2).join('. ') + (/[.!?]$/.test(sentences.slice(-1)[0]) ? '' : '.');
      deepAnalysis = sentences.slice(0, -2).join('. ') + (/[.!?]$/.test(sentences.slice(-3)[0]) ? '' : '.');
    } else {
      advice = '현실 세계의 소란함에서 벗어나 깊은 평온을 묵상하는 시간을 가지시기 바랍니다.';
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
    name: s.name,
    meaning: selectedMode === 'traditional' ? s.traditional : s.psychological
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
  language: 'ko' | 'en'
): InterpretationResult {
  const isEn = language === 'en';
  const symbolsToUse = matchedSymbols.length > 0 
    ? matchedSymbols 
    : [dictionaryService.getSymbols()[Math.floor(Math.random() * dictionaryService.getSymbols().length)]];

  const symbolDetails = symbolsToUse.map(s => {
    let meaning = isEn ? (s.traditionalEn || s.traditional) : s.traditional;
    if (selectedMode === 'psychological') {
      meaning = isEn ? (s.psychologicalEn || s.psychological) : s.psychological;
    } else if (selectedMode === 'hybrid') {
      meaning = isEn 
        ? `[Eastern] ${s.traditionalEn || s.traditional} [Psychological] ${s.psychologicalEn || s.psychological}`
        : `[전통] ${s.traditional} [심리] ${s.psychological}`;
    }
    
    return { name: isEn ? (s.nameEn || s.name) : s.name, meaning };
  });

  let deepAnalysis = '';
  let advice = '';
  const symbolNames = symbolsToUse.map(s => isEn ? (s.nameEn || s.name) : s.name).join(', ');

  if (isEn) {
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

  const cards = isEn ? cardsEn : cardsKo;
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

export const aiService = {
  async interpret(
    content: string,
    mode: 'traditional' | 'psychological' | 'hybrid',
    language: 'ko' | 'en',
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
        if (onProgress) {
          onProgress(10, language === 'en' ? `Referencing column: ${matchedKeyword.postTitleEn}...` : `서고 자료 참조 중: ${matchedKeyword.postTitleKo}...`);
        }
        const res = await fetch(`/data/blog/${matchedKeyword.postId}.json`);
        if (res.ok) {
          const blogDetail = await res.json();
          referencedPost = {
            id: blogDetail.id,
            title: language === 'en' ? blogDetail.titleEn : blogDetail.title
          };
          
          injectedContext = `
[참조 꿈해몽 전문 가이드라인 (Reference Blog Column)]
- 제목 (Title): ${language === 'en' ? blogDetail.titleEn : blogDetail.title}
- 신화/상징 의미 (Symbolic Meaning): ${language === 'en' ? blogDetail.mythologyEn : blogDetail.mythology}
- 대표적인 상황별 해석 (Scenarios):
${blogDetail.sections.map((s: any) => `  * ${language === 'en' ? s.titleEn : s.title}: ${language === 'en' ? s.contentEn : s.content}`).join('\n')}
- 심리학적 배경 (Psychological Background): ${language === 'en' ? blogDetail.psychologyEn : blogDetail.psychology}
`;
        }
      } catch (err) {
        console.warn('Failed to fetch blog context for RAG:', err);
      }
    }

    // 만약 mock-demo가 선택되었으면 즉시 사전 해몽 반환
    if (engineToUse === 'mock-demo') {
      if (onProgress) {
        onProgress(30, language === 'en' ? 'Tuning the spiritual frequency of subconscious...' : '무의식의 영적 주파수를 튜닝하는 중...');
        await new Promise(r => setTimeout(r, 600));
        onProgress(70, language === 'en' ? 'Searching the constellations dream dictionary...' : '성좌의 상징 사전을 탐색하는 중...');
        await new Promise(r => setTimeout(r, 600));
        onProgress(100, language === 'en' ? 'Connection to consciousness portal successful!' : '의식의 포털 연결 성공!');
      }
      const mockResult = generateMockInterpretation(matchedSymbols, mode, language);
      return { ...mockResult, referencedPost };
    }

    // AI 엔진 구동 시작
    try {
      let rawResponse = '';
      let userPrompt = language === 'en' ? createUserPromptEn(content, mode) : createUserPrompt(content, mode);
      
      // RAG 컨텍스트가 있으면 프롬프트 끝에 주입
      if (injectedContext) {
        userPrompt += `\n\n${injectedContext}\n\n*중요: 위 [참조 꿈해몽 전문 가이드라인]의 해몽 원리 및 신화/심리학적 맥락을 바탕으로 하여 사용자의 꿈 내용을 맞춤형으로 심층 해석해 주세요.`;
      }
      
      const sysPrompt = language === 'en' ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT;

      if (engineToUse === 'chrome-nano') {
        if (onProgress) onProgress(20, language === 'en' ? 'Connecting frequency to Chrome AI...' : 'Chrome 내장 AI에 주파수 연결 중...');
        rawResponse = await chromeAIService.prompt(sysPrompt, userPrompt, onProgress);
      } else if (engineToUse === 'qwen-local') {
        if (onProgress) onProgress(20, language === 'en' ? 'Initializing local AI (Qwen) session...' : '로컬 AI 모델(Qwen) 세션 초기화 중...');
        if (!qwenAIService.isLoaded()) {
          await qwenAIService.initEngine((percent, text) => {
            if (onProgress) onProgress(percent, text);
          });
        }
        rawResponse = await qwenAIService.prompt(sysPrompt, userPrompt, onProgress);
      } else {
        throw new Error('선택된 유효한 AI 엔진이 없습니다.');
      }

      if (onProgress) onProgress(95, language === 'en' ? 'Crystallizing interpretation data...' : '해석 데이터 결정화 중...');
      const parsed = parseAIResponse(rawResponse, matchedSymbols, mode, language);
      if (onProgress) onProgress(100, language === 'en' ? 'Portal decoded successfully!' : '포털 해독 완료!');
      return { ...parsed, referencedPost };

    } catch (e: any) {
      console.warn('AI 해석 실패, 사전 해몽으로 백업 작동:', e);
      if (onProgress) {
        onProgress(80, language === 'en' ? `[Warning] AI interpretation failed. Accessing dream dictionary...` : `[경고] AI 해석 실패 (${e.message || e}). 성좌의 사전으로 해몽을 우회 중...`);
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
    language: 'ko' | 'en',
    onProgress?: (progress: number, text: string) => void
  ): Promise<string> {
    const settings = storageService.getSettings();
    const engineToUse = settings.preferredEngine;
    const isEn = language === 'en';

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

    const userPrompt = isEn ? userPromptEn : userPromptKo;
    const sysPrompt = isEn ? CHAT_SYSTEM_PROMPT_EN : CHAT_SYSTEM_PROMPT;

    if (engineToUse === 'mock-demo') {
      if (onProgress) {
        onProgress(30, isEn ? 'Resonating subconscious energies...' : '무의식의 에너지를 공명하는 중...');
        await new Promise(r => setTimeout(r, 450));
        onProgress(100, isEn ? 'Conversation channel established' : '대화 연결 완료');
      }
      if (isEn) {
        if (newMessage.toLowerCase().includes('tarot') || newMessage.toLowerCase().includes('card')) {
          return 'The tarot card presented in your dream serves as a guidepost pointing to your inner self. Its message is no coincidence, indicating your psychological readiness and conviction regarding your current paths.';
        }
        return `The keyword "${newMessage}" you raised is creating mystical ripples beneath the surface of your subconscious. This symbol likely reflects a hidden potential or a repressed desire that you are now beginning to acknowledge in reality.`;
      } else {
        if (newMessage.includes('타로') || newMessage.includes('카드')) {
          return '꿈속에 제시된 타로 카드는 당신의 마음이 가리키는 이정표입니다. 이 카드가 전하는 메시지는 단순히 우연이 아니며, 현재 고민하고 있는 선택에 대한 내적인 확신을 나타냅니다.';
        }
        if (newMessage.includes('돼지') || newMessage.includes('여인') || newMessage.includes('화성')) {
          return `꿈에 등장한 돼지나 우주는 고대의 지혜와 현대적 갈망의 교차점입니다. 특히 '${newMessage}'에 대한 물음은 당신이 가보지 않은 미지의 영역에서 번영을 창조하고자 하는 심리적 열망을 드러내고 있습니다.`;
        }
        return `당신이 던진 '${newMessage}'라는 질문은 무의식의 수면 아래에서 매우 신비로운 파동을 일으키고 있습니다. 이 상징은 현실에서 당신이 깨닫지 못했던 잠재력의 표현일 수 있으니, 스스로의 목소리에 더 집중해 보시기를 권장합니다.`;
      }
    }

    try {
      let rawResponse = '';

      if (engineToUse === 'chrome-nano') {
        if (onProgress) onProgress(20, isEn ? 'Connecting frequency to Chrome AI...' : 'Chrome 내장 AI에 주파수 연결 중...');
        rawResponse = await chromeAIService.prompt(sysPrompt, userPrompt, onProgress);
      } else if (engineToUse === 'qwen-local') {
        if (onProgress) onProgress(20, isEn ? 'Checking local AI (Qwen) session...' : '로컬 AI 모델(Qwen) 세션 확인 중...');
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
      return isEn 
        ? `The portal connection faded while conversing with your subconscious. However, your query '${newMessage}' serves as a key to unlock your inner potential.`
        : `대화를 이어가던 중 에테르 AI 채널이 일시적으로 중단되었습니다. 하지만 당신의 질문 '${newMessage}'는 내면의 무의식을 열어주는 열쇠로 작용할 것입니다.`;
    }
  }
};