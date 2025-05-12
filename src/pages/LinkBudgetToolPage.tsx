import React, { useState, useCallback, useEffect } from "react";
import {
  LinkBudgetToolState,
  LinkBudgetQuestion,
  LinkBudgetAnswer,
  LinkBudgetQuestionSimple,
  LinkBudgetQuestionStaged,
} from "../types/linkBudgetTool";
import { linkBudgetQuestionsData } from "./linkBudgetData"; // Store questions data here

// --- Helper Functions & Initial State ---
const initialState: LinkBudgetToolState = {
  questions: [] as LinkBudgetQuestion[],
  currentQuestionIndex: 0,
  currentStageSelection: null,
  stage1SelectedKey: null,
  pathLoss: 0,
  answers: [],
  finalPathLoss: null,
  radiusR: null,
  selectedSiteType: null,
  numberOfSites: null,
  calculationStarted: false,
  showFinalCalculations: false,
};

const LinkBudgetToolPage: React.FC = () => {
  const [state, setState] = useState<LinkBudgetToolState>(initialState);

  const currentQuestion = state.questions[state.currentQuestionIndex];

  const resetToQuestion = (index: number) => {
    // Recalculate pathLoss up to the question before index
    let newPathLoss = 0;
    const newAnswers: LinkBudgetAnswer[] = [];
    for (let i = 0; i < index; i++) {
      const answer = state.answers.find(a => a.questionIndex === i);
      if (answer) {
        newAnswers.push(answer);
        if (typeof answer.selectedValue === "number") {
          newPathLoss += answer.selectedValue;
        } else {
          // This case is for staged questions where the value is derived from mapping
          // Need to re-fetch the mapped value if it was a staged question
          const q = state.questions[i] as LinkBudgetQuestionStaged;
          if (q.type === "staged" && answer.stage1SelectedValue && answer.selectedValue) {
            const combinedKey = `${answer.stage1SelectedValue}_${answer.selectedValue}`;
            newPathLoss += q.mapping[combinedKey] || 0;
          }
        }
      }
    }
    setState(prev => ({
      ...initialState, // Reset most things
      questions: prev.questions, // Keep questions data
      calculationStarted: true, // Keep calculation started
      currentQuestionIndex: index,
      pathLoss: newPathLoss,
      answers: newAnswers,
    }));
  };

  const handleStartCalculation = () => {
    setState(prev => ({ ...prev, calculationStarted: true, currentQuestionIndex: 0, pathLoss: 0, answers: [] }));
  };

  const handleSelectOption = (value: number | string, optionText?: string) => {
    if (!currentQuestion) return;

    let newPathLoss = state.pathLoss;
    let newAnswers = [...state.answers];
    const existingAnswerIndex = newAnswers.findIndex(a => a.questionIndex === state.currentQuestionIndex);

    if (existingAnswerIndex !== -1) {
      // If an answer for this question already exists, we are re-answering it.
      // Reset path loss and answers from this point forward.
      resetToQuestion(state.currentQuestionIndex);
      // After reset, state.pathLoss and state.answers are updated, so re-fetch for current calculation
      newPathLoss = state.pathLoss;
      newAnswers = [...state.answers];
    }

    let currentAnswer: LinkBudgetAnswer;

    if (currentQuestion.type === "simple") {
      if (typeof value !== "number") return; // Should be a number for simple
      newPathLoss += value;
      currentAnswer = { questionIndex: state.currentQuestionIndex, selectedValue: value };
      setState(prev => ({
        ...prev,
        pathLoss: newPathLoss,
        answers: [...newAnswers, currentAnswer],
        currentStageSelection: null,
        stage1SelectedKey: null,
      }));
    } else if (currentQuestion.type === "staged") {
      if (typeof value !== "string") return; // Should be a string (key) for staged

      if (state.currentStageSelection === null || state.currentStageSelection === "Stage1") {
        // Selecting Stage 1 option
        currentAnswer = { questionIndex: state.currentQuestionIndex, selectedValue: "", stage1SelectedValue: value }; // Store Stage1 key
        setState(prev => ({
          ...prev,
          currentStageSelection: "Stage2",
          stage1SelectedKey: value, // value is like "Stage1_A"
          // pathLoss remains unchanged until Stage 2 is selected
          answers: [...newAnswers, currentAnswer] // Temporarily add with empty selectedValue
        }));
        return; // Wait for stage 2 selection
      } else if (state.currentStageSelection === "Stage2" && state.stage1SelectedKey) {
        // Selecting Stage 2 option
        const combinedKey = `${state.stage1SelectedKey}_${value}`; // value is like "Stage2_X"
        const mappedValue = currentQuestion.mapping[combinedKey];
        if (typeof mappedValue === "number") {
          newPathLoss += mappedValue;
          // Update the temporary answer for stage1 with the final mapped value and stage2 key
          const tempAnswerIndex = newAnswers.findIndex(a => a.questionIndex === state.currentQuestionIndex && a.stage1SelectedValue === state.stage1SelectedKey);
          if (tempAnswerIndex !== -1) {
            newAnswers[tempAnswerIndex] = { ...newAnswers[tempAnswerIndex], selectedValue: value }; // value is stage2 key
          } else { // Should not happen if stage1 was selected correctly
            newAnswers.push({ questionIndex: state.currentQuestionIndex, selectedValue: value, stage1SelectedValue: state.stage1SelectedKey });
          }
          currentAnswer = newAnswers[tempAnswerIndex];
        }
        setState(prev => ({
          ...prev,
          pathLoss: newPathLoss,
          answers: newAnswers,
          currentStageSelection: null, // Reset for next question
          stage1SelectedKey: null,
        }));
      }
    }
    // Auto-advance after a full selection (simple or stage2)
    if (state.currentQuestionIndex < state.questions.length - 1) {
      // setState(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1, currentStageSelection: null, stage1SelectedKey: null }));
    } else {
      // All questions answered, prepare for final calculations
      setState(prev => ({ ...prev, showFinalCalculations: true }));
    }
  };

  const handleNextQuestion = () => {
    if (state.currentQuestionIndex < state.questions.length - 1) {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        currentStageSelection: null,
        stage1SelectedKey: null,
      }));
    } else if (!state.showFinalCalculations) {
      // Last question answered, move to final calculation display
      setState(prev => ({ ...prev, showFinalCalculations: true }));
    }
  };

  const handlePreviousQuestion = () => {
    if (state.showFinalCalculations) {
      setState(prev => ({ ...prev, showFinalCalculations: false, selectedSiteType: null, numberOfSites: null, radiusR: null, finalPathLoss: null }));
      // No change in currentQuestionIndex, stays at last question
      return;
    }
    if (state.currentQuestionIndex > 0) {
      const prevQuestionIndex = state.currentQuestionIndex - 1;
      resetToQuestion(prevQuestionIndex);
    }
  };

  const handleSelectSiteType = (siteType: "Sector Site" | "Omni site") => {
    if (state.finalPathLoss === null) return; // Should not happen

    // Calculate R based on finalPathLoss (which includes adjustments)
    // Original Python: R = 10 ** ((self.path_loss - 221) / 22)
    // Assuming self.path_loss in Python at this stage is state.finalPathLoss
    const R = 10 ** ((state.finalPathLoss - 221) / 22);
    let coverageArea;
    if (siteType === "Sector Site") {
      coverageArea = 1.949 * (R ** 2);
    } else { // Omni site
      coverageArea = 2.598 * (R ** 2);
    }
    const N = 5000 / coverageArea; // Assuming 5000 is a constant area like in Python

    setState(prev => ({
      ...prev,
      selectedSiteType: siteType,
      radiusR: R,
      numberOfSites: N,
    }));
  };

  useEffect(() => {
    if (state.showFinalCalculations && state.finalPathLoss === null) {
      // Apply final adjustments only once when showFinalCalculations becomes true
      const noiseFigure = 7; // dB
      const thermalNoisePower = 100.9897; // dBm
      const adjustedPathLoss = state.pathLoss + noiseFigure + thermalNoisePower;
      setState(prev => ({ ...prev, finalPathLoss: adjustedPathLoss }));
    }
  }, [state.showFinalCalculations, state.pathLoss, state.finalPathLoss]);


  if (!state.calculationStarted) {
    return (
      <div className="p-4 container mx-auto text-center">
        <h1 className="text-3xl font-bold text-indigo-700 mb-6">5G Link Budget Calculation Process</h1>
        <button
          onClick={handleStartCalculation}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg text-xl transition duration-300"
        >
          Start Calculation
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 container mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">5G Network Planning Tool (Link Budget)</h1>

      {/* Question Display Area */}
      {!state.showFinalCalculations && currentQuestion && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-indigo-600 mb-3">
            Question {state.currentQuestionIndex + 1} / {state.questions.length}:
          </h2>
          <p className="text-lg text-gray-800 mb-4">
            {currentQuestion.type === "staged" && state.currentStageSelection === "Stage2"
              ? `Stage 2: ${currentQuestion.question}`
              : currentQuestion.question}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {currentQuestion.type === "simple" && Object.entries(currentQuestion.options).map(([text, val]) => (
              <button key={text} onClick={() => handleSelectOption(val.toString(), text)} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-md shadow transition duration-150">
                {text}
              </button>
            ))}
            {currentQuestion.type === "staged" &&
              ((state.currentStageSelection === null || state.currentStageSelection === "Stage1") ?
                Object.entries(currentQuestion.Stage1).map(([text, keyVal]) => (
                  <button key={text} onClick={() => handleSelectOption(keyVal.toString(), text)} className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-md shadow transition duration-150">
                    {text}
                  </button>
                )) :
                Object.entries(currentQuestion.Stage2).map(([text, keyVal]) => (
                  <button key={text} onClick={() => handleSelectOption(keyVal.toString(), text)} className="bg-teal-500 hover:bg-teal-600 text-white py-2 px-3 rounded-md shadow transition duration-150">
                    {text}
                  </button>
                )))
            }
          </div>
        </div>
      )}

      {/* Result Display Area */}
      <div className="bg-gray-100 shadow-inner rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-3">Current Calculation Summary:</h3>
        <p className="text-lg text-gray-800">Accumulated Path Loss: <span className="font-bold text-red-600">{state.pathLoss.toFixed(2)} dB</span></p>
        {state.showFinalCalculations && state.finalPathLoss !== null && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-gray-600 my-2">Note: 7dB (noise figure) and 100.9897 dBm (thermal noise power) are added to the Path Loss for receiver noise characteristics.</p>
            <p className="text-lg text-gray-800">Final Adjusted Path Loss: <span className="font-bold text-red-700">{state.finalPathLoss.toFixed(2)} dB</span></p>
            {state.radiusR !== null && (
              <p className="text-lg text-gray-800 mt-1">Calculated Radius (R): <span className="font-bold text-blue-600">{state.radiusR.toFixed(2)} km (approx)</span></p>
            )}
          </div>
        )}
      </div>

      {/* Final Calculation Steps (Site Type, Number of Sites) */}
      {state.showFinalCalculations && state.finalPathLoss !== null && !state.selectedSiteType && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-indigo-600 mb-3">Select Site Type:</h3>
          <div className="flex space-x-4">
            <button onClick={() => handleSelectSiteType("Sector Site")} className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-md shadow transition duration-150">Sector Site</button>
            <button onClick={() => handleSelectSiteType("Omni site")} className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-md shadow transition duration-150">Omni Site</button>
          </div>
        </div>
      )}
      {state.selectedSiteType && state.numberOfSites !== null && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-md">
          <p className="text-xl font-bold">Estimated Number of Sites ({state.selectedSiteType}): <span className="text-2xl">{Math.ceil(state.numberOfSites)}</span></p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={handlePreviousQuestion}
          disabled={state.currentQuestionIndex === 0 && !state.showFinalCalculations}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg shadow disabled:opacity-50 transition duration-150"
        >
          Back
        </button>
        {!state.showFinalCalculations && state.currentQuestionIndex < state.questions.length && (
          <button
            onClick={handleNextQuestion}
            // Disable if staged question is awaiting stage 2, or if it is the last question and already handled by selectOption
            disabled={currentQuestion?.type === "staged" && state.currentStageSelection === "Stage1" || (state.currentQuestionIndex === state.questions.length - 1 && state.answers.length === state.questions.length)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg shadow disabled:opacity-50 transition duration-150"
          >
            {state.currentQuestionIndex === state.questions.length - 1 ? "Show Final Calculations" : "Next Question"}
          </button>
        )}
      </div>
    </div>
  );
};

export default LinkBudgetToolPage;

