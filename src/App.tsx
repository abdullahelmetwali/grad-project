import React, { useState } from 'react';
import './App.css';
import CapacityToolPage from './pages/CapacityToolPage';
import LinkBudgetToolPage from './pages/LinkBudgetToolPage';

function App() {
  const [currentPage, setCurrentPage] = useState<'capacity' | 'linkbudget' | 'selection'>('selection');

  const renderPage = () => {
    if (currentPage === 'capacity') {
      return <CapacityToolPage />;
    }
    if (currentPage === 'linkbudget') {
      return <LinkBudgetToolPage />;
    }
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold text-purple-700 mb-8">5G Planning Tools</h1>
        <div className="space-y-4 md:space-y-0 md:space-x-4 flex flex-col md:flex-row">
          <button 
            onClick={() => setCurrentPage('capacity')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
          >
            5G Dimension Tool (Capacity)
          </button>
          <button 
            onClick={() => setCurrentPage('linkbudget')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
          >
            5G Network Planning Tool (Link Budget)
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      {currentPage !== 'selection' && (
        <button 
          onClick={() => setCurrentPage('selection')}
          className="absolute top-4 left-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg shadow transition duration-300"
        >
          Back to Selection
        </button>
      )}
      {renderPage()}
    </div>
  );
}

export default App;

