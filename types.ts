export enum Language {
  KINYARWANDA = 'Kinyarwanda',
  SWAHILI = 'Swahili',
  FRENCH = 'French',
  ENGLISH = 'English',
}

export interface MedicationAnalysis {
  medicineName: string;
  purpose: string;
  dosage: string;
  frequency: string;
  warnings: string[];
  storage: string;
  isAntibiotic: boolean;
}

export interface ProcessingState {
  status: 'idle' | 'analyzing' | 'synthesizing' | 'complete' | 'error';
  message?: string;
}