import React, { useState, useCallback } from "react";
import {
  CapacityToolState,
  TCellParams,
  ActiveUsersParams,
  TrafficInputParams,
  TrafficServiceData,
  TotalTrafficParams,
  TotalTrafficResults,
  CapacityToolStep,
} from "../types/capacityTool";
import TCellForm from "../components/CapacityTool/TCellForm";
import ActiveUsersForm from "../components/CapacityTool/ActiveUsersForm";
import TrafficCalculationForm from "../components/CapacityTool/TrafficCalculationForm";

const initialTCellParams: TCellParams = {
  carriers: "", layers: "", scalingFactor: "", rbsSec: "",
  resRb: "", bitsPerRe: "", codingRate: "", cch: "", q: "", numSectors: "",
};

const initialActiveUsersParams: ActiveUsersParams = {
  totalPopulation: "", mobilePenetration: "", operatorMarketShare: "", bahu: "",
};

const initialTrafficInput: TrafficInputParams = { time: "", rate: "", dutyRatio: "" };
const initialTrafficServices: TrafficServiceData = {
  voiceCall: { ...initialTrafficInput, resultMbp: null },
  browsing: { ...initialTrafficInput, resultMbp: null },
  gaming: { ...initialTrafficInput, resultMbp: null },
  streaming: { ...initialTrafficInput, resultMbp: null },
};

const initialTotalTrafficParams: TotalTrafficParams = {
  voiceCallTrafficPercentage: "", browsingTrafficPercentage: "",
  gamingTrafficPercentage: "", streamingTrafficPercentage: "",
};

const initialState: CapacityToolState = {
  tCellParams: initialTCellParams,
  tCellResults: { tCellValue: null, tSiteValue: null },
  activeUsersParams: initialActiveUsersParams,
  activeUsersResults: { activeUsers: null },
  trafficServices: initialTrafficServices,
  totalTrafficParams: initialTotalTrafficParams,
  totalTrafficResults: { totalTrafficMbps: null, numberOfSites: null },
  currentStep: "T_CELL",
};

// --- Calculation Logic (mirrors Python script) ---

const calculateTCellValue = (params: TCellParams): number | null => {
  const carriers = parseInt(params.carriers);
  const layers = parseInt(params.layers);
  const scalingFactor = parseFloat(params.scalingFactor);
  const rbsSec = parseInt(params.rbsSec);
  const resRb = parseInt(params.resRb);
  const bitsPerRe = parseInt(params.bitsPerRe);
  const codingRate = parseFloat(params.codingRate);
  const cch = parseFloat(params.cch);

  if ([carriers, layers, scalingFactor, rbsSec, resRb, bitsPerRe, codingRate, cch].some(isNaN)) {
    return null;
  }
  return 10 ** (-6) * carriers * layers * scalingFactor * rbsSec * resRb * bitsPerRe * codingRate * (1 - cch / 100); // Assuming CCH is % in Python, adjust if it was decimal
};

const calculateTSiteValue = (tCellValue: number | null, qStr: string, numSectorsStr: string): number | null => {
  if (tCellValue === null) return null;
  const q = parseFloat(qStr);
  const numSectors = parseInt(numSectorsStr);
  if (isNaN(q) || isNaN(numSectors)) return null;
  return tCellValue * numSectors * (q / 100); // Assuming Q is % in Python
};

const calculateActiveUsersValue = (params: ActiveUsersParams): number | null => {
  const totalPopulation = parseFloat(params.totalPopulation);
  const mobilePenetration = parseFloat(params.mobilePenetration);
  const operatorMarketShare = parseFloat(params.operatorMarketShare);
  const bahu = parseFloat(params.bahu);

  if ([totalPopulation, mobilePenetration, operatorMarketShare, bahu].some(isNaN)) {
    return null;
  }
  return (totalPopulation * (mobilePenetration / 100) * (operatorMarketShare / 100) * (bahu / 100));
};

