// WebLLM Qwen2.5-0.5B-Instruct On-Device AI Service

let engine: any = null;
const MODEL_ID = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC';

export const qwenAIService = {
  // WebGPU 지원 여부 체크
  async isWebGPUSupported(): Promise<boolean> {
    // @ts-ignore
    if (!navigator.gpu) {
      return false;
    }
    try {
      // @ts-ignore
      const adapter = await navigator.gpu.requestAdapter();
      return !!adapter;
    } catch (e) {
      return false;
    }
  },

  // 모델 로딩 및 초기화 (진행률 콜백 제공)
  async initEngine(onProgress: (progress: number, text: string) => void): Promise<void> {
    if (engine) return; // 이미 초기화됨

    const isSupported = await this.isWebGPUSupported();
    if (!isSupported) {
      throw new Error('이 브라우저/기기는 WebGPU를 지원하지 않습니다. 크롬 내장 AI 혹은 데모 모드를 사용해 주세요.');
    }

    try {
      onProgress(0, 'AI 라이브러리 로딩 중...');
      
      // CDN을 통한 WebLLM 동적 로딩 (빌드 최적화 및 WASM 설정 트러블 방지)
      // @ts-ignore
      const webLLM = await import('https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.84/+esm');
      
      onProgress(5, 'AI 엔진 초기화 및 모델 다운로드 대기 중...');

      // 로딩 진행 상황을 받아오는 콜백
      const initProgressCallback = (report: any) => {
        // report.progress는 0.0 ~ 1.0 사이의 실수
        const percent = Math.round((report.progress || 0) * 100);
        onProgress(percent, report.text || '모델 파일을 가져오는 중...');
      };

      engine = await webLLM.CreateMLCEngine(MODEL_ID, {
        initProgressCallback: initProgressCallback,
      });

      onProgress(100, '로컬 AI 로딩 완료!');
    } catch (e: any) {
      console.error('Failed to initialize WebLLM engine', e);
      engine = null;
      throw new Error(`로컬 AI 구동 실패: ${e.message || e}`);
    }
  },

  // 텍스트 생성 질의 실행
  async prompt(systemPrompt: string, userPrompt: string, onProgress?: (progress: number, text: string) => void): Promise<string> {
    if (!engine) {
      throw new Error('Qwen AI 엔진이 초기화되지 않았습니다.');
    }
    try {
      if (onProgress) onProgress(90, '무의식의 에테르 분석 중...');
      const response = await engine.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });
      return response.choices[0].message.content || '';
    } catch (e: any) {
      console.error('Qwen AI 실행 오류', e);
      throw new Error(`Qwen AI 실행 중 오류 발생: ${e.message || e}`);
    }
  },

  // 엔진 해제 (메모리 관리용)
  async unloadEngine(): Promise<void> {
    if (engine) {
      await engine.unload();
      engine = null;
    }
  },

  // 엔진 로드 상태 확인
  isLoaded(): boolean {
    return engine !== null;
  }
};