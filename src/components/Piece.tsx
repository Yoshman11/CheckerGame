import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Player, PieceType } from '../types/game';

interface PieceProps {
  id: string;
  player: Player;
  type: PieceType;
  isSelected: boolean;
  isDraggable: boolean;
}

const Piece: React.FC<PieceProps> = ({ id, player, type, isSelected, isDraggable }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled: !isDraggable
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 1000 : 1,
    opacity: isDragging ? 0.8 : 1,
    cursor: isDragging ? 'grabbing' : 'grab'
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        w-16 h-16 rounded-full
        ${player === 'black' ? 'bg-gray-900' : 'bg-gray-100 border-2 border-gray-300'}
        ${isSelected ? 'ring-4 ring-blue-500' : ''}
        ${isDraggable ? 'hover:opacity-80' : 'opacity-80 cursor-not-allowed'}
        flex items-center justify-center transition-colors
        shadow-lg
        ${type === 'king' ? 'after:content-["♔"] after:text-amber-500 after:text-3xl' : ''}
      `}
    />
  );
};

export default Piece;