import { dictionaryService } from './dictionaryService';
import type { DreamSymbol } from './dictionaryService';

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

// --- 로컬 모드 해몽 알고리즘 ---
function generateMockInterpretation(content: string, matchedSymbols: DreamSymbol[], selectedMode: 'traditional' | 'psychological' | 'hybrid'): InterpretationResult {
  const symbolsToUse = matchedSymbols.length > 0 
    ? matchedSymbols 
    : [dictionaryService.getSymbols()[Math.floor(Math.random() * dictionaryService.getSymbols().length)]];

  const symbolDetails = symbolsToUse.map(s => {
    let meaning = s.traditional;
    if (selectedMode === 'psychological') meaning = s.psychological;
    else if (selectedMode === 'hybrid') meaning = `[전통] ${s.traditional} [심리] ${s.psychological}`;
    
    return { name: s.name, meaning };
  });

  // 꿈 분석 본문 생성
  let deepAnalysis = '';
  let advice = '';
  let cardType = 'star';
  let cardTitle = '별 (The Star)';
  let cardDesc = '어두운 밤하늘을 비추는 희망의 빛입니다.';

  const symbolNames = symbolsToUse.map(s => s.name).join(', ');

  if (selectedMode === 'traditional') {
    deepAnalysis = `당신의 꿈속에 등장한 주요 상징은 [${symbolNames}] 입니다. 동양 전통 해몽학에 따르면, 이 꿈은 당신의 현실 세계의 운기(運氣) 변화를 암시합니다. `;
    symbolsToUse.forEach(s => {
      deepAnalysis += `특히 '${s.name}' 상징은 ${s.traditional.replace('상징합니다.', '')} 의미를 깊게 내포하고 있습니다. 전체적으로 운이 상승하는 흐름이나 주의해야 할 요소를 짚어내고 있습니다. `;
    });
    advice = `전통적인 운의 흐름에 따라 마음을 차분히 하시고, 행운의 기운을 맞이할 준비를 하세요. 매사에 긍정적인 행동이 귀인을 부를 것입니다.`;
    
    // 타로 카드 결정
    if (content.includes('물') || content.includes('돈') || content.includes('돼지')) {
      cardType = 'sun';
      cardTitle = '태양 (The Sun)';
      cardDesc = '물질적 풍요와 생명력이 가득 차오르는 길몽의 기운입니다.';
    } else if (content.includes('이빨') || content.includes('떨어')) {
      cardType = 'tower';
      cardTitle = '탑 (The Tower)';
      cardDesc = '급격한 변화나 경고에 대비하여 내실을 다져야 하는 시기입니다.';
    } else {
      cardType = 'moon';
      cardTitle = '달 (The Moon)';
      cardDesc = '보이지 않는 마음의 흐름을 응시하는 성찰의 카드입니다.';
    }
  } else if (selectedMode === 'psychological') {
    deepAnalysis = `정신분석학적 시각으로 볼 때, 당신의 꿈에 나타난 [${symbolNames}]은(는) 의식 세계에서 억압되거나 간과한 감정의 덩어리입니다. `;
    symbolsToUse.forEach(s => {
      deepAnalysis += `'${s.name}'의 무의식적 메커니즘은 ${s.psychological.replace('나타냅니다.', '')} 뜻으로, 자아가 내면에 보내는 메시지입니다. `;
    });
    deepAnalysis += `현재 당신의 정신적 에너지는 외적인 문제보다 내면의 갈등을 해결하고자 집중되어 있습니다.`;
    advice = `꿈속 불안이나 흥분을 억누르지 말고, 현실에서 자신을 힘들게 하는 무의식의 원인이 무엇인지 고요히 마주해보세요.`;
    cardType = 'fool';
    cardTitle = '광대 (The Fool)';
    cardDesc = '마음의 짐을 벗어던지고 새로운 나로 출발할 수 있는 잠재력의 카드입니다.';
  } else {
    // 하이브리드
    deepAnalysis = `이 꿈은 동양의 민속적 암시와 서양의 내면 심리가 흥미롭게 융합된 상태입니다. [${symbolNames}] 상징을 통해 분석해 보면, `;
    symbolsToUse.forEach(s => {
      deepAnalysis += `외적으로는 ${s.name}의 기운이 ${s.traditional.substring(0, 30)}...와 같이 작용하고 있으나, 내면 심리적으로는 ${s.psychological.substring(0, 30)}...와 같은 갈등 혹은 열망을 반영합니다. `;
    });
    advice = `길운을 믿는 마음의 여유를 가짐과 동시에, 현실의 내면 스트레스를 다스리는 심리적 조절이 병행되어야 최상의 상태를 유지할 수 있습니다.`;
    cardType = 'lovers';
    cardTitle = '연인 (The Lovers)';
    cardDesc = '외적 행운과 내적 평화가 아름다운 조화를 이뤄내는 균형의 상징입니다.';
  }

  // 감정 분석 설정
  let fear = 15, joy = 20, anxiety = 20, peace = 25;
  if (content.includes('물')) { peace += 30; joy += 10; }
  if (content.includes('불')) { joy += 30; anxiety += 15; }
  if (content.includes('돼지')) { joy += 50; }
  if (content.includes('이빨')) { anxiety += 40; fear += 20; }
  if (content.includes('날다') || content.includes('하늘')) { joy += 30; peace += 30; }
  if (content.includes('뱀')) { anxiety += 25; fear += 15; }
  if (content.includes('떨어')) { anxiety += 45; fear += 15; }
  if (content.includes('쫓')) { fear += 40; anxiety += 30; }
  
  const sum = fear + joy + anxiety + peace;
  const emotionScores = {
    fear: Math.round((fear / sum) * 100),
    joy: Math.round((joy / sum) * 100),
    anxiety: Math.round((anxiety / sum) * 100),
    peace: Math.round((peace / sum) * 100)
  };

  return {
    symbols: symbolDetails,
    deepAnalysis,
    advice,
    emotionScores,
    tarotCard: { title: cardTitle, description: cardDesc, cardType }
  };
}

// --- 메인 AI 서비스 컨트롤러 ---
export const aiService = {
  // 사용자의 꿈 내용에서 상징 단어들을 자동 추출
  extractSymbols(content: string): DreamSymbol[] {
    const symbols = dictionaryService.getSymbols();
    return symbols.filter(s => content.includes(s.name));
  },

  async interpret(
    content: string,
    mode: 'traditional' | 'psychological' | 'hybrid',
    onProgress?: (progress: number, text: string) => void
  ): Promise<InterpretationResult> {
    
    // 1. 매칭되는 상징 추출
    const matchedSymbols = this.extractSymbols(content);
    
    if (onProgress) {
      onProgress(30, '꿈의 잔상 스캔 중...');
      await new Promise(r => setTimeout(r, 450));
      onProgress(70, '별자리에 따른 꿈 해석 매칭 중...');
      await new Promise(r => setTimeout(r, 450));
      onProgress(100, '해석 완료!');
    }

    return generateMockInterpretation(content, matchedSymbols, mode);
  }
};
