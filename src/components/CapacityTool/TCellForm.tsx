import React from 'react';
import { TCellParams, TCellResults } from '../../types/capacityTool';

interface TCellFormProps {
  params: TCellParams;
  results: TCellResults;
  onParamsChange: (newParams: TCellParams) => void;
  onCalculate: () => void;
  onNext: () => void;
}

const inputFields = [
  { name: 'carriers', label: 'Number of Carriers:', type: 'number' },
  { name: 'layers', label: 'Number of Layers:', type: 'number' },
  { name: 'scalingFactor', label: 'Scaling Factor:', type: 'number', step: '0.1' },
  { name: 'rbsSec', label: 'Number of RBs in sec:', type: 'number' },
  { name: 'resRb', label: 'Number of REs per RB:', type: 'number' },
  { name: 'bitsPerRe', label: 'Number of bits per RE:', type: 'number' },
  { name: 'codingRate', label: 'Coding Rate:', type: 'number', step: '0.01' },
  { name: 'cch', label: 'CCH (Control Channel Overhead %):', type: 'number', step: '0.01' },
  { name: 'q', label: 'Q (System Load %):', type: 'number', step: '0.01' },
  { name: 'numSectors', label: 'Number of Sectors:', type: 'number' },
];

const TCellForm: React.FC<TCellFormProps> = ({ params, results, onParamsChange, onCalculate, onNext }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onParamsChange({ ...params, [name]: value });
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold text-purple-700 mb-4">T-Cell and T-Site Calculation</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {inputFields.map(field => (
          <div key={field.name}>
            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">{field.label}</label>
            <input
              type={field.type}
              name={field.name}
              id={field.name}
              step={field.step || '1'}
              value={params[field.name as keyof TCellParams]}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            />
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
        <button
          onClick={onCalculate}
          className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow transition duration-300"
        >
          Calculate T-Cell & T-Site
        </button>
        <button
          onClick={onNext}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow transition duration-300"
        >
          Next: Active Users
        </button>
      </div>
      {results.tCellValue !== null && (
        <p className="text-md font-medium text-gray-800">T-Cell Value: <span className="font-bold text-green-600">{results.tCellValue.toFixed(6)} Mbps</span></p>
      )}
      {results.tSiteValue !== null && (
        <p className="text-md font-medium text-gray-800">T-Site Value: <span className="font-bold text-green-600">{results.tSiteValue.toFixed(6)} Mbps</span></p>
      )}
    </div>
  );
};

export default TCellForm;

