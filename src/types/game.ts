export type Player = 'black' | 'white';
export type PieceType = 'regular' | 'king';

export interface Piece {
  id: string;
  player: Player;
  type: PieceType;
  position: Position;
}

export interface Position {
  row: number;
  col: number;
}

export interface GameState {
  pieces: Piece[];
  currentPlayer: Player;
  selectedPiece: Piece | null;
  validMoves: Position[];
  gameOver: boolean;
  winner: Player | null;
  gameId: string | null;
}