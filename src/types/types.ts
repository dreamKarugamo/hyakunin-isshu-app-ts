export interface Poem {
  id: number;
  text: string;
  historicalKana: string;
  modernKana: string;
  reading: string;
  author: string;
  translation: string;
}

export type AppState = 'idle' | 'roulette' | 'countdown' | 'playing';