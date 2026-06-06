export interface GameStats {
  highScore: number;
  totalPlayed: number;
  bestTime: number | null;
  bestMoves: number | null;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  stats: {
    easy: GameStats;
    medium: GameStats;
    hard: GameStats;
  };
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/auth';
const TOKEN_KEY = 'sudoku_dash_token';

const getHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // Store token in local storage
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // Retrieve token
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Clear session
  logout() {
    localStorage.removeItem(TOKEN_KEY);
  },

  // Check if token exists
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // Log in with Google token
  async loginWithGoogle(idToken: string): Promise<UserProfile> {
    try {
      const response = await fetch(`${API_BASE_URL}/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });

      if (!response.ok) {
        const error = await response.json();
        const details = error.error ? `: ${error.error}` : '';
        throw new Error(`${error.message || 'Google Login failed'}${details}`);
      }

      const data = await response.json();
      this.setToken(data.token);
      return data.user;
    } catch (err: any) {
      if (err.name === 'TypeError' || err.message.includes('Failed to fetch')) {
        throw new Error(`Connection failed: Backend server is unreachable at ${API_BASE_URL}. Ensure server is running and CORS is enabled.`);
      }
      throw err;
    }
  },

  // Log in with Apple credentials (Mock/native payload)
  async loginWithApple(appleData: { appleId: string; email: string; displayName?: string; identityToken?: string }): Promise<UserProfile> {
    try {
      const response = await fetch(`${API_BASE_URL}/apple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appleData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Apple Login failed');
      }

      const data = await response.json();
      this.setToken(data.token);
      return data.user;
    } catch (err: any) {
      if (err.name === 'TypeError' || err.message.includes('Failed to fetch')) {
        throw new Error(`Connection failed: Backend server is unreachable at ${API_BASE_URL}.`);
      }
      throw err;
    }
  },

  // Fetch current profile stats
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          this.logout(); // clean expired session
        }
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch profile');
      }

      return await response.json();
    } catch (err: any) {
      if (err.name === 'TypeError' || err.message.includes('Failed to fetch')) {
        throw new Error(`Connection failed: Backend server is unreachable at ${API_BASE_URL}.`);
      }
      throw err;
    }
  },

  // Sync game stats on win
  async saveStats(difficulty: 'easy' | 'medium' | 'hard', score: number, time: number, moves: number): Promise<Record<string, GameStats>> {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/stats`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ difficulty, score, time, moves })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save stats');
      }

      const data = await response.json();
      return data.stats;
    } catch (err: any) {
      if (err.name === 'TypeError' || err.message.includes('Failed to fetch')) {
        throw new Error(`Connection failed: Backend server is unreachable at ${API_BASE_URL}.`);
      }
      throw err;
    }
  }
};
