import { create } from 'zustand';
import axios from 'axios';
import { io } from 'socket.io-client';
import { GameState, Piece, Position } from '../types/game';
import { getValidMoves, makeMove } from '../utils/gameLogic';

const API_URL = '/api';
const socket = io(window.location.origin);

interface GameStore extends GameState {
  initializeGame: () => Promise<void>;
  selectPiece: (piece: Piece | null) => void;
  movePiece: (from: Position, to: Position) => Promise<void>;
  joinGame: (gameId: string) => void;
  leaveGame: () => void;
}

const initialPieces: Piece[] = [
  { id: 'b1', player: 'black', type: 'regular', position: { row: 0, col: 1 } },
  { id: 'b2', player: 'black', type: 'regular', position: { row: 0, col: 3 } },
  { id: 'b3', player: 'black', type: 'regular', position: { row: 0, col: 5 } },
  { id: 'b4', player: 'black', type: 'regular', position: { row: 0, col: 7 } },
  { id: 'b5', player: 'black', type: 'regular', position: { row: 1, col: 0 } },
  { id: 'b6', player: 'black', type: 'regular', position: { row: 1, col: 2 } },
  { id: 'b7', player: 'black', type: 'regular', position: { row: 1, col: 4 } },
  { id: 'b8', player: 'black', type: 'regular', position: { row: 1, col: 6 } },
  { id: 'b9', player: 'black', type: 'regular', position: { row: 2, col: 1 } },
  { id: 'b10', player: 'black', type: 'regular', position: { row: 2, col: 3 } },
  { id: 'b11', player: 'black', type: 'regular', position: { row: 2, col: 5 } },
  { id: 'b12', player: 'black', type: 'regular', position: { row: 2, col: 7 } },
  { id: 'w1', player: 'white', type: 'regular', position: { row: 5, col: 0 } },
  { id: 'w2', player: 'white', type: 'regular', position: { row: 5, col: 2 } },
  { id: 'w3', player: 'white', type: 'regular', position: { row: 5, col: 4 } },
  { id: 'w4', player: 'white', type: 'regular', position: { row: 5, col: 6 } },
  { id: 'w5', player: 'white', type: 'regular', position: { row: 6, col: 1 } },
  { id: 'w6', player: 'white', type: 'regular', position: { row: 6, col: 3 } },
  { id: 'w7', player: 'white', type: 'regular', position: { row: 6, col: 5 } },
  { id: 'w8', player: 'white', type: 'regular', position: { row: 6, col: 7 } },
  { id: 'w9', player: 'white', type: 'regular', position: { row: 7, col: 0 } },
  { id: 'w10', player: 'white', type: 'regular', position: { row: 7, col: 2 } },
  { id: 'w11', player: 'white', type: 'regular', position: { row: 7, col: 4 } },
  { id: 'w12', player: 'white', type: 'regular', position: { row: 7, col: 6 } }
];

export const useGameStore = create<GameStore>((set, get) => ({
  pieces: initialPieces,
  currentPlayer: 'black',
  selectedPiece: null,
  validMoves: [],
  gameOver: false,
  winner: null,
  gameId: null,

  initializeGame: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const { data } = await axios.post(`${API_URL}/games`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      set({
        pieces: data.board.pieces || initialPieces,
        currentPlayer: 'black',
        selectedPiece: null,
        validMoves: [],
        gameOver: false,
        winner: null,
        gameId: data._id
      });

      socket.emit('game.join', data._id);
    } catch (error) {
      console.error('Error initializing game:', error);
      set({
        pieces: initialPieces,
        currentPlayer: 'black',
        selectedPiece: null,
        validMoves: [],
        gameOver: false,
        winner: null,
        gameId: null
      });
    }
  },

  selectPiece: (piece: Piece | null) => {
    const { currentPlayer, pieces, gameOver } = get();
    
    if (gameOver || !piece || piece.player !== currentPlayer) {
      set({ selectedPiece: null, validMoves: [] });
      return;
    }

    const validMoves = getValidMoves(piece, pieces);
    set({ selectedPiece: piece, validMoves });
  },

  movePiece: async (from: Position, to: Position) => {
    const { pieces, currentPlayer, selectedPiece, gameId, gameOver } = get();
    
    if (gameOver || !selectedPiece || !gameId) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const { newPieces, captured } = makeMove(selectedPiece, to, pieces);
      
      const remainingBlackPieces = newPieces.filter(p => p.player === 'black').length;
      const remainingWhitePieces = newPieces.filter(p => p.player === 'white').length;
      const isGameOver = remainingBlackPieces === 0 || remainingWhitePieces === 0;
      const winner = remainingBlackPieces === 0 ? 'white' : remainingWhitePieces === 0 ? 'black' : null;

      set({
        pieces: newPieces,
        currentPlayer: currentPlayer === 'black' ? 'white' : 'black',
        selectedPiece: null,
        validMoves: []
      });

      if (isGameOver && winner) {
        setTimeout(() => {
          set(state => ({
            ...state,
            pieces: state.pieces.filter(p => p.player === winner),
            gameOver: true,
            winner
          }));
        }, 500);
      }

      const { data } = await axios.post(
        `${API_URL}/games/${gameId}/moves`,
        { from, to },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.board?.pieces) {
        const serverGameOver = data.status === 'completed';
        const serverWinner = data.winner ? (data.player1 === data.winner ? 'black' : 'white') : null;
        
        if (serverGameOver && serverWinner) {
          setTimeout(() => {
            set(state => ({
              ...state,
              pieces: data.board.pieces.filter((p: Piece) => p.player === serverWinner),
              gameOver: true,
              winner: serverWinner
            }));
          }, 500);
        }
      }

      socket.emit('game.move', {
        gameId,
        move: { from, to },
        pieces: data.board?.pieces || newPieces
      });
    } catch (error) {
      console.error('Error making move:', error);
      set({
        pieces,
        currentPlayer,
        selectedPiece: null,
        validMoves: []
      });
    }
  },

  joinGame: (gameId: string) => {
    socket.emit('game.join', gameId);
  },

  leaveGame: () => {
    const { gameId } = get();
    if (gameId) {
      socket.emit('game.leave', gameId);
    }
  }
}));