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
  
  // 1. JSON 형식 추출 시도
  try {
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.deepAnalysis && parsed.advice && parsed.emotionScores && parsed.tarotCard) {
        return {
          symbols: parsed.symbols || matchedSymbols.map(s => ({
            name: s.name,
            meaning: selectedMode === 'traditional' ? s.traditional : s.psychological
          })),
          deepAnalysis: parsed.deepAnalysis,
          advice: parsed.advice,
          emotionScores: {
            fear: Number(parsed.emotionScores.fear ?? 20),
            joy: Number(parsed.emotionScores.joy ?? 20),
            anxiety: Number(parsed.emotionScores.anxiety ?? 20),
            peace: Number(parsed.emotionScores.peace ?? 20)
          },
          tarotCard: {
            title: parsed.tarotCard.title || '운명의 은하수',
            description: parsed.tarotCard.description || '신비로운 꿈의 조각들이 정렬되었습니다.',
            cardType: parsed.tarotCard.cardType || 'star'
          }
        };
      }
    }
  } catch (e) {
    console.warn('JSON parsing failed, falling back to regex parser', e);
  }

  // 2. 파싱 실패 시 정규식 기반 대체 파서 작동
  console.log('Using regex fallback parser for AI response');
  const getField = (regex: RegExp, fallback: string): string => {
    const match = cleanText.match(regex);
    return match ? match[1].trim() : fallback;
  };

  const deepAnalysis = getField(/"deepAnalysis"\s*:\s*"([^"]+)"/, '우주의 신비로운 기운이 꿈의 장막을 통과하여 당신의 심연을 비추고 있습니다.');
  const advice = getField(/"advice"\s*:\s*"([^"]+)"/, '현실 세계의 소란함에서 벗어나 깊은 평온을 묵상하는 시간을 가지시기 바랍니다.');
  const cardTitle = getField(/"title"\s*:\s*"([^"]+)"/, '별 (The Star)');
  const cardDesc = getField(/"description"\s*:\s*"([^"]+)"/, '어둠을 헤치는 별빛처럼, 마음속에 조용히 싹트는 희망이 있습니다.');
  const cardType = getField(/"cardType"\s*:\s*"([^"]+)"/, 'star');

  return {
    symbols: matchedSymbols.map(s => ({
      name: s.name,
      meaning: selectedMode === 'traditional' ? s.traditional : s.psychological
    })),
    deepAnalysis,
    advice,
    emotionScores: {
      fear: 25,
      joy: 40,
      anxiety: 30,
      peace: 50
    },
    tarotCard: {
      title: cardTitle,
      description: cardDesc,
      cardType: ['star', 'moon', 'sun', 'tower', 'fool', 'lovers'].includes(cardType) ? cardType : 'star'
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
      "name": "꿈속의 핵심 상징 이름 (예: 바다, 호랑이 등)",
      "meaning": "해당 상징이 이 꿈에서 의미하는 전통적/심리학적 상세 설명"
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