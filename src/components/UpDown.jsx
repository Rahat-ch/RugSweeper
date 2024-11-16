// src/components/UpDown.jsx
import React from 'react';

const UpDown = ({ onComplete }) => {
  const handleSelection = (choice) => {
    // Log the user's choice (e.g., send to backend or update state)
    console.log(`User predicted Bitcoin will go: ${choice}`);
    // Pass the choice to the parent component
    onComplete(choice);
  };

  return (
    <div className="flex flex-col items-center">
      <h2 id="modal-title" className="text-xl font-semibold mb-4 text-gray-800">
        Bitcoin Prediction
      </h2>
      <p className="mb-6 text-gray-700">
        Do you predict Bitcoin will go <strong>Up</strong> or <strong>Down</strong>?
      </p>
      <div className="flex space-x-4">
        <button
          onClick={() => handleSelection('Up')}
          className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          Up 📈
        </button>
        <button
          onClick={() => handleSelection('Down')}
          className="px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Down 📉
        </button>
      </div>
    </div>
  );
};

export default UpDown;