const calculateSingleTrafficService = (params: TrafficInputParams): number | null => {
  let time = parseFloat(params.time);
  let rate = parseFloat(params.rate);
  let dutyRatio = parseFloat(params.dutyRatio);

  if ([time, rate, dutyRatio].some(isNaN)) return null;
  dutyRatio *= 10 ** -2; // Multiply duty ratio by 10^-2 (from % to decimal)
  // Original Python: (((duty_ratio * time * rate) / (1 - 0.01)) * 10**-3)
  // Assuming (1 - 0.01) was a fixed factor, and 10**-3 for kbps to Mbps (if rate is kbps and time is min, needs care)
  // If rate is kbps and time is minutes, then (kbps * min * 60 sec/min) / (8 bits/byte * 1000 kbits/Mbit) = MBytes
  // The python formula seems to be (duty_ratio * time_min * rate_kbps) * (1/0.99) * 10^-3 = Mbp (Megabits per period?)
  // Let's assume the python formula is directly translated for now, but units need careful check for real-world accuracy.
  // The python output was Mbp, so let's assume it's Megabits for the period.
  return (((dutyRatio * time * rate) / (1 - 0.01)) * 10 ** -3);
};

const calculateTotalTrafficAndSites = (
  totalTrafficParams: TotalTrafficParams,
  activeUsers: number | null,
  trafficServices: TrafficServiceData,
  tSiteValue: number | null
): TotalTrafficResults => {
  if (activeUsers === null || tSiteValue === null) {
    return { totalTrafficMbps: null, numberOfSites: null };
  }

  const { voiceCallTrafficPercentage, browsingTrafficPercentage, gamingTrafficPercentage, streamingTrafficPercentage } = totalTrafficParams;
  const vP = parseFloat(voiceCallTrafficPercentage) / 100;
  const bP = parseFloat(browsingTrafficPercentage) / 100;
  const gP = parseFloat(gamingTrafficPercentage) / 100;
  const sP = parseFloat(streamingTrafficPercentage) / 100;

  const vT = trafficServices.voiceCall.resultMbp;
  const bT = trafficServices.browsing.resultMbp;
  const gT = trafficServices.gaming.resultMbp;
  const sT = trafficServices.streaming.resultMbp;

  if ([vP, bP, gP, sP].some(isNaN) || [vT, bT, gT, sT].some(val => val === null)) {
    return { totalTrafficMbps: null, numberOfSites: null };
  }

  const totalTraffic = (vP * activeUsers * vT! +
    bP * activeUsers * bT! +
    activeUsers * gP * gT! +
    activeUsers * sT! * sP) / 3600; // Python had / 3600

  const totalTrafficMbps = totalTraffic * (10 ** -2); // Python had * (10 ** -2)

  if (isNaN(totalTrafficMbps) || tSiteValue === 0) {
    return { totalTrafficMbps: totalTrafficMbps, numberOfSites: null };
  }

  const numberOfSites = totalTrafficMbps / tSiteValue;
  return { totalTrafficMbps, numberOfSites: isNaN(numberOfSites) ? null : numberOfSites };
};

