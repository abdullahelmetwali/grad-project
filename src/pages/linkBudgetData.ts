interface LinkBudgetQuestion {
  question: string;
  type: "simple" | "staged";
  options?: Record<string, number>;
  Stage1?: Record<string, string>;
  Stage2?: Record<string, string>;
  mapping?: Record<string, number>;
}

export const linkBudgetQuestionsData: LinkBudgetQuestion[] = [
  // Question 1
  {
    question: "gNodeB transmit power (dBm)",
    type: "simple",
    options: { "64T64R AAU": 53, "32T32R AAU": 53, "16T16R AAU": 53, "8T8R RRU": 53.8, "4T4R": 34 },
  },
  // Question 2
  {
    question: "gNodeB antenna gain (dBi)",
    type: "simple",
    options: { "64T64R AAU": 10, "32T32R AAU": 12, "16T16R AAU": 15, "8T8R RRU": 16, "4T4R": 28 },
  },
  // Question 3
  {
    question: "gNodeB cable loss (dB)",
    type: "simple",
    options: { "64T64R AAU": 0, "32T32R AAU": 0, "16T16R AAU": 0, "8T8R RRU": 0.5, "4T4R": 0 },
  },
  // Question 4
  {
    question: "Demodulation threshold SINR (dB) - Code Rate",
    type: "simple",
    options: {
      "0.076": -6.7, "0.12": -4.7, "0.19": -2.3, "0.3": 0.2, "0.44": 2.4,
      "0.59": 4.3, "0.37": 5.9, "0.48": 8.1, "0.6": 10.3, "0.45": 11.7,
      "0.55": 14.1, "0.65": 16.3, "0.75": 18.7, "0.85": 21, "0.93": 22.7,
    },
  },
  // Question 5 - Staged
  {
    question: "Penetration loss (dB)",
    type: "staged",
    Stage1: { "0.8 GHz": "S1_A", "1.8 GHz": "S1_B", "2.1 GHz": "S1_C", "2.6 GHz": "S1_D", "3.5 GHz": "S1_E", "4.5 GHz": "S1_F" },
    Stage2: { "Dense urban": "S2_X", "Urban": "S2_Y", "Suburban": "S2_Z", "Rural": "S2_W" },
    mapping: {
      "S1_A_S2_X": 18, "S1_A_S2_Y": 14, "S1_A_S2_Z": 10, "S1_A_S2_W": 7,
      "S1_B_S2_X": 21, "S1_B_S2_Y": 17, "S1_B_S2_Z": 13, "S1_B_S2_W": 10,
      "S1_C_S2_X": 22, "S1_C_S2_Y": 18, "S1_C_S2_Z": 14, "S1_C_S2_W": 11,
      "S1_D_S2_X": 23, "S1_D_S2_Y": 19, "S1_D_S2_Z": 15, "S1_D_S2_W": 12,
      "S1_E_S2_X": 26, "S1_E_S2_Y": 22, "S1_E_S2_Z": 18, "S1_E_S2_W": 15,
      "S1_F_S2_X": 28, "S1_F_S2_Y": 24, "S1_F_S2_Z": 20, "S1_F_S2_W": 17,
    },
  },
  // Question 6 - Staged
  {
    question: "Foliage loss (dB)",
    type: "staged",
    Stage1: { "3.5 GHz": "S1_1", "28 GHz": "S1_2" },
    Stage2: { "Sparse tree": "S2_A", "Dense tree": "S2_B", "2 tree": "S2_C", "3 tree": "S2_D", "Typical foliage loss": "S2_E" },
    mapping: {
      "S1_1_S2_A": 7.5, "S1_1_S2_B": 8.5, "S1_1_S2_C": 11, "S1_1_S2_D": 19.5, "S1_1_S2_E": 11,
      "S1_2_S2_A": 8, "S1_2_S2_B": 15, "S1_2_S2_C": 19, "S1_2_S2_D": 24, "S1_2_S2_E": 17,
    },
  },
  // Question 7 - Staged
  {
    question: "Body block loss (dB)",
    type: "staged",
    Stage1: { "3.5 GHz": "S1_1", "28 GHz": "S1_2" },
    Stage2: { "Body loss": "S2_A", "Typical Body loss": "S2_B" },
    mapping: {
      "S1_1_S2_A": 4, "S1_1_S2_B": 3,
      "S1_2_S2_A": 20, "S1_2_S2_B": 15,
    },
  },
  // Question 8 - Staged
  {
    question: "Interference margin (dB)",
    type: "staged",
    Stage1: { "3.5 GHz": "S1_1", "28 GHz": "S1_2" },
    Stage2: { "Typical interference margin DL": "S2_A", "Typical interference margin UL": "S2_B" },
    mapping: {
      "S1_1_S2_A": 6, "S1_1_S2_B": 2,
      "S1_2_S2_A": 1, "S1_2_S2_B": 0.5,
    },
  },
  // Question 9 - Staged
  {
    question: "Rain/Ice margin (dB)",
    type: "staged",
    Stage1: { "3.5 GHz": "S1_1", "28 GHz": "S1_2" },
    Stage2: { "Typical Rain/Ice Attenuation Margin": "S2_A" },
    mapping: {
      "S1_1_S2_A": 0,
      "S1_2_S2_A": 3,
    },
  },
  // Question 10 - Staged
  {
    question: "Slow fading margin (dB)",
    type: "staged",
    Stage1: { "NLOS": "S1_1", "LOS": "S1_2" },
    Stage2: { "RMa": "S2_A", "UMa": "S2_B", "UMi - Street Canyon": "S2_C", "InH - Office": "S2_D" },
    mapping: {
      "S1_1_S2_A": 8, "S1_1_S2_B": 6, "S1_1_S2_C": 7.82, "S1_1_S2_D": 8.03,
      "S1_2_S2_A": 4, "S1_2_S2_B": 4, "S1_2_S2_C": 4, "S1_2_S2_D": 3,
    },
  },
];

