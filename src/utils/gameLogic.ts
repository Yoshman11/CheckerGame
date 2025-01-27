import { Piece, Position } from '../types/game';

export const getValidMoves = (piece: Piece, pieces: Piece[]): Position[] => {
  const captureMoves = getCaptureMoves(piece, pieces);
  if (captureMoves.length > 0) {
    return captureMoves;
  }
  return getRegularMoves(piece, pieces);
};

const getRegularMoves = (piece: Piece, pieces: Piece[]): Position[] => {
  const moves: Position[] = [];
  const { row, col } = piece.position;
  const directions = piece.type === 'king' 
    ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] 
    : piece.player === 'black' 
      ? [[1, -1], [1, 1]] 
      : [[-1, -1], [-1, 1]];

  for (const [rowDir, colDir] of directions) {
    if (piece.type === 'king') {
      let distance = 1;
      while (true) {
        const newRow = row + (rowDir * distance);
        const newCol = col + (colDir * distance);
        
        if (!isInBounds(newRow, newCol)) break;
        
        const pieceAtPosition = getPieceAt(newRow, newCol, pieces);
        if (pieceAtPosition) break;
        
        moves.push({ row: newRow, col: newCol });
        distance++;
      }
    } else {
      const newRow = row + rowDir;
      const newCol = col + colDir;
      
      if (isInBounds(newRow, newCol) && !getPieceAt(newRow, newCol, pieces)) {
        moves.push({ row: newRow, col: newCol });
      }
    }
  }

  return moves;
};

const getCaptureMoves = (piece: Piece, pieces: Piece[]): Position[] => {
  const moves: Position[] = [];
  const { row, col } = piece.position;
  const directions = piece.type === 'king' 
    ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] 
    : piece.player === 'black' 
      ? [[1, -1], [1, 1]] 
      : [[-1, -1], [-1, 1]];

  for (const [rowDir, colDir] of directions) {
    if (piece.type === 'king') {
      let distance = 1;
      let enemyFound = false;
      let enemyDistance = 0;
      
      while (true) {
        const newRow = row + (rowDir * distance);
        const newCol = col + (colDir * distance);
        
        if (!isInBounds(newRow, newCol)) break;
        
        const pieceAtPosition = getPieceAt(newRow, newCol, pieces);
        
        if (!enemyFound) {
          if (pieceAtPosition) {
            if (pieceAtPosition.player === piece.player) break;
            enemyFound = true;
            enemyDistance = distance;
          }
        } else {
          if (pieceAtPosition) break;
          moves.push({ row: newRow, col: newCol });
        }
        
        distance++;
      }
    } else {
      const jumpRow = row + (rowDir * 2);
      const jumpCol = col + (colDir * 2);
      const captureRow = row + rowDir;
      const captureCol = col + colDir;

      if (isInBounds(jumpRow, jumpCol)) {
        const capturedPiece = getPieceAt(captureRow, captureCol, pieces);
        const jumpSquare = getPieceAt(jumpRow, jumpCol, pieces);
        
        if (capturedPiece && 
            capturedPiece.player !== piece.player && 
            !jumpSquare) {
          moves.push({ row: jumpRow, col: jumpCol });
        }
      }
    }
  }

  return moves;
};

export const makeMove = (
  piece: Piece,
  to: Position,
  pieces: Piece[]
): { newPieces: Piece[], captured: Piece | null } => {
  const newPieces = pieces.filter(p => p.id !== piece.id);
  let captured: Piece | null = null;

  const rowDir = Math.sign(to.row - piece.position.row);
  const colDir = Math.sign(to.col - piece.position.col);
  const distance = Math.abs(to.row - piece.position.row);

  if (Math.abs(to.row - piece.position.row) !== Math.abs(to.col - piece.position.col)) {
    return { newPieces: pieces, captured: null };
  }

  if (piece.type === 'king') {
    let isValidMove = true;
    let capturedPieceIndex = -1;
    let enemyFound = false;

    for (let i = 1; i < distance; i++) {
      const checkRow = piece.position.row + (rowDir * i);
      const checkCol = piece.position.col + (colDir * i);
      const pieceAtPosition = newPieces.findIndex(p =>
        p.position.row === checkRow && p.position.col === checkCol
      );

      if (pieceAtPosition !== -1) {
        if (enemyFound || newPieces[pieceAtPosition].player === piece.player) {
          isValidMove = false;
          break;
        }
        enemyFound = true;
        capturedPieceIndex = pieceAtPosition;
      }
    }

    if (isValidMove) {
      if (capturedPieceIndex !== -1) {
        captured = newPieces[capturedPieceIndex];
        newPieces.splice(capturedPieceIndex, 1);
      }

      newPieces.push({
        ...piece,
        position: to
      });

      return { newPieces, captured };
    }
  } else {
    if (distance === 2) {
      const captureRow = piece.position.row + rowDir;
      const captureCol = piece.position.col + colDir;
      const capturedPieceIndex = newPieces.findIndex(p =>
        p.position.row === captureRow &&
        p.position.col === captureCol &&
        p.player !== piece.player
      );

      if (capturedPieceIndex !== -1) {
        captured = newPieces[capturedPieceIndex];
        newPieces.splice(capturedPieceIndex, 1);
      }
    } else if (distance !== 1) {
      return { newPieces: pieces, captured: null };
    }
  }

  newPieces.push({
    ...piece,
    position: to,
    type: shouldPromoteToKing(to.row, piece) ? 'king' : piece.type
  });

  return { newPieces, captured };
};

const isInBounds = (row: number, col: number): boolean => {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
};

const getPieceAt = (row: number, col: number, pieces: Piece[]): Piece | undefined => {
  return pieces.find(p => p.position.row === row && p.position.col === col);
};

const shouldPromoteToKing = (row: number, piece: Piece): boolean => {
  return (piece.player === 'black' && row === 7) || 
         (piece.player === 'white' && row === 0);
};