import React from 'react';
import { DndContext, DragEndEvent, useSensor, useSensors, MouseSensor, DragStartEvent } from '@dnd-kit/core';
import Square from './Square';
import Piece from './Piece';
import { useGameStore } from '../store/gameStore';
import { Position } from '../types/game';

const Board: React.FC = () => {
  const { pieces, currentPlayer, selectedPiece, validMoves, selectPiece, movePiece } = useGameStore();
  const sensors = useSensors(useSensor(MouseSensor));

  const handleDragStart = (event: DragStartEvent) => {
    const pieceId = event.active.id as string;
    const piece = pieces.find(p => p.id === pieceId);
    if (piece && piece.player === currentPlayer) {
      selectPiece(piece);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!active || !over) return;

    const pieceId = active.id as string;
    const piece = pieces.find(p => p.id === pieceId);
    const toPosition = JSON.parse(over.id as string) as Position;

    if (piece && piece.player === currentPlayer) {
      const isValidMove = validMoves.some(
        move => move.row === toPosition.row && move.col === toPosition.col
      );

      if (isValidMove) {
        await movePiece(piece.position, toPosition);
      }
    }
  };

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-8 gap-0 border-4 border-amber-900 rounded-lg overflow-hidden w-[640px] h-[640px] bg-amber-50">
        {Array.from({ length: 8 }, (_, row) => (
          Array.from({ length: 8 }, (_, col) => {
            const isBlack = (row + col) % 2 === 1;
            const piece = pieces.find(p => p.position.row === row && p.position.col === col);
            const isValidMove = validMoves.some(move => move.row === row && move.col === col);

            return (
              <Square
                key={`${row}-${col}`}
                position={{ row, col }}
                isBlack={isBlack}
                isValidMove={isValidMove}
              >
                {piece && (
                  <Piece
                    id={piece.id}
                    player={piece.player}
                    type={piece.type}
                    isSelected={selectedPiece?.id === piece.id}
                    isDraggable={piece.player === currentPlayer}
                  />
                )}
              </Square>
            );
          })
        ))}
      </div>
    </DndContext>
  );
};

export default Board;