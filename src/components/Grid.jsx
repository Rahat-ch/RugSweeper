// components/Grid.jsx
import React from 'react';
import Cell from './Cell';

const Grid = ({ grid, onCellClick, onCellRightClick }) => {
  return (
    <div className="inline-block">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((cell, cellIndex) => (
            <Cell
              key={cellIndex}
              cell={cell}
              onClick={onCellClick}
              onRightClick={onCellRightClick}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Grid;
