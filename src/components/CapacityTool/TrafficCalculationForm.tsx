import React from "react";
import { TotalTrafficParams, TotalTrafficResults } from "../../types/capacityTool";

interface TrafficCalculationFormProps {
  params: TotalTrafficParams;
  results: TotalTrafficResults;
  onParamsChange: (newParams: TotalTrafficParams) => void;
  onCalculateTotalTraffic: () => void;
  // activeUsers: number | null; // To be passed from parent or context
  // voiceCallTrafficMbp: number | null;
  // browsingTrafficMbp: number | null;
  // gamingTrafficMbp: number | null;
  // streamingTrafficMbp: number | null;
  // tSiteValue: number | null;
}

const totalTrafficFields = [
  { name: "voiceCallTrafficPercentage", label: "Voice Call Traffic (% Share):", type: "number", step: "0.1" },
  { name: "browsingTrafficPercentage", label: "Browsing Traffic (% Share):", type: "number", step: "0.1" },
  { name: "gamingTrafficPercentage", label: "Gaming Traffic (% Share):", type: "number", step: "0.1" },
  { name: "streamingTrafficPercentage", label: "Streaming Traffic (% Share):", type: "number", step: "0.1" },
];

const TrafficCalculationForm: React.FC<TrafficCalculationFormProps> = ({
  params,
  results,
  onParamsChange,
  onCalculateTotalTraffic,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onParamsChange({ ...params, [name]: value });
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg mt-6">
      <h2 className="text-xl font-semibold text-purple-700 mb-4">Total Traffic & Number of Sites Calculation</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {totalTrafficFields.map(field => (
          <div key={field.name}>
            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">{field.label}</label>
            <input
              type={field.type}
              name={field.name}
              id={field.name}
              step={field.step || "1"}
              value={params[field.name as keyof TotalTrafficParams]}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            />
          </div>
        ))}
      </div>
      <button
        onClick={onCalculateTotalTraffic}
        className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow transition duration-300 mb-4"
      >
        Calculate Total Traffic & Number of Sites
      </button>
      {results.totalTrafficMbps !== null && (
        <p className="text-md font-medium text-gray-800">Total Traffic: <span className="font-bold text-green-600">{results.totalTrafficMbps.toFixed(2)} Mbps</span></p>
      )}
      {results.numberOfSites !== null && (
        <p className="text-md font-medium text-gray-800">Number of Sites (based on capacity): <span className="font-bold text-green-600">{results.numberOfSites.toFixed(2)}</span></p>
      )}
    </div>
  );
};

export default TrafficCalculationForm;

