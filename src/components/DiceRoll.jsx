// src/components/DiceRoll.jsx
import React, { useEffect, useState } from 'react';

const DiceRoll = ({ onComplete }) => {
  const [currentNumber, setCurrentNumber] = useState(1);
  const [isRolling, setIsRolling] = useState(true);

  useEffect(() => {
    if (isRolling) {
      const interval = setInterval(() => {
        setCurrentNumber(Math.floor(Math.random() * 6) + 1);
      }, 100); // Change number every 100ms

      const timeout = setTimeout(() => {
        clearInterval(interval);
        const finalNumber = Math.floor(Math.random() * 6) + 1;
        setCurrentNumber(finalNumber);
        setIsRolling(false);
        onComplete(finalNumber);
      }, 2000); // Roll for 2 seconds

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isRolling, onComplete]);

  return (
    <div className="flex flex-col items-center">
      <h2 id="modal-title" className="text-xl font-semibold mb-4 text-gray-800">Dice Roll</h2>
      <div className="w-24 h-24 mb-4 flex items-center justify-center bg-white border-4 border-gray-800 rounded-lg shadow-lg text-5xl font-bold text-gray-800">
        {currentNumber}
      </div>
      {isRolling ? (
        <div className="text-lg font-medium text-gray-800">Rolling the dice...</div>
      ) : (
        <div className="text-lg font-medium text-gray-800">You rolled a {currentNumber}!</div>
      )}
    </div>
  );
};

export default DiceRoll;
