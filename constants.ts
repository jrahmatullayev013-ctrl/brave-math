import { Question } from './types';

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'm1',
    category: 'Arifmetika',
    text: "Agar 5 ta mushuk 5 ta sichqonni 5 daqiqada tutsa, 100 ta mushuk 100 ta sichqonni necha daqiqada tutadi?",
    answer: "5",
    explanation: "Har bir mushuk bitta sichqonni tutishi uchun 5 daqiqa sarflaydi. Shuning uchun 100 ta mushuk 100 ta sichqonni barobariga 5 daqiqada tutadi.",
    difficulty: 'o\'rta'
  },
  {
    id: 'm2',
    category: 'Mantiq',
    text: "Savatda 5 ta olma bor. Ularni 5 ta bolaga shunday bo'lib beringki, har bir bolaga bittadan olma tegsin va bitta olma savatda qolsin.",
    answer: "Savat bilan",
    explanation: "Oxirgi bolaga olmani savat bilan birga berish kerak.",
    difficulty: 'oson'
  }
];
