import React from "react";
import { ActiveUsersParams, ActiveUsersResults, TrafficInputParams, TrafficServiceData } from "../../types/capacityTool";

interface ActiveUsersFormProps {
  params: ActiveUsersParams;
  results: ActiveUsersResults;
  trafficServices: TrafficServiceData;
  onParamsChange: (newParams: ActiveUsersParams) => void;
  onTrafficServiceChange: (serviceName: keyof TrafficServiceData, newTrafficParams: TrafficInputParams) => void;
  onCalculateActiveUsers: () => void;
  onCalculateTraffic: (serviceName: keyof TrafficServiceData) => void;
  onNext: () => void;
  onAskTraffic: (serviceName: keyof TrafficServiceData) => void; // To trigger modal or dedicated input UI
}

const activeUserFields = [
  { name: "totalPopulation", label: "Total Population:", type: "number" },
  { name: "mobilePenetration", label: "Mobile Penetration (%):", type: "number", step: "0.1" },
  { name: "operatorMarketShare", label: "Operator Market Share (%):", type: "number", step: "0.1" },
  { name: "bahu", label: "BHAU (Busy Hour Active Users %):", type: "number", step: "0.1" },
];

const trafficServiceFields: { name: keyof TrafficServiceData, label: string }[] = [
  { name: "voiceCall", label: "Voice Call" },
  { name: "browsing", label: "Browsing" },
  { name: "gaming", label: "Gaming" },
  { name: "streaming", label: "Streaming" },
];

const ActiveUsersForm: React.FC<ActiveUsersFormProps> = ({
  params,
  results,
  trafficServices,
  onParamsChange,
  onTrafficServiceChange,
  onCalculateActiveUsers,
  onCalculateTraffic,
  onNext,
  onAskTraffic,
}) => {
  const handleActiveUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onParamsChange({ ...params, [name]: value });
  };

  // This component will likely need a modal or separate input section for traffic details
  // For now, we just have buttons to trigger that interaction via onAskTraffic

  return (
    <div className="p-6 bg-white shadow-md rounded-lg mt-6">
      <h2 className="text-xl font-semibold text-purple-700 mb-4">Active Users & Per-Service Traffic Calculation</h2>

      {/* Active Users Calculation */}
      <div className="mb-6 border-b pb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Active Users</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {activeUserFields.map(field => (
            <div key={field.name}>
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                id={field.name}
                step={field.step || "1"}
                value={params[field.name as keyof ActiveUsersParams]}
                onChange={handleActiveUserChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              />
            </div>
          ))}
        </div>
        <button
          onClick={onCalculateActiveUsers}
          className="w-full sm:w-auto bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg shadow transition duration-300 mb-2"
        >
          Calculate Active Users
        </button>
        {results.activeUsers !== null && (
          <p className="text-md font-medium text-gray-800">Number of Active Users: <span className="font-bold text-green-600">{results.activeUsers.toFixed(2)}</span></p>
        )}
      </div>

      {/* Per-Service Traffic Calculation Placeholder */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Per-Service Traffic (Individual Calculation)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {trafficServiceFields.map(service => (
            <div key={service.name} className="p-3 border rounded-md">
              <p className="font-semibold text-gray-700 mb-2">{service.label} Traffic</p>
              <button
                onClick={() => onAskTraffic(service.name)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 rounded-md text-sm mb-2"
              >
                Enter {service.label} Data
              </button>
              {trafficServices[service.name].resultMbp !== null && (
                <p className="text-sm text-gray-700">{service.label} Traffic: <span className="font-semibold text-green-500">{trafficServices[service.name].resultMbp?.toFixed(2)} Mbp</span></p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={onNext}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow transition duration-300"
        >
          Next: Total Traffic Calculation
        </button>
      </div>
    </div>
  );
};

export default ActiveUsersForm;

