// src/components/Game.jsx
import React, { useState, useEffect } from 'react';
import Grid from './Grid';
import Modal from './Modal';
import CoinFlip from './CoinFlip';
import RockPaperScissors from './RockPaperScissors';
import DiceRoll from './DiceRoll';
import UpDown from './UpDown'; // Import UpDown component

// Define possible events
const EVENTS = [
  'bomb',
  'coin_flip',
  'up_down',
  'rock_paper_scissors',
  'dice_roll',
  'nothing',
];

// Mapping of events to their respective emojis
const EVENT_EMOJIS = {
  bomb: '💣',
  coin_flip: '🪙',
  up_down: '↕️',
  rock_paper_scissors: '✂️', // Choose based on preference
  dice_roll: '🎲',
  nothing: '', // No emoji for 'nothing'
};

// Function to randomly select an event
const getRandomEvent = () => {
  const randomIndex = Math.floor(Math.random() * EVENTS.length);
  return EVENTS[randomIndex];
};

// Function to create the initial grid
const createEmptyGrid = (rows, cols) => {
  const grid = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const event = getRandomEvent();
      row.push({
        x: r,
        y: c,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
        event: event, // Event assigned to the cell
      });
    }
    grid.push(row);
  }
  return grid;
};

// Function to calculate the number of neighboring bombs for each cell
const calculateNeighborMines = (grid) => {
  const rows = grid.length;
  const cols = grid[0].length;

  const directions = [
    [-1, -1], [-1, 0], [-1, +1],
    [0, -1],          [0, +1],
    [+1, -1], [+1, 0], [+1, +1],
  ];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].event === 'bomb') {
        grid[r][c].neighborMines = -1; // Indicate bomb
        continue;
      }
      let count = 0;
      directions.forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (
          nr >= 0 &&
          nr < rows &&
          nc >= 0 &&
          nc < cols &&
          grid[nr][nc].event === 'bomb'
        ) {
          count++;
        }
      });
      grid[r][c].neighborMines = count;
    }
  }

  return grid;
};

const Game = () => {
  const rows = 10;
  const cols = 10;

  const [grid, setGrid] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [eventResult, setEventResult] = useState(null);

  // Initialize the grid when the component mounts or restarts
  const initializeGrid = () => {
    let newGrid = createEmptyGrid(rows, cols);
    newGrid = calculateNeighborMines(newGrid);
    setGrid(newGrid);
    setGameOver(false);
    setMessage('');
    setIsModalOpen(false);
    setCurrentEvent(null);
    setEventResult(null);
  };

  useEffect(() => {
    initializeGrid();
  }, []);

  // Function to handle the completion of an event's modal
  const handleEventComplete = (result) => {
    setEventResult(result);
    setIsModalOpen(false); // Close the modal after event completes
    // Implement additional logic based on the event result here
    // For example, display a message or update game state
    if (currentEvent === 'rock_paper_scissors') {
      setMessage(`✂️ Rock, Paper, Scissors Result: ${result}`);
    } else if (currentEvent === 'coin_flip') {
      setMessage(`🪙 Coin Flip Result: ${result}`);
    } else if (currentEvent === 'dice_roll') {
      setMessage(`🎲 You rolled a ${result}!`);
    } else if (currentEvent === 'up_down') {
      setMessage(`↕️ Bitcoin Prediction: You predicted it will go ${result}.`);
      // Further logic based on prediction can be added here
    }
  };

  // Function to reveal only the clicked cell
  const revealCell = (cell) => {
    if (gameOver || cell.isRevealed || cell.isFlagged) return;

    const newGrid = grid.map(row => row.map(c => ({ ...c })));
    newGrid[cell.x][cell.y].isRevealed = true;

    const clickedCell = newGrid[cell.x][cell.y];

    // Handle different events
    switch (clickedCell.event) {
      case 'bomb':
        setGameOver(true);
        setMessage('💥 Boom! You clicked on a rug. Game Over!');
        // Reveal all bombs
        newGrid.forEach(row => row.forEach(c => {
          if (c.event === 'bomb') c.isRevealed = true;
        }));
        break;

      case 'coin_flip':
        setCurrentEvent('coin_flip');
        setIsModalOpen(true);
        setMessage(`🪙 Coin Flip occurred!`);
        break;

      case 'rock_paper_scissors':
        setCurrentEvent('rock_paper_scissors');
        setIsModalOpen(true);
        setMessage(`✂️ Rock, Paper, Scissors event!`);
        break;

      case 'dice_roll':
        setCurrentEvent('dice_roll');
        setIsModalOpen(true);
        setMessage(`🎲 Dice Roll event!`);
        break;

      case 'up_down':
        setCurrentEvent('up_down');
        setIsModalOpen(true);
        setMessage(`↕️ Bitcoin Prediction event!`);
        break;

      case 'nothing':
      default:
        if (clickedCell.neighborMines > 0) {
          setMessage(`Number of neighboring rugs: ${clickedCell.neighborMines}`);
        } else {
          setMessage(`Nothing happened.`);
        }
        break;
    }

    setGrid(newGrid);
  };

  // Function to flag or unflag a cell
  const flagCell = (cell) => {
    if (gameOver || cell.isRevealed) return;

    const newGrid = grid.map(row => row.map(c => ({ ...c })));
    newGrid[cell.x][cell.y].isFlagged = !newGrid[cell.x][cell.y].isFlagged;
    setGrid(newGrid);
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Rug Sweeper</h1>
      {gameOver && <div className="mb-2 text-red-600 font-semibold">{message}</div>}
      {!gameOver && message && <div className="mb-2 text-blue-600">{message}</div>}
      <Grid
        grid={grid}
        onCellClick={revealCell}
        onCellRightClick={flagCell}
      />
      <button
        onClick={initializeGrid}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Restart
      </button>

      {/* Modal for Events */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {currentEvent === 'coin_flip' && (
          <CoinFlip onComplete={(result) => {
            handleEventComplete(result);
          }} />
        )}
        {currentEvent === 'rock_paper_scissors' && (
          <RockPaperScissors onComplete={(result) => {
            handleEventComplete(result);
          }} />
        )}
        {currentEvent === 'dice_roll' && (
          <DiceRoll onComplete={(result) => {
            handleEventComplete(result);
          }} />
        )}
        {currentEvent === 'up_down' && (
          <UpDown onComplete={(result) => {
            handleEventComplete(result);
          }} />
        )}
        {/* Add more event components here as needed */}
      </Modal>
    </div>
  );
};

export default Game;
