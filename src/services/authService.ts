// Local Authentication and User Session Management Service

export interface UserAccount {
  username: string;
  createdAt: string;
  dreamCount?: number;
}

const USERS_KEY = 'dreamteller_users';
const SESSION_KEY = 'dreamteller_current_user';

// 단순 암호화를 위한 인코딩 헬퍼 (평문 저장 방지)
const encodePassword = (password: string): string => {
  try {
    return btoa(password);
  } catch (e) {
    return password;
  }
};

export const authService = {
  // 회원가입
  register(username: string, password: string): { success: boolean; error?: string } {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || !password) {
      return { success: false, error: '사용자 이름과 비밀번호를 모두 입력해 주세요.' };
    }

    if (cleanUsername.length < 2) {
      return { success: false, error: '사용자 이름은 최소 2자 이상이어야 합니다.' };
    }

    const users = this._getUsersMap();
    if (users[cleanUsername]) {
      return { success: false, error: '이미 존재하는 사용자 이름입니다.' };
    }

    users[cleanUsername] = {
      passwordHash: encodePassword(password),
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { success: true };
  },

  // 로그인
  login(username: string, password: string): { success: boolean; error?: string } {
    const cleanUsername = username.trim().toLowerCase();
    const users = this._getUsersMap();

    const user = users[cleanUsername];
    if (!user || user.passwordHash !== encodePassword(password)) {
      return { success: false, error: '아이디 또는 비밀번호가 일치하지 않습니다.' };
    }

    sessionStorage.setItem(SESSION_KEY, cleanUsername);
    return { success: true };
  },

  // 로그아웃
  logout(): void {
    sessionStorage.removeItem(SESSION_KEY);
  },

  // 현재 로그인한 사용자 가져오기
  getCurrentUser(): string | null {
    return sessionStorage.getItem(SESSION_KEY);
  },

  // 관리자용 유저 목록 조회
  getUsersList(): UserAccount[] {
    const users = this._getUsersMap();
    return Object.keys(users).map(username => {
      // 해당 유저의 작성 꿈 개수 카운트
      const historyKey = `dreamteller_history_${username}`;
      const historyData = localStorage.getItem(historyKey);
      let dreamCount = 0;
      if (historyData) {
        try {
          dreamCount = JSON.parse(historyData).length;
        } catch (e) {}
      }

      return {
        username,
        createdAt: users[username].createdAt,
        dreamCount
      };
    });
  },

  // 관리자용 유저 강제 탈퇴(삭제)
  deleteUser(username: string): void {
    const cleanUsername = username.trim().toLowerCase();
    const users = this._getUsersMap();
    if (users[cleanUsername]) {
      delete users[cleanUsername];
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      // 해당 유저의 데이터 삭제
      localStorage.removeItem(`dreamteller_history_${cleanUsername}`);
      
      // 만약 방금 삭제한 사용자가 현재 세션 로그인 유저라면 로그아웃 처리
      if (this.getCurrentUser() === cleanUsername) {
        this.logout();
      }
    }
  },

  // 내부 헬퍼: LocalStorage 유저 맵 파싱
  _getUsersMap(): Record<string, { passwordHash: string; createdAt: string }> {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) return {};
    try {
      return JSON.parse(data);
    } catch (e) {
      return {};
    }
  }
};
