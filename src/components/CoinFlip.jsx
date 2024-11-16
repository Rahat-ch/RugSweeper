// components/CoinFlip.jsx
import React, { useEffect, useState } from 'react';

const CoinFlip = ({ onComplete }) => {
  const [result, setResult] = useState(null);
  const [isFlipping, setIsFlipping] = useState(true);

  useEffect(() => {
    // Start the flip animation
    const flipDuration = 2000; // 2 seconds
    const timer = setTimeout(() => {
      const outcome = Math.random() < 0.5 ? 'Heads' : 'Tails';
      setResult(outcome);
      setIsFlipping(false);
      onComplete(outcome);
    }, flipDuration);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center">
      <div className="w-24 h-24 mb-4">
        <div
          className={`w-full h-full rounded-full border-4 border-gray-400 flex items-center justify-center text-4xl transition-transform duration-2000 ${
            isFlipping ? 'animate-flip' : ''
          }`}
        >
          🪙
        </div>
      </div>
      {isFlipping ? (
        <div className="text-xl font-semibold">Flipping...</div>
      ) : (
        <div className="text-xl font-semibold">
          {result === 'Heads' ? 'Heads 🪙' : 'Tails 🪙'}
        </div>
      )}
    </div>
  );
};

export default CoinFlip;
