// src/components/RockPaperScissors.jsx
import React, { useState, useEffect } from 'react';

const choices = ['Rock', 'Paper', 'Scissors'];

const RockPaperScissors = ({ onComplete }) => {
  const [userChoice, setUserChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState(null);

  const handleUserChoice = (choice) => {
    const computerSelection = choices[Math.floor(Math.random() * choices.length)];
    setUserChoice(choice);
    setComputerChoice(computerSelection);
    determineResult(choice, computerSelection);
  };

  const determineResult = (user, computer) => {
    if (user === computer) {
      setResult("It's a Tie!");
    } else if (
      (user === 'Rock' && computer === 'Scissors') ||
      (user === 'Paper' && computer === 'Rock') ||
      (user === 'Scissors' && computer === 'Paper')
    ) {
      setResult('You Win!');
    } else {
      setResult('You Lose!');
    }
  };

  useEffect(() => {
    if (result !== null) {
      // Automatically close the modal after displaying the result
      const timer = setTimeout(() => {
        onComplete(result);
      }, 2000); // 2-second delay before closing

      return () => clearTimeout(timer);
    }
  }, [result, onComplete]);

  return (
    <div className="flex flex-col items-center">
      {!userChoice ? (
        <>
          <h2 id="modal-title" className="text-xl font-semibold mb-4 text-gray-800">Rock, Paper, Scissors</h2>
          <div className="flex space-x-4">
            {choices.map((choice) => (
              <button
                key={choice}
                onClick={() => handleUserChoice(choice)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                {choice}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex space-x-8 mb-4">
            <div className="flex flex-col items-center">
              <span className="text-lg font-medium text-gray-800">You Chose:</span>
              <span className="text-3xl">{userChoice === 'Rock' ? '✊' : userChoice === 'Paper' ? '✋' : '✌️'}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-medium text-gray-800">Computer Chose:</span>
              <span className="text-3xl">{computerChoice === 'Rock' ? '✊' : computerChoice === 'Paper' ? '✋' : '✌️'}</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-4 text-gray-800">{result}</h3>
          {/* Removed "Play Again" button to restrict to single playthrough */}
        </>
      )}
    </div>
  );
};

export default RockPaperScissors;
