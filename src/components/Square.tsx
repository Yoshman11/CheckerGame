import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Position } from '../types/game';

interface SquareProps {
  position: Position;
  isBlack: boolean;
  isValidMove: boolean;
  children?: React.ReactNode;
}

const Square: React.FC<SquareProps> = ({ position, isBlack, isValidMove, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: JSON.stringify(position)
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        w-20 h-20 flex items-center justify-center relative
        ${isBlack ? 'bg-amber-900' : 'bg-amber-100'}
        ${isValidMove && isOver ? 'after:absolute after:inset-0 after:bg-green-500 after:opacity-30' : ''}
        ${isValidMove ? 'after:absolute after:inset-0 after:bg-blue-500 after:opacity-10' : ''}
      `}
    >
      {children}
    </div>
  );
};

export default Square;