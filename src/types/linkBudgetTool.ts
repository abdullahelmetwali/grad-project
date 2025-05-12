export interface LinkBudgetQuestionSimple {
  question: string;
  options: { [key: string]: number };
  type: "simple";
}

export interface LinkBudgetQuestionStaged {
  question: string;
  type: "staged";
  Stage1: { [key: string]: string }; // Option text to Stage1 value key
  Stage2: { [key: string]: string }; // Option text to Stage2 value key
  mapping: { [key: string]: number }; // Combined key (e.g., "Stage1Value_Stage2Value") to numeric value
}

export type LinkBudgetQuestion = LinkBudgetQuestionSimple | LinkBudgetQuestionStaged;

export interface LinkBudgetAnswer {
  questionIndex: number;
  selectedValue: number | string; // Can be numeric value or stage key
  stage1SelectedValue?: string;
}

export interface LinkBudgetToolState {
  questions: LinkBudgetQuestion[];
  currentQuestionIndex: number;
  currentStageSelection: "Stage1" | "Stage2" | null; // For staged questions
  stage1SelectedKey: string | null; // Stores the key like "Stage1_A"
  pathLoss: number;
  answers: LinkBudgetAnswer[];
  finalPathLoss: number | null;
  radiusR: number | null;
  selectedSiteType: "Sector Site" | "Omni site" | null;
  numberOfSites: number | null;
  calculationStarted: boolean;
  showFinalCalculations: boolean; // To control display of noise figure, radius, site type etc.
}

