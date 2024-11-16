// components/Cell.jsx
import React from 'react';

// Mapping of events to their respective emojis
const EVENT_EMOJIS = {
  bomb: '💣',
  coin_flip: '🪙',
  up_down: '⬆️',
  rock_paper_scissors: '✂️', // You can choose '🪨' or '📄' if preferred
  nothing: '', // No emoji for 'nothing', leave it blank or choose a default emoji
  dice_roll: '🎲',
};

const Cell = ({ cell, onClick, onRightClick }) => {
  const handleClick = () => {
    onClick(cell);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    onRightClick(cell);
  };

  let content = '';
  let cellStyle = 'w-8 h-8 border border-gray-400 flex items-center justify-center cursor-pointer select-none';

  if (cell.isRevealed) {
    cellStyle += ' bg-gray-200 cursor-default';
    if (cell.event === 'bomb') {
      content = EVENT_EMOJIS.bomb;
    } else if (cell.event !== 'nothing') {
      content = EVENT_EMOJIS[cell.event] || '';
    } else {
      content = cell.neighborMines > 0 ? cell.neighborMines : '';
    }
  } else {
    cellStyle += ' bg-gray-500';
    if (cell.isFlagged) {
      content = '🚩';
    }
  }

  return (
    <div
      className={cellStyle}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {content}
    </div>
  );
};

export default Cell;
