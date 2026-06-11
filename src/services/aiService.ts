import { chromeAIService } from './chromeAIService';
import { qwenAIService } from './qwenAIService';
import { dictionaryService } from './dictionaryService';
import type { DreamSymbol } from './dictionaryService';
import { storageService } from './storageService';

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
}

// AI 응답을 안전하게 파싱하는 헬퍼 함수
function parseAIResponse(rawText: string, matchedSymbols: DreamSymbol[], selectedMode: string): InterpretationResult {
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
                name: s.name,
                meaning: selectedMode === 'traditional' ? s.traditional : s.psychological
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
            title: parsed.tarotCard?.title || '운명의 은하수',
            description: parsed.tarotCard?.description || '신비로운 꿈의 조각들이 정렬되었습니다.',
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
function generateMockInterpretation(matchedSymbols: DreamSymbol[], selectedMode: 'traditional' | 'psychological' | 'hybrid'): InterpretationResult {
  const symbolsToUse = matchedSymbols.length > 0 
    ? matchedSymbols 
    : [dictionaryService.getSymbols()[Math.floor(Math.random() * dictionaryService.getSymbols().length)]];

  const symbolDetails = symbolsToUse.map(s => {
    let meaning = s.traditional;
    if (selectedMode === 'psychological') meaning = s.psychological;
    else if (selectedMode === 'hybrid') meaning = `[전통] ${s.traditional} [심리] ${s.psychological}`;
    
    return { name: s.name, meaning };
  });

  let deepAnalysis = '';
  let advice = '';
  const symbolNames = symbolsToUse.map(s => s.name).join(', ');

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

  const fear = Math.floor(Math.random() * 40) + 10;
  const joy = Math.floor(Math.random() * 50) + 20;
  const anxiety = Math.floor(Math.random() * 40) + 15;
  const peace = Math.floor(Math.random() * 50) + 25;

  const cards = [
    { title: '별 (The Star)', type: 'star', desc: '어둠 속을 비추는 희망의 빛과 영감, 정화의 에너지를 의미합니다.' },
    { title: '달 (The Moon)', type: 'moon', desc: '무의식의 영역, 깊은 감정의 동요, 때로는 보이지 않는 불안과 신비로움을 상징합니다.' },
    { title: '태양 (The Sun)', type: 'sun', desc: '명확한 자각, 생명력의 회복, 눈앞을 밝히는 강한 긍정의 힘을 의미합니다.' },
    { title: '탑 (The Tower)', type: 'tower', desc: '갑작스러운 통찰, 고정관념의 파괴, 새로운 의식의 성장을 위해 기존 벽을 깨는 힘을 상징합니다.' },
    { title: '광대 (The Fool)', type: 'fool', desc: '자유로운 영혼, 새로운 여정의 시작, 고정관념에서 벗어난 모험과 무한한 가능성을 암시합니다.' },
    { title: '연인 (The Lovers)', type: 'lovers', desc: '조화와 결합, 올바른 선택, 내면의 가치관 정립과 관계의 치유를 뜻합니다.' }
  ];
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



export const aiService = {
  async interpret(
    content: string,
    mode: 'traditional' | 'psychological' | 'hybrid',
    onProgress?: (progress: number, text: string) => void
  ): Promise<InterpretationResult> {
    // 1. 단어 분석 매칭
    const matchedSymbols = dictionaryService.getSymbols().filter(symbol => {
      return content.includes(symbol.name);
    });

    const settings = storageService.getSettings();
    const engineToUse = settings.preferredEngine;

    // 만약 mock-demo가 선택되었으면 즉시 사전 해몽 반환
    if (engineToUse === 'mock-demo') {
      if (onProgress) {
        onProgress(30, '무의식의 영적 주파수를 튜닝하는 중...');
        await new Promise(r => setTimeout(r, 600));
        onProgress(70, '성좌의 상징 사전을 탐색하는 중...');
        await new Promise(r => setTimeout(r, 600));
        onProgress(100, '의식의 포털 연결 성공!');
      }
      return generateMockInterpretation(matchedSymbols, mode);
    }

    // AI 엔진 구동 시작
    try {
      let rawResponse = '';
      const userPrompt = createUserPrompt(content, mode);

      if (engineToUse === 'chrome-nano') {
        if (onProgress) onProgress(20, 'Chrome 내장 AI에 주파수 연결 중...');
        rawResponse = await chromeAIService.prompt(SYSTEM_PROMPT, userPrompt, onProgress);
      } else if (engineToUse === 'qwen-local') {
        if (onProgress) onProgress(20, '로컬 AI 모델(Qwen) 세션 초기화 중...');
        // 만약 이미 모델이 올라와 있으면 다운로드 단계를 건너뛰고 바로 실행
        if (!qwenAIService.isLoaded()) {
          await qwenAIService.initEngine((percent, text) => {
            if (onProgress) onProgress(percent, text);
          });
        }
        rawResponse = await qwenAIService.prompt(SYSTEM_PROMPT, userPrompt, onProgress);

      } else {
        throw new Error('선택된 유효한 AI 엔진이 없습니다.');
      }

      if (onProgress) onProgress(95, '해석 데이터 결정화 중...');
      const parsed = parseAIResponse(rawResponse, matchedSymbols, mode);
      if (onProgress) onProgress(100, '포털 해독 완료!');
      return parsed;

    } catch (e: any) {
      console.warn('AI 해석 실패, 사전 해몽으로 백업 작동:', e);
      if (onProgress) {
        onProgress(80, `[경고] AI 해석 실패 (${e.message || e}). 성좌의 사전으로 해몽을 우회 중...`);
        await new Promise(r => setTimeout(r, 1200));
      }
      return generateMockInterpretation(matchedSymbols, mode);
    }
  }
};