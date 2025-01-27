import React from 'react';
import { useGameStore } from '../store/gameStore';

const GameInfo: React.FC = () => {
  const { currentPlayer, gameOver, winner, pieces } = useGameStore();
  const blackPieces = pieces.filter(p => p.player === 'black').length;
  const whitePieces = pieces.filter(p => p.player === 'white').length;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-80">
      {gameOver ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-amber-900">Game Over!</h2>
          <p className="text-lg mb-4 text-amber-800">
            {winner ? `${winner.charAt(0).toUpperCase() + winner.slice(1)} wins!` : "It's a draw!"}
          </p>
          <div className="space-y-2 text-amber-700">
            <p>Final Score:</p>
            <div className="flex justify-between px-4">
              <span>Black: {blackPieces}</span>
              <span>White: {whitePieces}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-amber-900">Current Turn</h2>
          <div className={`
            w-8 h-8 rounded-full mx-auto mb-4
            ${currentPlayer === 'black' ? 'bg-gray-900' : 'bg-gray-100 border-2 border-gray-300'}
          `} />
          <p className="text-lg mb-4 text-amber-800">
            {currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s turn
          </p>
          <div className="space-y-2 text-amber-700">
            <p>Pieces Remaining:</p>
            <div className="flex justify-between px-4">
              <span>Black: {blackPieces}</span>
              <span>White: {whitePieces}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameInfo;