export interface Question {
  id: string;
  category: string;
  text: string;
  answer: string;
  explanation: string;
  difficulty: 'oson' | 'o\'rta' | 'qiyin';
}

export interface UserStats {
  score: number;
  level: number;
  completedIds: string[];
}