// --- Component --- 
const CapacityToolPage: React.FC = () => {
  const [state, setState] = useState<CapacityToolState>(initialState);
  const [showTrafficModal, setShowTrafficModal] = useState<keyof TrafficServiceData | null>(null);
  const [currentTrafficInput, setCurrentTrafficInput] = useState<TrafficInputParams>(initialTrafficInput);

  const handleTCellParamsChange = useCallback((newParams: TCellParams) => {
    setState(prev => ({ ...prev, tCellParams: newParams }));
  }, []);

  const handleCalculateTCell = useCallback(() => {
    const tCellValue = calculateTCellValue(state.tCellParams);
    const tSiteValue = calculateTSiteValue(tCellValue, state.tCellParams.q, state.tCellParams.numSectors);
    setState(prev => ({ ...prev, tCellResults: { tCellValue, tSiteValue } }));
  }, [state.tCellParams]);

  const handleActiveUsersParamsChange = useCallback((newParams: ActiveUsersParams) => {
    setState(prev => ({ ...prev, activeUsersParams: newParams }));
  }, []);

  const handleCalculateActiveUsers = useCallback(() => {
    const activeUsers = calculateActiveUsersValue(state.activeUsersParams);
    setState(prev => ({ ...prev, activeUsersResults: { activeUsers } }));
  }, [state.activeUsersParams]);

  const handleAskTraffic = useCallback((serviceName: keyof TrafficServiceData) => {
    setCurrentTrafficInput(state.trafficServices[serviceName]); // Load current values if any
    setShowTrafficModal(serviceName);
  }, [state.trafficServices]);

  const handleTrafficModalInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentTrafficInput(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSaveTrafficService = useCallback(() => {
    if (!showTrafficModal) return;
    const resultMbp = calculateSingleTrafficService(currentTrafficInput);
    setState(prev => ({
      ...prev,
      trafficServices: {
        ...prev.trafficServices,
        [showTrafficModal]: { ...currentTrafficInput, resultMbp },
      },
    }));
    setShowTrafficModal(null);
  }, [currentTrafficInput, showTrafficModal]);

  const handleTotalTrafficParamsChange = useCallback((newParams: TotalTrafficParams) => {
    setState(prev => ({ ...prev, totalTrafficParams: newParams }));
  }, []);

  const handleCalculateTotalTraffic = useCallback(() => {
    const results = calculateTotalTrafficAndSites(
      state.totalTrafficParams,
      state.activeUsersResults.activeUsers,
      state.trafficServices,
      state.tCellResults.tSiteValue
    );
    setState(prev => ({ ...prev, totalTrafficResults: results }));
  }, [state.totalTrafficParams, state.activeUsersResults.activeUsers, state.trafficServices, state.tCellResults.tSiteValue]);

  const navigateToStep = (step: CapacityToolStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case "T_CELL":
        return (
          <TCellForm
            params={state.tCellParams}
            results={state.tCellResults}
            onParamsChange={handleTCellParamsChange}
            onCalculate={handleCalculateTCell}
            onNext={() => navigateToStep("ACTIVE_USERS")}
          />
        );
      case "ACTIVE_USERS":
        return (
          <ActiveUsersForm
            params={state.activeUsersParams}
            results={state.activeUsersResults}
            trafficServices={state.trafficServices}
            onParamsChange={handleActiveUsersParamsChange}
            onCalculateActiveUsers={handleCalculateActiveUsers}
            onAskTraffic={handleAskTraffic}
            onCalculateTraffic={() => { }} // Placeholder, direct calculation on save modal
            onTrafficServiceChange={() => { }} // Placeholder, direct calculation on save modal
            onNext={() => navigateToStep("TRAFFIC_CALCULATION")}
          />
        );
      case "TRAFFIC_CALCULATION":
        return (
          <TrafficCalculationForm
            params={state.totalTrafficParams}
            results={state.totalTrafficResults}
            onParamsChange={handleTotalTrafficParamsChange}
            onCalculateTotalTraffic={handleCalculateTotalTraffic}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 container mx-auto">
      <h1 className="text-3xl font-bold text-center text-purple-700 mb-8">5G Dimension Tool (Capacity)</h1>
      <div className="max-w-2xl mx-auto">
        {renderStep()}
        {state.currentStep !== "T_CELL" && (
          <button
            onClick={() => navigateToStep(state.currentStep === "TRAFFIC_CALCULATION" ? "ACTIVE_USERS" : "T_CELL")}
            className="mt-6 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow transition duration-300"
          >
            Back
          </button>
        )}
      </div>

      {/* Traffic Input Modal */}
      {showTrafficModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4 text-purple-700">Enter {showTrafficModal.replace(/([A-Z])/g, " $1").trim()} Traffic Data</h3>
            <div className="space-y-3 mb-4">
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700">Time (min):</label>
                <input type="number" name="time" id="time" value={currentTrafficInput.time} onChange={handleTrafficModalInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="rate" className="block text-sm font-medium text-gray-700">Rate (kbps):</label>
                <input type="number" name="rate" id="rate" value={currentTrafficInput.rate} onChange={handleTrafficModalInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="dutyRatio" className="block text-sm font-medium text-gray-700">Duty Ratio (%):</label>
                <input type="number" name="dutyRatio" id="dutyRatio" value={currentTrafficInput.dutyRatio} onChange={handleTrafficModalInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowTrafficModal(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md shadow-sm">Cancel</button>
              <button onClick={handleSaveTrafficService} className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md shadow-sm">Save Traffic Data</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CapacityToolPage;

