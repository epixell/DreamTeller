// Chrome Built-in AI (Gemini Nano) Detector and Wrapper
// Supports both the modern global LanguageModel spec (Chrome 149+) and legacy window.ai spec

export const chromeAIService = {
  // Chrome 내장 AI 사용 가능 여부 진단
  async isAvailable(): Promise<{ available: boolean; reason?: 'no' | 'after-download' | 'not-chrome' }> {
    // 1. 브라우저가 크롬 및 크로미움 계열(Edge 등)인지 검사
    const isChrome = /Chrome|Chromium|Edg/.test(navigator.userAgent);
    if (!isChrome) {
      return { available: false, reason: 'not-chrome' };
    }

    try {
      // A. 최신 규격인 글로벌 LanguageModel 검사 (Chrome 149+)
      // @ts-ignore
      const lmGlobal = (window as any).LanguageModel || (globalThis as any).LanguageModel;
      if (lmGlobal) {
        let availability = 'no';
        if (typeof lmGlobal.availability === 'function') {
          availability = await lmGlobal.availability();
        } else if (typeof lmGlobal.capabilities === 'function') {
          const caps = await lmGlobal.capabilities();
          availability = caps?.available || 'no';
        }
        
        if (availability === 'no') {
          return { available: false, reason: 'no' };
        } else if (availability === 'after-download' || availability === 'downloading') {
          return { available: true, reason: 'after-download' };
        }
        return { available: true };
      }

      // B. 레거시 규격인 window.ai 검사 (하위 호환성)
      // @ts-ignore
      const aiObj = window.ai || (window as any).ai;
      if (!aiObj) {
        return { available: false, reason: 'no' };
      }

      // @ts-ignore
      const languageModel = aiObj.languageModel || aiObj.assistant;
      if (!languageModel) {
        return { available: false, reason: 'no' };
      }

      const capabilities = await languageModel.capabilities();
      if (!capabilities) {
        return { available: false, reason: 'no' };
      }

      if (capabilities.available === 'no') {
        return { available: false, reason: 'no' };
      } else if (capabilities.available === 'after-download') {
        return { available: true, reason: 'after-download' };
      }

      return { available: true };
    } catch (e) {
      console.error('Error checking Chrome AI capabilities', e);
      return { available: false, reason: 'no' };
    }
  },

  // 현재 모델 상태 직접 가져오기
  async getAvailability(): Promise<string> {
    try {
      // A. 최신 규격인 글로벌 LanguageModel 검사
      // @ts-ignore
      const lmGlobal = (window as any).LanguageModel || (globalThis as any).LanguageModel;
      if (lmGlobal) {
        if (typeof lmGlobal.availability === 'function') {
          return await lmGlobal.availability();
        } else if (typeof lmGlobal.capabilities === 'function') {
          const caps = await lmGlobal.capabilities();
          return caps?.available || 'no';
        }
      }

      // B. 레거시 규격 검사
      // @ts-ignore
      const aiObj = window.ai || (window as any).ai;
      if (!aiObj) return 'no';
      // @ts-ignore
      const languageModel = aiObj.languageModel || aiObj.assistant;
      if (!languageModel) return 'no';
      const capabilities = await languageModel.capabilities();
      return capabilities?.available || 'no';
    } catch {
      return 'no';
    }
  },

  // 크롬 내장 AI에 프롬프트 전송
  async prompt(systemPrompt: string, userPrompt: string, onProgress?: (progress: number, text: string) => void): Promise<string> {
    try {
      // @ts-ignore
      const lmGlobal = (window as any).LanguageModel || (globalThis as any).LanguageModel;
      let session;

      if (lmGlobal) {
        // 최신 규격으로 세션 생성
        try {
          session = await lmGlobal.create({
            systemPrompt: systemPrompt,
            monitor(m: any) {
              m.addEventListener("downloadprogress", (e: any) => {
                if (onProgress && e.total > 0) {
                  const percent = Math.round((e.loaded / e.total) * 100);
                  onProgress(percent, `크롬 내장 AI 모델 다운로드 중... (${percent}%)`);
                }
              });
            }
          });
        } catch (createErr) {
          console.warn('Failed to create session with monitor, retrying without monitor', createErr);
          session = await lmGlobal.create({
            systemPrompt: systemPrompt
          });
        }
      } else {
        // 레거시 규격으로 세션 생성
        // @ts-ignore
        const aiObj = window.ai || (window as any).ai;
        if (!aiObj) {
          throw new Error('Chrome 내장 AI API를 찾을 수 없습니다. 플래그 설정을 확인해 주세요.');
        }

        // @ts-ignore
        const languageModel = aiObj.languageModel || aiObj.assistant;
        if (!languageModel) {
          throw new Error('지원되는 Chrome AI API 버전을 찾을 수 없습니다.');
        }

        try {
          session = await languageModel.create({
            systemPrompt: systemPrompt,
            monitor(m: any) {
              m.addEventListener("downloadprogress", (e: any) => {
                if (onProgress && e.total > 0) {
                  const percent = Math.round((e.loaded / e.total) * 100);
                  onProgress(percent, `크롬 내장 AI 모델 다운로드 중... (${percent}%)`);
                }
              });
            }
          });
        } catch (createErr) {
          console.warn('Failed to create session with monitor, retrying without monitor', createErr);
          session = await languageModel.create({
            systemPrompt: systemPrompt
          });
        }
      }

      if (onProgress) onProgress(90, '무의식의 우주 분석 중...');
      const response = await session.prompt(userPrompt);
      session.destroy();
      return response;
    } catch (e: any) {
      console.error('Chrome AI execution error', e);
      throw new Error(`Chrome 내장 AI 실행 중 오류 발생: ${e.message || e}`);
    }
  }
};
